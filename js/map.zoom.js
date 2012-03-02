(function(){

ContaoMapping.MapZoomMapControl=function(map)
{
	function copyStyle(from, to) {
		var f=from.style;var t=to.style;
		for (var i=f.length; i-->0;)
		{
			var n=f[i];
			t.setProperty(n, f.getPropertyValue(n), priority=f.getPropertyPriority(n));
		}
	}

	// TODO: check if zoom is enabled in map at all.
	this.map = map;
	this.control=Element('div', {'class':"mapfullscreen_control"});
	this.maximized=false;
	this.keeper=Element('div');
	var toggler=Element('a', {'class':'mapfullscreen_toggler'});
	this.control.appendChild(toggler);
	toggler.addEvent('click', (function() {
		if(this.maximized)
		{
			copyStyle(this.keeper, this.map.container);
			toggler.removeClass('active');
			this.map.container.style.setProperty('z-index', 0, null);
			this.maximized=false;
		} else {
			copyStyle(this.map.container, this.keeper);
			var s=this.map.container.style;
			var clientsize = window.getSize();
			s.setProperty('position', 'fixed', null);
			s.setProperty('top', '0', null);
			s.setProperty('left', '0', null);
			s.setProperty('width', clientsize.x+'px', null);
			s.setProperty('height', clientsize.y+'px', null);
			s.setProperty('z-index', 10, null);
			toggler.addClass('active');
			this.maximized=true;
		}
		var center=this.map.getCenter();
		google.maps.event.trigger(map.getNative(), 'resize');
		this.map.setCenter(center);
	}).bind(this));
	map.getNative().controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.control);
};

ContaoMapping.Map.Google.addClassEvent('initialize', ContaoMapping.MapZoomMapControl);

})();