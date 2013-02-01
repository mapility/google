(function(){

ContaoMapping.Marker.Google = new ContaoMapping.Class({
	Extends: ContaoMapping.Marker,
	$marker:null,

	initialize: function(map, options)
	{
		this.parent(map, options);
		this.createMarker();
	},

	getGMap: function()
	{
		return this.getMap().getNative();
	},

	getNative: function()
	{
		return this.$marker;
	},

	createMarker:function()
	{
		if(this.getNative() == null)
		{
	/*			shadow: new google.maps.MarkerImage('http://www.google.com/mapfiles/marker.png',
							new google.maps.Size(37, 32),
							new google.maps.Point(0,0),
							new google.maps.Point(0, 32)),
	*/			//shape: {coord: [1, 1, 1, 20, 18, 20, 18 , 1], type: 'poly'},
			var url, img, size, pos;
			if(this.options.icon)
			{
				url = this.options.icon;
				size = this.options.iconsize?this.options.iconsize.split(','):null;
				pos = this.options.iconposition?this.options.iconposition.split(','):null;
			} else {
				url = 'http://www.google.com/mapfiles/marker_yellow.png';
				//size = [20,32];
				//pos = [0,32];
			}
			if(size && pos)
			{
				img = new google.maps.MarkerImage(
							/*url*/url,
							/*size*/new google.maps.Size(size[0], size[1]),
							/*origin*/new google.maps.Point(0,0),
							/*anchor*/new google.maps.Point(pos[0], pos[1])
							/*scaledsize*/
						);
			} else {
				img = new google.maps.MarkerImage(url);
			}
			var options = {
				position : new google.maps.LatLng(this.options.latitude, this.options.longitude),
				map : null, //map.map,
				icon : img,
				// HACK: work around bug in canvas based rendering in maps v3.
				// See: http://stackoverflow.com/questions/11845916/google-maps-marker-zindex-doesnt-work-for-two-icon-types-symbol-and-string
				optimized: false
			};
			var zindex=parseInt(this.options.zindex?this.options.zindex:this.getMap().options.zIndex);
			if(zindex)
				options.zIndex=zindex;
			this.$marker = new google.maps.Marker(options);
			this.getNative().contaoMarker=this;
			if(this.options.infotext)
			{
				this.createInfoBubble();
				if(this.options.autoinfo)
				{
					this.openInfoBubble();
				}
			}
		}
		return this;
	},

	createInfoBubble: function()
	{
		google.maps.event.addListener(this.getNative(), 'click', this.openInfoBubble.bind(this));
	},

	openInfoBubble: function()
	{
		if (!this.infoBubble)
		{
			var infopos = this.options.infoposition?this.options.infoposition.split(','):[200,200];
			this.infoBubble = new InfoBubble({map: this.getGMap(),
											maxWidth: 300,
											position: new google.maps.LatLng(this.options.latitude+infopos[0], this.options.longitude+infopos[1]),
											content: this.options.infotext
											});
			this.infoBubble.setBackgroundClassName('infobubble');
			google.maps.event.addListener(this.infoBubble, 'closeclick', this.closeInfoBubble.bind(this));
		}
		if(!this.infoBubble.isOpen())
		{
			if(this.getMap().infobubble)
			{
				this.getMap().infobubble.closeInfoBubble();
			}
			this.getMap().savePosition();

			this.infoBubble.open();
			this.getMap().infobubble = this;
		}
	},

	closeInfoBubble: function()
	{
		if(this.getMap().infobubble==this)
		{
			this.infoBubble.close();
			this.getMap().revertPosition();
			this.getMap().infobubble = null;
		}
	},

	// obsolete, move to data driver or get rid of it.
	generateXML:function(){
		p=this.marker.getPosition();
		data=this.options;
		data.infotext=null;
		data.latitude=String(p.lat());
		data.longitude=String(p.lng());
		return xmlenc('marker', xmlencode(this.infotext), data);
	}
});

})();
