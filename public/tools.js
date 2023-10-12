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

async function loadImage(url) {
	let image = new Image();
	image.src = url;
	image.onload = function () {
		return image.src;
	};
}