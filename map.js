// Generic OpenStreetMap / Overpass POI map

// Helper function to get URL parameters
function getParameterByName(name, def) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(location.search);
	return results === null ? def : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var mapjs = getParameterByName('map', '');
if(mapjs != '')
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", location.protocol + '//' + location.host + location.pathname.replace(/map\.html/, mapjs + '.js'), false);
	xhr.send();
	eval(xhr.responseText);
}
else
{
	var urlFunc = function(bbox) { return ''; };
	var styleFunc = function(feature, resolution) { return null; };
}

// Loaded data will be in OSM XML format
var xml = new ol.format.OSMXML();

// Create vector source to load data from Overpass API within currently visible bounding box
var vectorSource = new ol.source.Vector({
	format: xml,
	loader: function(extent, resolution, projection) {
		var epsg4326 = ol.proj.transformExtent(extent, projection, 'EPSG:4326');
		var bbox = epsg4326[1] + ',' + epsg4326[0] + ',' + epsg4326[3] + ',' + epsg4326[2];
		var url = urlFunc(bbox);

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", url, false);
		xmlhttp.send();
		var features = xml.readFeatures(xmlhttp.responseXML, {featureProjection: projection});
		vectorSource.addFeatures(features);
	},
	strategy: ol.loadingstrategy.bbox
});

// Create vector layer with vector source and zoom limitation
var vector = new ol.layer.Vector({
	source: vectorSource,
	maxResolution: 20,
	style: styleFunc
});

// Create OSM background layer
var raster = new ol.layer.Tile({
	source: new ol.source.OSM()
});

// Get elements for the popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

// Make sure that hitting the close button closes the popup and deselects all features
closer.onclick = function() {
	select.getFeatures().clear();
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

// Create overlay with popup
var overlay = new ol.Overlay({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	}
});

// Get initial map coordinates
startlat = parseFloat(getParameterByName('lat', '0.0'));
startlon = parseFloat(getParameterByName('lon', '0.0'));
startzoom = parseInt(getParameterByName('zoom', '0'));

// Create view at map coordinates
var view = new ol.View({
	center: ol.proj.transform([startlon, startlat], 'EPSG:4326', 'EPSG:3857'),
	maxZoom: 19,
	zoom: startzoom
})

// Create map
var map = new ol.Map({
	layers: [raster, vector],
	overlays: [overlay],
	target: document.getElementById('map'),
	controls: ol.control.defaults(),
	view: view
});

// Add interaction to show the popup when a feature is hit
var select = new ol.interaction.Select();
map.addInteraction(select);
select.on('select', function(e) {
	var mbe = e.mapBrowserEvent;
	var coordinate = mbe.coordinate;

	var feats = e.selected;
	if(feats.length > 0) {
		var txt = '<table>';

		for (i = 0; i < feats.length; i++) {
			txt = txt + '<tr><th>ID</th><td>' + feats[i].getId() + '</td></tr>';
			var props = feats[i].getProperties();

			for (var prop in props) {
				if(props.hasOwnProperty(prop) && prop != "geometry")
					txt = txt + '<tr><th>' + prop + '</th><td>' + props[prop] + '</td></tr>';
			}
		}

		txt = txt + '</table>';

		content.innerHTML = txt;
		overlay.setPosition(coordinate);
	}
	else
	{
		overlay.setPosition(undefined);
		closer.blur();
	}
});

// Update permalink on map move
map.on('moveend', function() {
	var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
	var zoom = view.getZoom();
	document.getElementById('pl-content').href = location.protocol + '//' + location.host + location.pathname + '?map=' + mapjs + '&lon=' + center[0] + '&lat=' + center[1] + '&zoom=' + zoom;
});
