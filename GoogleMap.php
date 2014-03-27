<?php if (!defined('TL_ROOT')) die('You can not access this file directly!');

/**
 * PHP version 5
 * @copyright  Cyberspectrum 2012
 * @author     Christian Schiffler <c.schiffler@cyberspectrum.de>
 * @package    ContaoMaps
 * @license    LGPL
 * @filesource
 */

/**
 * Class GoogleMap
 *
 * @copyright  Cyberspectrum 2009
 * @author     Christian Schiffler <c.schiffler@cyberspectrum.de>
 * @package    Controller
 */
class GoogleMap extends ContaoMap
{
	/**
	 * Initialize the object with given parameters.
	 * @param array $arrData optional base information for this layer.
	 */
	public function __construct($arrData=array())
//	public function __construct($name, $id='')
	{
		parent::__construct($arrData);
		$this->driver = 'Google';

		// initialize everything to sane values.
		$this->zoom = 7;
		$this->sensor = false;
		$this->params = '';
		$this->zoomcontrol = 'none';
		$this->mapcontrol = 'none';
		$this->view = 'normal';
		$this->views = array('normal');
		$this->layerswitch = false;

		$this->setKeys($arrData, array('zoom', 'sensor', 'scrollwheel', 'params', 'styles', 'zoomcontrol', 'mapcontrol', 'view', 'views', 'layerswitch'));

/*
		// add map params.
		// TODO: does this still work?
		if($objMap->params)
			$this->params .= str_replace('map.', $this->name . '.', str_replace('&#40;', '(', str_replace('&#41;', ')', str_replace('&#61;', '=', trim($objMaps->params)))));
*/
	}

	public function __set($key, $value)
	{
		switch($key)
		{
			case 'zoom':
			case 'sensor':
			case 'params':
			case 'styles':
			case 'zoomcontrol':
			case 'mapcontrol':
			case 'view':
			case 'views':
			case 'layerswitch':
			case 'scrollwheel':
				$this->arrOther[$key] = deserialize($value);
			break;

			default:
				parent::__set($key, $value);
			break;
		}
	}

	public function __get($key)
	{
		switch($key)
		{
			case 'zoom':
			case 'sensor':
			case 'params':
			case 'styles':
			case 'zoomcontrol':
			case 'mapcontrol':
			case 'view':
			case 'views':
			case 'layerswitch':
			case 'scrollwheel':
				return array_key_exists($key, $this->arrOther) ? $this->arrOther[$key] : NULL;

			default:
				return parent::__get($key);
			break;
		}
	}

	public function writeOptionsToTemplate(Template $objTemplate)
	{
		parent::writeOptionsToTemplate($objTemplate);
		foreach(array('zoom', 'sensor', 'scrollwheel', 'params', 'styles', 'zoomcontrol', 'mapcontrol', 'view', 'views', 'layerswitch') as $key)
			$objTemplate->$key=$this->$key;
	}

	public function jsonMapOptions()
	{
		$mapinfo='';
		foreach(array('id' => 'name', 'zoom'=>'zoom','zoomControl'=>'zoomcontrol','center'=>'center','view'=>'view','aviews'=>'views','viewcontrol'=>'mapcontrol','params'=>'params','styles'=>'styles', 'centerOnUser' => 'sensor', 'url' => 'ajaxUrl', 'layerswitch' => 'layerswitch', 'loadinganimation' => 'loadinganimation') as $k=>$v)
		{
			if(!is_null($this->$v))
				$v=deserialize($this->$v);
			if(is_float($v))
				$v = floatval($v);
			elseif(is_numeric($v))
				$v = intval($v);
			if($v)
			{
				//quickfox for handling zoomcontrol
				if ($k == 'zoomControl') {
					$v = ($v == 'none') ? false : true;
				}
				//prevent double json_encoding
				if ($k == 'styles') {
					$v = json_decode($v);
				}
				$mapinfo.=(strlen($mapinfo) ? ',':'').$k.':'.json_encode($v);
			}
				
		}
		
		//quickfox for handling zoomcontrol options.This needs some optimisation as well as the zoomcontrol itself
		if ($this->zoomcontrol != 'none')
		{
			$mapinfo.=(strlen($mapinfo) ? ',':'').'zoomControlOptions'.':{style:google.maps.ZoomControlStyle.'.strtoupper($this->zoomcontrol).'}';
		}
		//quickfix for scrollwheel
		if ($this->scrollwheel )
		{
			$mapinfo.=(strlen($mapinfo) ? ',':'').'scrollwheel: false';
		}
		
		$additional=$_GET;
		if(count($_GET))
			$mapinfo.=(strlen($mapinfo) ? ',':'').'additionalparams:'.json_encode($additional);
		return '{'.$mapinfo.'}';
	}

	public function collectAll()
	{
		if(count($this->layerIds))
		{
			$objLayer=\Database::getInstance()->prepare('SELECT * FROM tl_googlemaplayer WHERE id IN ('.implode(',',$this->layerIds).')')->execute();
			while($objLayer->next())
			{
				$layer = $objLayer->row();
				$layer['jsid'] = $objLayer->alias?$objLayer->alias:$objLayer->type.'.'.$objLayer->id;
				$strClass=$GLOBALS['CONTAOMAP_MAPLAYERS'][$objLayer->type];
				if(!$strClass)
					throw new Exception('No class defined for map layer type '.$objLayer->type);
				$objCollector = new $strClass($layer);
				$this->addLayer($objCollector);
				$objCollector->setModule($this);
				$objCollector->assembleObjects($this->knownIds[$objCollector->jsid]);
			}
		}
	}

	public function getHeadTags()
	{
		$arrHead=array_merge_recursive(parent::getHeadTags(), array
		(
			'css' => array('system/modules/contaomaps_google/html/map.css'),
		));
		// google must be before our library.
		array_insert($arrHead['js'], 0, 'http://maps.google.com/maps/api/js?language='.$GLOBALS['objPage']->language.'&amp;sensor='.($this->sensor ? 'true' : 'false'));
		return $arrHead;
	}

	public function getJavascript()
	{
		global $objPage;

		$arrRes= array();

		$arrHeads = $this->getHeadTags();

		foreach($arrHeads['css'] as $css)
		{
			$arrRes[] = sprintf('<link rel="stylesheet" type="text/css" href="%s" media="screen" />', $css);
		}

		foreach($arrHeads['js'] as $js)
		{
			$arrRes[] = sprintf('<script type="text/javascript" src="%s"></script>', $js);
		}

		$arrRes[] = $this->compileJavaScript();

		return $arrRes;
	}

	/**
	 * Generate the map contents as XML and return it.
	 */
	public function getAjaxXML()
	{
		if(\Input::get('area'))
			$this->setArea(\Input::get('area'));
		$this->collectAll();
		return $this->compileCustomIcons();
	}

	/**
	 * Generate the map and return it.
	 */
	public function getMap($addJavascriptToHead=false)
	{
		$javascript=$this->getJavascript();
		if($addJavascriptToHead)
		{
			foreach($javascript as $script)
				$GLOBALS['TL_HEAD'][] = $script;
		}
		$this->getTemplateForOutput();
		return array
			(
				'javascript' => $javascript,
				'content' => $this->Template->parse(),
			);
	}
}

?>