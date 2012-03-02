(function(){

ContaoMapping.Polyline.Google = new ContaoMapping.Class({
	Extends: ContaoMapping.Polygon,
	$polyline:null,
	initialize: function(map, options)
	{
		this.parent(map, options);
		this.createPoly();
		this.fireClassEvent('initialize', [this]);
	},

	createPoly:function()
	{
		if(this.getNative() == null)
		{
			var points = [], input_points=this.options.points;
			for(var i=0;i<input_points.length;i++)
			{
				var p1=input_points[i];
				points.push(new google.maps.LatLng(p1[0], p1[1]));
			}
			var options = {
				geodesic: true,
				path: points,
				strokeColor: this.options.strokecolor,
				strokeOpacity: this.options.strokeopacity,
				strokeWeight: this.options.strokeweight
			};
			var zindex=parseInt(this.options.zindex?this.options.zindex:this.getMap().zIndex);
			if(zindex)
				options.zIndex=zindex;
			this.$polyline = new google.maps.Polyline(options);
		}
		this.show();
		return this;
	},

	getNative: function()
	{
		return this.$polyline;
	},

	hide:function()
	{
		this.getNative().setMap(null);
	},
	show:function()
	{
		this.getNative().setMap(this.getMap().getNative());
	},

	setMap:function(map)
	{
		this.map=map;
		if(this.polyline == null)
		{
			var points = [];
			var len = 0;
			var altitudeDirty=false, altitudes=[];
			for(var i=0;i<this.options.points.length;i++)
			{
				var p1=this.options.points[i], p2;
				var p=new google.maps.LatLng(p1[0], p1[1]);
				if(p2)
					len+=p.distanceTo(p2);
				points.push(p);
				p2=p;
				altitudes.push(p1[2]?parseFloat(p1[2]):0);
				if(!p1[2])
					altitudeDirty=true;
			}
			if(!altitudeDirty)
				this.setAltitudes(altitudes);
			this.points=points;
			this.length=len;
			var options = {
				geodesic: true,
				path: points,
				strokeColor: this.options.strokecolor,
				strokeOpacity: this.options.strokeopacity,
				strokeWeight: this.options.strokeweight
			};
			var zindex=parseInt(this.options.zindex?this.options.zindex:map.options.zIndex);
			if(zindex)
				options.zIndex=zindex;
			this.polyline = new google.maps.Polyline(options);
		}
		this.polyline.setMap(map?map.map:null);
		this.fireClassEvent('setMap', [this]);
		return this;
	},

	getAltitudes: function(callback)
	{
		if(this.options.altitudes && callback)
		{
			callback(this.options.altitudes);
			return;
		}
		if(this.map)
		{
			var points=[];
			this.polyline.getPath().forEach(function(p){points.push(p);});
			this.map.getElevation(points, (function(results){this.setAltitudes(results); if(callback)callback(results);}).bind(this));
		}
	},

	setAltitudes: function(results)
	{
		this.options.altitudes=results;
	},

	getClosestPointTo: function(latLng)
	{
		var point=0;
		var distance=8000; // keep this big
		this.points.each(function(l, i, a){var d=latLng.distanceTo(l);if(d<distance){distance=d;point=i;}});
		return {point:this.points[point], index:point};
	}
});

})();