
// TODO: this is still hardcoded to map.map where map was ContaoMap.Map but now the implementation's map is needed.
function LayerSwitcherMapControl(map)
{
	this.map = map;
	this.control=Element('div', {'class':"geo_layer_switcher_control"});
	this.container=Element('div', {'class':"geo_layer_switcher_container"});
	toggler=Element('div', {'class':'layer_toggler'});
	arrow=Element('img', {src:'http://maps.gstatic.com/intl/de_ALL/mapfiles/down-arrow.gif'});
	toggler.innerHTML='Layer';
	toggler.appendChild(arrow);
	this.control.appendChild(this.container);
	this.container.appendChild(toggler);
	this.itemcontainer=Element('div', {'class':'layer_toggler_items'});
	this.container.appendChild(this.itemcontainer);
	var me=this;
	me.setVisible=function(state){this.itemcontainer.setStyle('display', state?'block':'none');};
	toggler.addEvent('click', (function() {this.setVisible(this.itemcontainer.getStyle('display')=='block'?false:true);}).bind(this));
	ContaoMapping.Map.addClassEvent('layeradded', this.layerAdded.bind(this));
	google.maps.event.addListener(this.map.map, 'click', function(){me.setVisible(false);});
	for(var i=0;i<map.layers.length;i++)
		this.layerAdded(map.layers[i]);
	map.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.container);
}

LayerSwitcherMapControl.prototype.layerAdded = function (map, layer)
{
	if(map!=this.map)
		return;
	var button=document.getElementById('geo_layer_switcher_'+this.map.id+'_'+layer.id);
	if(!button)
	{
		button = Element('div', {id:'geo_layer_switcher_'+this.map.id+'_'+layer.id, 'class':'geo_layer_switcher'});
		button.innerHTML=layer.name;
		button.addEvent('click', function() {layer.toggle();});
		this.itemcontainer.appendChild(button);
	}
};