(function(){

ContaoMapping.Layer.Google = new ContaoMapping.Class({
	Extends: ContaoMapping.Layer,
	Implements: [Options, Events],
	options: {},
	layer: null,

	initialize: function(map, options) {
		this.parent(map, options);
		this.layer=new ContaoMapLayer_();
		if(options.mgrtype=='markerclusterer')
			this.createMarkerClusterer();
		 else
		 	this.createMarkerManager();
		this.hidden=false;
	},

	getGoogleMap: function()
	{
		return this.getMap().getNative();
	},

	add: function(obj)
	{
		this.parent(obj);
		// marker has been added to layer, publish to manager.
		if(instanceOf(obj, ContaoMapping.Marker))
		{
			if(this.mc)
				this.mc.addMarker(obj.getNative());
			if(this.mgr && this.mgr.ready)
				this.mgr.addMarker(obj.getNative(), 1);
		}
	},

	remove: function(obj)
	{
		this.parent(obj);
		// object has been removed from layer.
		if(instanceOf(obj, ContaoMapping.Marker))
		{
			obj.getNative();
		}
	},

	getMarkers: function(id)
	{
		return this.objects.filter(function(obj){
			return instanceOf(obj, ContaoMapping.Marker);
		});
	},

	createMarkerManager: function()
	{
//		if(typeof(MarkerManager)=='undefined')
//			return ContaoMapping.dynLoad.addLib({src:sBaseHref + 'system/modules/googlemaps/html/markermanager'+(map_debug?'':'_packed')+'.js',
//				callback:(function(){this.createMarkerManager();}).bind(this)});
		this.mgr = new MarkerManager(this.getGoogleMap(), {trackMarkers: true});
		layer=this;
		// we have to prevent a race condition as the marker manager is lazy initialized and sends an ready event.
		google.maps.event.addListener(this.mgr, 'loaded', (function() {
			this.mgr.ready=true;
			var markers=this.getMarkers();
			for(var i=0;i<markers.length;i++)
				this.mgr.addMarker(markers[i].getNative(), 1);
		}).bind(this));
	},

	createMarkerClusterer: function()
	{
		if(typeof(MarkerClusterer)=='undefined')
			return ContaoMapping.dynLoad.addLib({src:sBaseHref + 'system/modules/googlemaps/html/markerclusterer'+(map_debug?'':'_packed')+'.js',
				callback:(function(){this.createMarkerClusterer();}).bind(this)});

		// we have to enhance the MarkerClusterer as in v1.0 it does not contain hide() and show()
		if(MarkerClusterer.prototype.hide==undefined)
		{
			MarkerClusterer.prototype.hide=function()
			{
				this.clearMarkers();
			};
		};
		if(MarkerClusterer.prototype.show==undefined)
		{
			MarkerClusterer.prototype.show=function()
			{
				m=[];
				this.layer.getMarkers().each(function(e){m.push(e.getNative());});
				this.addMarkers(m);
				this.redraw();
			};
		};
		if(this.options.markerclusterer)
			opts=this.options.markerclusterer;
		else
			opts={gridSize: 50, maxZoom: 12};
		this.mc = new MarkerClusterer(this.getGoogleMap(), [], opts);
		this.mc.layer=this;

		var markers=this.getMarkers();
		for(var i=0;i<markers.length;i++)
			this.mc.addMarker(markers[i].getNative());
	},

	isHidden:function(){return this.hidden;},

	visibilityChanged:function(){
		google.maps.event.trigger(this.map, 'visibilitychanged', this);
	},

	draw: function() {
		this.layer.draw();
	},

	hide:function(){
		if(this.hidden)
			return this;
		this.polygons.each(function(p){p.hide();});
		this.polylines.each(function(p){p.hide();});
		if(this.mc)
			this.mc.hide();
		else if(this.mgr)
			this.mgr.hide();
		this.hidden=true;
		this.visibilityChanged();
		return this;
	},
	show:function(){
		if(!this.hidden)
			return this;
		this.polygons.each(function(p){p.show();});
		this.polylines.each(function(p){p.show();});
		if(this.mc)
			this.mc.show();
		else if(this.mgr)
			this.mgr.show();
		this.hidden=false;
		this.visibilityChanged();
		return this;
	},
	toggle:function(){
		if(this.hidden)
			this.show();
		else
			this.hide();
		return this;
	},

	addMarker:function(marker)
	{
		marker.setMap(this.map);
		this.markers.push(marker);
		if(!this.isHidden())
		{
			if(this.mc)
				this.mc.addMarker(marker.marker);
			if(this.mgr && this.mgr.ready)
				this.mgr.addMarker(marker.marker, 1);
		}
		return this;
	},
	removeMarker:function(marker)
	{
		if(this.mc)
			this.mc.removeMarker(marker.marker);
		if(this.mgr)
			this.mgr.removeMarker(marker.marker, 1);
		arrDelete(this.markers, marker);
		marker.setMap(null);
		return this;
	},
	getMarker: function(id)
	{
		// check all markers if it has the given id.
		for(var i=0;i<this.markers.length;i++)
		{
			if(this.markers[i].id==id)
			{
				return this.markers[i];
			}
		}
		return null;
	},
	addPolygon:function(polygon){
		this.polygons.push(polygon);
		if(!this.isHidden())
			polygon.setMap(this.map);
		return this;
	},
	removePolygon:function(polygon){
		if(arrDelete(this.polygons,polygon))
		{
			if(!this.isHidden())
				polygon.setMap(null);
		}
		return this;
	},
	getPolygon: function(id)
	{
		// check all polygons if it has the given id.
		for(var i=0;i<this.polygons.length;i++)
		{
			if(this.polygons[i].id==id)
			{
				return this.polygons[i];
			}
		}
		return null;
	},
	addPolyline:function(polyline){
		this.polylines.push(polyline);
		if(!this.isHidden())
			polyline.setMap(this.map);
		return this;
	},
	removePolyline:function(polyline){
		if(arrDelete(this.polylines,polyline))
		{
			if(!this.isHidden())
				polyline.setMap(null);
		}
		return this;
	},
	getPolyline: function(id)
	{
		// check all polylines if it has the given id.
		for(var i=0;i<this.polylines.length;i++)
		{
			if(this.polylines[i].id==id)
			{
				return this.polylines[i];
			}
		}
		return null;
	},
});

})();
