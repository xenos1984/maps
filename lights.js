var urlFunc = function(bbox) {
	return 'http://overpass-api.de/api/interpreter?data=((node["light_source"](' + bbox + ');way["light_source"](' + bbox + ');relation["light_source"](' + bbox + '););>;);out meta;';
}

var styleFunc = function(feature, resolution) {
	var colour = feature.get('light:colour');
	if(!colour)
		colour = 'rgb(204,204,204)';

	var disymb = function(c) {
		return '<rect x="-10" y="-4" width="20" height="8" rx="4" ry="4" fill="' + c + '"/>';
	};

	var flsymb = function(c) {
		return '<line x1="0" x2="0" y1="-8" y2="8"/><line x1="-8" x2="8" y1="-8" y2="8"/><line x1="8" x2="-8" y1="-8" y2="8"/>' + disymb(c);
	};

	var method = feature.get('light:method');
	if (method !== undefined) {
		switch(method)
		{
		case 'gas':
			method = '<path d="M 0,-11 C 5,-6 14,0 5,11 6,5 6,4 2,-4 1,2 1,3 -1,5 -1,4 -1,1 -3,-2 -4,3 -7,4 -4,11 -17,-2 0,-7 0,-11" fill="rgb(255,153,0)"/>';
			break;
		case 'electric':
			method = '<polygon points="-6,-11 -2,-11 -2,-2 3,-2 3,8 5,8 2,11 -1,8 1,8 1,1 -6,1" fill="black" transform="rotate(36)"/>';
			break;
		case 'incandescent':
			method = '<path d="M 2.5,5 L 2.5,10 0,11 -2.5,10 -2.5,5 A 6,8 0 1,1 2.5,5 Z" fill="yellow"/>';
			break;
		case 'halogen':
			method = '<path d="M 2.5,5 L 2.5,10 0,11 -2.5,10 -2.5,5 A 6,8 0 1,1 2.5,5 Z" fill="white"/>';
			break;
		case 'discharge':
			method = disymb('white');
			break;
		case 'neon':
			method = disymb('red');
			break;
		case 'sodium':
			method = disymb('yellow');
			break;
		case 'high_pressure_sodium':
			method = disymb('yellow') + '<line x1="0" x2="0" y1="-3" y2="3"/><line x1="-3" x2="3" y1="0" y2="0"/>';
			break;
		case 'low_pressure_sodium':
			method = disymb('yellow') + '<line x1="-3" x2="3" y1="0" y2="0"/>';
			break;
		case 'fluorescent':
			method = flsymb('white');
			break;
		case 'mercury':
			method = flsymb('rgb(153,255,255)');
			break;
		case 'LED':
			method = '<path d="M -10,0 L 10,0 M -6,-6 L -6,6 M -6,0 L 6,-6 6,6 -6,0"/>';
			break;
		case 'laser':
			method = '<path d="M -10,0 L 10,0 M -2,-8 L -2,8 M -6,-7 L 2,7 M -6,7 L 2,-7 M -9,-4 L 5,4 M -9,4 L 5,-4"/>';
			break;
		case 'arc':
			method = '<path d="M -10,0 A 12,12 0 0,1 10,0 L 7,3 A 9,9 0 0,0 -7,3 Z" fill="white"/>';
			break;
		default:
			method = '';
			break;
		}
	}
	else
		method = '';

	var type = feature.get('light_source');
	if (type !== undefined) {
		switch(type)
		{
		case 'lantern':
			width = 30;
			height = 36;
			vbox = '-15 -18 30 36';
			symbol = '<polygon points="0,-17 14,-7 10,17 -10,17 -14,-7" fill="' + colour + '"/>';
			break;
		case 'floodlight':
			width = 36;
			height = 36;
			vbox = '-18 -18 36 36';
			symbol = '<path d="M -17,0 A 17,17 0 0,0 17,0 L 8.5,-8.5 8.5,-17 -8.5,-17 -8.5,-8.5 Z" fill="' + colour + '"/>';
			break;
		case 'aviation':
			width = 36;
			height = 36;
			vbox = '-18 -18 36 36';
			symbol = '<path d="M 3.5,-13.5 A 3.5,3.5 0 0,0 -3.5,-13.5 L -3.5,-4.5 -17,-3 -17,3 -3.5,3 -3.5,13 -8,14 -8,17 8,17 8,14 3.5,13 3.5,3 17,3 17,-3 3.5,-4.5 Z" fill="' + colour + '"/>';
			break;
		case 'warning':
			width = 36;
			height = 30;
			vbox = '-18 -15 36 30';
			symbol = '<polygon points="0,14 -17,-14 17,-14" fill="' + colour + '"/>';
			break;
		case 'signal_lamp':
			width = 30;
			height = 30;
			vbox = '-15 -15 30 30';
			symbol = '<circle cx="0" cy="0" r="14" fill="' + colour + '"/>';
			break;
		default:
			return null;
			break;
		}
	}
	else
		return null;

	return [new ol.style.Style({
		image: new ol.style.Icon({
			src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" viewBox="' + vbox + '" stroke="black" stroke-width="1" fill="none">' + symbol + method + '</svg>'
		})
	})];
};
