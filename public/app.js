console.log("start");
let canvas = document.querySelector('canvas');
let gl = canvas.getContext('webgl');
let model;
//let objectPath = './Susan.json';
let objectPath = './player_athleticmale.json'
let objectTexturePath = './texture.png';

class ModelAttributes{
	Vertices;
	Indices;
	TexCoords;
}
async function loadFiles(shaderUrl, TextureUrl, JSONUrl){
	loadShaderResource(shaderUrl);
	let loadedJSON = loadJSONResource('./player_athleticmale.json');
	loadTextureAndJSON(objectTexturePath, loadedJSON);
}
async function startGL(){
	let source = await loadFiles('./shader.vs.glsl');
	console.log(source);
}
startGL(); //TODO:VERDER MET OPSCHONEN VAN DE CODE, MEERDERE MODELLEN INLADEN ACHTER ELKAAR.

let GetResources = function () {
	loadTextResource('./shader.vs.glsl', function (vsErr, vsText) {
		if (vsErr) {
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		} else {
			loadTextResource('./shader.fs.glsl', function (fsErr, fsText) {
				if (fsErr) {
					alert('Fatal error getting fragment shader (see console)');
					console.error(fsErr);
				} else {
					loadJSONResource(objectPath, function(modelErr, modelObj){
						if(modelErr){
							alert('Fatal error getting model see console');
						} else{
							loadImage(objectTexturePath, function(imgErr, img){
								if(imgErr){
									alert('Fatal error getting texture');
									console.error(imgErr);
								} else{
									Start(vsText, fsText, img, modelObj);
									console.log("started");
								}
							})
						}
					})
				}
			});
		}
	});
}
function CreateTexture(){
	let modelTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(
	gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
	gl.UNSIGNED_BYTE,
	texture
	);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
function CreateShader(type, source){
	let debug;
	let shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		if(type === gl.VERTEX_SHADER)
			debug = "vertex";
		else if (type === gl.FRAGMENT_SHADER)
			debug = "fragment";
		console.error(`ERROR compiling ${shader}  shader!`, gl.getShaderInfoLog(vertexShader));
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

//loadTextResourceNEW(objectTexturePath);

let Start = function (vertexShaderText, fragmentShaderText, texture, playerModel) {
	model = playerModel;
	if (!gl) {
		console.log('WebGL not supported');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	let vertexShader = CreateShader(gl.VERTEX_SHADER, vertexShaderText);
	let fragmentShader = CreateShader(gl.FRAGMENT_SHADER, fragmentShaderText);
	let shaderProgram = CreateProgram(vertexShader, fragmentShader);

	//nieuw
	////////
	//oud

	

	
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Create buffer(s)
	//

	
	let modelAttributes = new ModelAttributes;

	for (let index = 0; index <model.meshes.length; index++) {
		console.log("itteration: " + index);
		let modelVertices = model.meshes[0].vertices;
		let modelIndices = [].concat.apply([], model.meshes[0].faces);
		let modelTexCoords = model.meshes[0].texturecoords[0];

		modelAttributes.Vertices = modelVertices;
		modelAttributes.Indices = modelIndices;
		modelAttributes.TexCoords = modelTexCoords; 
		
		let modelPosVertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

		let modelTexCoordVertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords), gl.STATIC_DRAW);

		var modelIndexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
		var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
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
		var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
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

	//
	// Create texture
	//
	
	CreateTexture();

	

	// Tell OpenGL state machine which program should be active.
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	glMatrix.mat4.identity(worldMatrix);
	glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Main render loop
	//
	var identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, modelTexture);
		gl.activeTexture(gl.TEXTURE0);

		console.log(modelAttributes.Indices);
		gl.drawElements(gl.TRIANGLES, modelAttributes.Indices.length, gl.UNSIGNED_SHORT, 0);

		//for (let index = 0; index < model.meshes.length; index++) {
		//	console.log("drawed " + model.meshes[index].name + " from model.meshes[" + index + "]");
		//	gl.drawElements(gl.TRIANGLES, modelAttributes.Indices.length, gl.UNSIGNED_SHORT, 0);
		//}

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};
//GetResources();
