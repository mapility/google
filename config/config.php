<?php if (!defined('TL_ROOT')) die('You can not access this file directly!');

/**
 * PHP version 5
 * @copyright  Cyberspectrum 2012
 * @author     Christian Schiffler <c.schiffler@cyberspectrum.de>
 * @package    ContaoMaps
 * @license    LGPL
 * @filesource
 */


$GLOBALS['CONTAOMAP_MAPDRIVERS']['google'] = 'GoogleMap';

/**
 * Google bindings.
 */
$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/marker.js'] = array(
	'system/modules/contaomaps/js/marker.js',
	'system/modules/contaomaps_google/js/infobubble.js'
);
$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/polygon.js'] = array(
	'system/modules/contaomaps/js/polygon.js'
);
$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/polyline.js'] = array(
	'system/modules/contaomaps/js/polyline.js'
);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/layer.js'] = array(
	'system/modules/contaomaps/js/layer.js',
	'system/modules/contaomaps_google/js/markermanager.js'
);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/markermanager.js'] = array(
	'system/modules/contaomaps_google/js/marker.js'
);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/markerclusterer.js'] = array(
	'system/modules/contaomaps_google/js/marker.js'
);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/map.js'] = array(
	'system/modules/contaomaps/js/map.js'
);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/gmaphelpers.js'] = array(
	'system/modules/contaomaps/js/base.js',
	'system/modules/contaomaps_google/js/map.js'
	);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/map.zoom.js'] = array(
	'system/modules/contaomaps_google/js/map.js'
	);

$GLOBALS['CONTAOMAP_JSLIBS']['system/modules/contaomaps_google/js/infobubble.js'] = array();

?>