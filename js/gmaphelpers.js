(function(){

/* helper function for expanding a bounds object by a given ratio i.e. ".5" 
 * we use this to fetch only the markers and polygons visible in the current 
 * viewport plus some border around it. */
if(!google.maps.LatLngBounds.prototype.extendBoundsByRatio)
	google.maps.LatLngBounds.prototype.extendBoundsByRatio=function(ratio){
		if(!ratio)ratio=0.1;
		var ne = this.getNorthEast();
		var sw = this.getSouthWest();
		var res = new google.maps.LatLngBounds(sw, ne);
		var latsize = ne.lat() - sw.lat();
		var lngsize = ne.lng() - sw.lng();
		res.extend(new google.maps.LatLng(ne.lat() + latsize*ratio, ne.lng() + lngsize*ratio));
		res.extend(new google.maps.LatLng(sw.lat() - latsize*ratio, sw.lng() - lngsize*ratio));
		return res;
	};

if(!google.maps.Polygon.prototype.getBounds)
	google.maps.Polygon.prototype.getBounds = function(){
		var bounds=new google.maps.LatLngBounds();
		this.getPaths().forEach(function(p){
			p.forEach(function(e){
				bounds.extend(e);
				});
			});
		return bounds;
	};


if(!google.maps.Polyline.prototype.getBounds)
	google.maps.Polyline.prototype.getBounds = function(){
		var bounds=new google.maps.LatLngBounds();
		var path= this.getPath();
		path.forEach(function(e){
			bounds.extend(e);
			});
		return bounds;
	};


/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
distanceBetween = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }
  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
if(!google.maps.LatLng.prototype.distanceTo)
	google.maps.LatLng.prototype.distanceTo = function(p)
	{
		if (!this || !p)return 0;
		var R = 6371; // Radius of the Earth in km
		var dLat = (p.lat() - this.lat()) * Math.PI / 180;
		var dLon = (p.lng() - this.lng()) * Math.PI / 180;
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(this.lat() * Math.PI / 180) * Math.cos(p.lat() * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	};

})();

function ContaoMapLayer_(layer){this.layer=layer;};
ContaoMapLayer_.prototype = new google.maps.OverlayView();
ContaoMapLayer_.ContaoMappingGmapImplement({
	onAdd: function() {this.layer.show();},
	draw: function() {},
	onRemove: function() {this.layer.hide();}
});