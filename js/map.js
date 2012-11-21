(function(){

ContaoMapping.Map.Google = new ContaoMapping.Class({
	Extends: ContaoMapping.Map,
	Implements: [Options, Events],
	$googlemap:null,
	controls:[],
	options:{},
/*
	icons:{
		normal: google.maps.DEFAULT_ICON,
		high:'http://www.google.com/mapfiles/marker_yellow.png',
		dragging:'http://www.google.com/mapfiles/dir_60.png',
	},
*/
	options: {
	  zoom: 8,
	  disableDefaultUI: true,
	  view: null,
	  center:null,
	  zIndex: 5
	},
	initialize: function(container, options)
	{
		this.lookupViews={
			'normalmap':google.maps.MapTypeId.ROADMAP,
			'satellitemap':google.maps.MapTypeId.SATELLITE,
			'hybridmap':google.maps.MapTypeId.HYBRID,
			'physicalmap':google.maps.MapTypeId.TERRAIN
		};
		this.lookupControls={
			'normal': google.maps.MapTypeControlStyle.DEFAULT,
			'menu': google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			'hierarchical': google.maps.MapTypeControlStyle.HORIZONTAL_BAR
		};
		this.lookupZoom={
			'android': google.maps.NavigationControlStyle.ANDROID,
			'small': google.maps.NavigationControlStyle.SMALL,
			'large': google.maps.NavigationControlStyle.ZOOM_PAN
		};
		if(options.center.length == 1)
			options.center=options.center[0].split(',');

		this.parent(container, options);
	},

	getImplementationType: function()
	{
		return 'Google';
	},

	createNative: function()
	{
		this.options.mapTypeId = this.lookupViews[this.options.view] ? this.lookupViews[this.options.view] : google.maps.MapTypeId.ROADMAP;
		this.options.center=((typeof(this.options.center)=='string')?this.options.center.split(','):this.options.center);
		var foo=this.options.center.constructor.toString().indexOf("Array");
		if((this.options.center.constructor.toString().indexOf("Array") == -1) || !(this.options.center.length==2))
		{
			alert('Improper center given.');
		}
		this.options.center = new google.maps.LatLng(this.options.center[0], this.options.center[1]);
		this.options.zoom = 1*this.options.zoom;
		this.options.mapTypeControlOptions = {mapTypeIds:[]};
		for(var p in this.lookupViews)
		{
			if(in_array(p, this.options.aviews))
			{
				this.options.mapTypeControlOptions.mapTypeIds.push(this.lookupViews[p]);
			}
		}
		this.options.mapTypeControl = (this.options.viewcontrol != undefined);
		if(this.options.mapTypeControl)
		{
			this.options.mapTypeControlOptions.style = google.maps.MapTypeControlStyle.DEFAULT;
			for(var p in this.lookupControls)
			{
				if(p==this.options.viewcontrol)
				{
					this.options.mapTypeControlOptions.style=this.lookupControls[p];
					break;
				}
			}
		}
		if(this.options.zoomcontrol!=undefined){
			this.options.navigationControl= true;
			for(var p in this.lookupZoom){if(p==this.options.zoomcontrol){this.options.navigationControlOptions ={style:this.lookupZoom[p]};break;}}
		}
		// now create the real map
		if(typeof(this.container)=='string')this.container=$$("#"+this.container)[0];
		this.$googlemap = new google.maps.Map(this.container, this.options);
		if(this.options.centerOnUser)
		{
			this.getGeolocation(this.setCenter.bind(this), function(){alert('I can not determine where you are... I apologize.');});
		}
		if(this.options.layerswitch)
		{
			map=this;
			var createSwitch = function()
			{
				map.controls.push(new LayerSwitcherMapControl(map));
			};
			if(typeof(LayerSwitcherMapControl)=='undefined')
				ContaoMapping.dynLoad.addLib(true, {src:sBaseHref +'system/modules/googlemaps/html/layerswitch.js', callback: createSwitch});
			else
				createSwitch();
		}
		this.fireClassEvent('createMap', [this]);

//		google.maps.event.addListener(this.map, 'bounds_changed', this.contaomap.boundsChanged.bind(this.contaomap));
		var me=this;
		google.maps.event.addListener(this.getNative(), 'idle', function()
		{
			if (me.isMapDragging)
			{
				me.idleSkipped = true;
				return;
			}
			me.idleSkipped = false;
			me.boundsChanged();
		});
		google.maps.event.addListener(this.getNative(), 'dragstart', function()
		{
			me.isMapDragging = true;
		});
		google.maps.event.addListener(this.getNative(), 'dragend', function()
		{
			me.isMapDragging = false;
			if(me.idleSkipped == true)
			{
				me.boundsChanged();
				me.idleSkipped = false;
			}
		});
		google.maps.event.addListener(this.getNative(), 'bounds_changed', function()
		{
			me.idleSkipped = false;
		});
	},

	getNative: function()
	{
		return this.$googlemap;
	},

	getExtendedBoundsAsUrl: function()
	{
		var bounds=this.getNative().getBounds();

		var test=bounds.toUrlValue();

		return bounds.extendBoundsByRatio(.5).toUrlValue();
	},

	setCenter: function(location)
	{
		this.getNative().setCenter(new google.maps.LatLng(location[0], location[1]));
		return this;
	},

	getCenter: function()
	{
		var p=this.getNative().getCenter();
		return [p.lat(), p.lng()];
	},

	panTo: function(location)
	{
		this.getNative().panTo(new google.maps.LatLng(location[0], location[1]));
		return this;
	},

	getElevation: function(points, callback)
	{
		if(!this.elevator)
			this.elevator = new google.maps.ElevationService();
		var getPoints=function(min,amount){return points.filter(function(e,i){return (i>=min)&&(i<min+amount);});
		};
		var chunksize=300;
		var ele=[];
		var index=0;
		var map=this;
		var cb=null;
		while(ele.length<points.length)ele.push(0);
		var fetchNext=(function()
		{
			var mypoints;
			var cb=null;
			// if we have more than -chunksize- points, we hit the limit.... chunk them if so.
			if(points.length>chunksize)
			{
				mypoints=getPoints(index,chunksize);
				cb=(points.length>index+chunksize)?fetchNext:callback;
			} else {
				mypoints=points;
				cb=callback;
			}
			var positionalRequest = {'locations': mypoints};
			map.elevator.getElevationForLocations(positionalRequest, function(results, status)
			{
				if (status == google.maps.ElevationStatus.OK)
				{
					results.each(function(e, i){ele[index+i]=e.elevation;});
				} else {
					ContaoMapping.debug(positionalRequest);
					ContaoMapping.debug(status);
				}
				index+=chunksize;
				// sleep some time to give google a rest.
				if(cb==fetchNext)
					(function(){cb(ele);}).delay(1500);
				else
					cb(ele);
			});
		}).bind(fetchNext);
		fetchNext();
	},

	// DEFUNC as of reimplementation of layer manager.
	addMarkerFromQuery:function(query, title, callback)
	{
		var mymap=this;
		coder = new google.maps.Geocoder();
		data = coder.geocode({address:query}, function(results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					data = results[0];
					if(title)
						title += ' ';
					for(i=0;i<data.address_components.length;i++)
					{
						if(data.address_components[i].types=='locality,political'){title+=data.address_components[i].long_name;}
					}
					marker = mymap.addMarker(new mymap.options.markerClass({
										infotext:title,
										latitude: data.geometry.location.lat(),
										longitude: data.geometry.location.lng()}));
				}
				else
					alert('ERROR '+status);
				if(callback)callback(mymap, status, data, marker);
			});
		return this;
	}
});

//ContaoMapping.Map.addClassEvent('createMap', function(){ContaoMapping.debug(arguments); });

})();
