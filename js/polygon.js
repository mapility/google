(function(){

ContaoMapping.Polygon.Google = new ContaoMapping.Class({
	Extends: ContaoMapping.Polygon,
	$polygon:null,
	initialize: function(map, options)
	{
		this.parent(map, options);
		this.createPoly();
	},
	createPoly:function()
	{
		if(this.getNative() == null)
		{
			var points = new google.maps.MVCArray();
			for(var i=0;i<this.options.points.length;i++)
			{
				points.push(new google.maps.LatLng(this.options.points[i][0], this.options.points[i][1]));
			}
			var options = {
				paths: new google.maps.MVCArray([points]),
				strokeColor: this.options.strokecolor,
				strokeOpacity: this.options.strokeopacity,
				strokeWeight: this.options.strokeweight,
				fillColor: this.options.fillcolor,
				fillOpacity: this.options.fillopacity,
				geodesic: true,
				map: this.getMap().getNative()
			};
			var zindex=parseInt(this.options.zindex?this.options.zindex:this.getMap().zIndex);
			if(zindex)
				options.zIndex=zindex;
			this.$polygon = new google.maps.Polygon(options);
		}
		this.show();
		return this;
	},

	getNative: function()
	{
		return this.$polygon;
	},

	hide:function()
	{
		this.getNative().setMap(null);
	},
	show:function()
	{
		this.getNative().setMap(this.getMap().getNative());
	}
});

})();
