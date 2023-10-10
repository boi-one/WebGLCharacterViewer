async function loadShaderResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	let shaderSource = await response.text();
	console.log("SHADER klsdfjakldfjhl" + shaderSource);
	return shaderSource;
}

async function loadJSONResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	console.log(response);
	return response;
}

var loadImage = function (url, callback) {
	var image = new Image();
	image.onload = function () {
		callback(null, image);
	};
	image.src = url;
};