async function loadShaderResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	let shaderSource = await response.text();
	return shaderSource;
}

async function loadJSONResource(url){
	let request = new Request(url);
	let response = await fetch(request);
	const data = await response.json();
	return data;
}

async function loadImage(url) {
	let image = new Image();
	image.src = url;
	return image;
}