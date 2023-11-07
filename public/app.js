let canvas = document.querySelector('canvas');
canvas.width = window.screen.width*0.96;
canvas.height = window.screen.height*0.8;

let gl = canvas.getContext('webgl');
let model;
//let objectPath = './Susan.json';
let vshader = './vertexshader.glsl';
let fshader = './fragmentshader.glsl';
let objectPath = './Susan.json';
let objectTexturePath = './SusanTexture.png';

class Resources{
	vertexShader;
	fragmentShader;
	texture;
	model;  
}

class ModelAttributes{
	Vertices;
	Indices;
	TexCoords;
	constructor(vertices, indices, textcoords) {
		this.Vertices = vertices;
		this.Indices = indices;
		this.TexCoords = textcoords;
	}
}
async function loadFiles(vsshaderUrl, fsshaderUrl, TextureUrl, JSONUrl){
	const objectResources = new Resources();
	objectResources.vertexShader = await loadShaderResource(vsshaderUrl);
	objectResources.fragmentShader = await loadShaderResource(fsshaderUrl);
	objectResources.texture = await loadImage(TextureUrl);
	objectResources.model = await loadJSONResource(JSONUrl);
	return objectResources;
}
function CreateTexture(texture){
	
	let modelTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return modelTexture;
}
function CreateShader(type, source){
	let debug = null;
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		if(type === gl.VERTEX_SHADER)
			debug = "vertex";
		else if (type === gl.FRAGMENT_SHADER)
			debug = "fragment";
		console.log(`ERROR compiling ${debug} shader! `, gl.getShaderInfoLog(shader));
		return;
	}
	return shader;
}
function CreateProgram(vertexShader, fragmentShader){
	let program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	return program;
}
function CreateBuffer(ModelResources, meshArrayPosition){
	let vertices = ModelResources.model.meshes[meshArrayPosition].vertices;
	let indices = [].concat.apply([], ModelResources.model.meshes[meshArrayPosition].faces);
	let textureCoords = ModelResources.model.meshes[meshArrayPosition].texturecoords[meshArrayPosition];
	let modelAttribs = new ModelAttributes(vertices, indices, textureCoords);
	return modelAttribs;
}
function BindBuffer(buffer, bufferType, arrayType){
	let newBuffer = gl.createBuffer();
	gl.bindBuffer(bufferType, newBuffer);
	gl.bufferData(bufferType, new arrayType(buffer), gl.STATIC_DRAW);
	return newBuffer;
}
function ConfigureAttribPointer(program, glslVar, elementsPerAttribute, elementType, normalized, vertexSize, vertexOffset){
	let attribLocation = gl.getAttribLocation(program, glslVar);
	gl.vertexAttribPointer(attribLocation, elementsPerAttribute, elementType, normalized, vertexSize, vertexOffset);
	gl.enableVertexAttribArray(attribLocation);
}
function oldBindBuffer(modelAttribs, program){
	let modelPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelAttribs.Vertices), gl.STATIC_DRAW);
	
	let modelTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelAttribs.TexCoords), gl.STATIC_DRAW);
	
	let modelIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelAttribs.Indices), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
	positionAttribLocation, // Attribute location
	3, // Number of elements per attribute
	gl.FLOAT, // Type of elements
	gl.FALSE,
	3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
	0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(texCoordAttribLocation);
}

let Start = function (objectResources) {
	if (!gl) {
		console.log('WebGL not supported');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.85, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	let vertexShader = CreateShader(gl.VERTEX_SHADER, objectResources.vertexShader);
	let fragmentShader = CreateShader(gl.FRAGMENT_SHADER, objectResources.fragmentShader);
	let shaderProgram = CreateProgram(vertexShader, fragmentShader);
	let modelAttribs = CreateBuffer(objectResources, 0);
	let vertexBuffer = BindBuffer(modelAttribs.Vertices, gl.ARRAY_BUFFER, Float32Array);
	ConfigureAttribPointer(shaderProgram, 'vertPosition', 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
	let textureBuffer = BindBuffer(modelAttribs.TexCoords, gl.ARRAY_BUFFER, Float32Array);
	ConfigureAttribPointer(shaderProgram, 'vertTexCoord', 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
	let indicesBuffer = BindBuffer(modelAttribs.Indices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
	objectResources.texture = CreateTexture(objectResources.texture);

	

	// Tell OpenGL state machine which program should be active.
	
	gl.useProgram(shaderProgram);

	let matWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'mWorld');
	let matViewUniformLocation = gl.getUniformLocation(shaderProgram, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(shaderProgram, 'mProj');

	let worldMatrix = new Float32Array(16);
	let viewMatrix = new Float32Array(16);
	let projMatrix = new Float32Array(16);
	glMatrix.mat4.identity(worldMatrix);
	glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
	
	
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	let xRotationMatrix = new Float32Array(16);
	let yRotationMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	let identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);
	let angle = 0;
	let loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, objectResources.texture);
		gl.activeTexture(gl.TEXTURE0);
		
		gl.drawElements(gl.TRIANGLES, modelAttribs.Indices.length, gl.UNSIGNED_SHORT, 0); //modelAttribs.Indices.length: WebGL warning: drawElementsInstanced: Index buffer not bound.
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};
async function Init(){
	let objectResources = await loadFiles(vshader, fshader, objectTexturePath, objectPath);
	Start(objectResources);
}
Init();
