//var loadTextResource = function (url, callback) {
//	var request = new XMLHttpRequest();
//	request.open('GET', url + '?cashmoney=' + Math.random(), true);
//	request.onload = function () {
//		if (request.status < 200 || request.status > 299) {
//			callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
//		} else {
//			callback(null, request.responseText);
//		}
//	};
//	request.send();
//};
async function loadShaderResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	let shaderSource = response.text();
	return shaderSource;
}
async function loadJSONResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	let JSONSource = response.json();
	return JSONSource;
}
async function loadTextureAndJSON(imgUrl, JSON){
	let image = new Image();
	image.onload(loadJSONResource(JSON));
}

var loadImage = function (url, callback) {
	var image = new Image();
	image.onload = function () {
		callback(null, image);
	};
	image.src = url;
};
//
//var loadJSONResource = function (url, callback) {
//	loadTextResource(url, function (err, result) {
//		if (err) {
//			callback(err);
//		} else {
//			try {
//				callback(null, JSON.parse(result));
//			} catch (e) {
//				callback(e);
//			}
//		}
//	});
//};