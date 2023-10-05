const crateImage = document.getElementById('crate-image');


function start(){
    var canvas = document.querySelector('canvas');
var gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('not supported');
}

//create buffers

var vertexData =
     [-1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0];

/*var vertexData = [
    //top
    -1.0, 1.0, -1.0,  
    -1.0, 1.0, 1.0,   
    1.0, 1.0, 1.0,    
    1.0, 1.0, -1.0,   

    // Left
    -1.0, 1.0, 1.0,  
    -1.0, -1.0, 1.0, 
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0, 

    // Right
    1.0, 1.0, 1.0,   
    1.0, -1.0, 1.0,  
    1.0, -1.0, -1.0, 
    1.0, 1.0, -1.0,  

    // Front
    1.0, 1.0, 1.0,    
    1.0, -1.0, 1.0,   
    -1.0, -1.0, 1.0,  
    -1.0, 1.0, 1.0,   

    // Back
    1.0, 1.0, -1.0,    
    1.0, -1.0, -1.0,   
    -1.0, -1.0, -1.0,  
    -1.0, 1.0, -1.0,   

    // Bottom
    -1.0, -1.0, -1.0,  
    -1.0, -1.0, 1.0,   
    1.0, -1.0, 1.0,    
    1.0, -1.0, -1.0,   
];*/

var textureData = [
    //x, y = u, v = s, t in opengl

    1,0,
    1,1,
    0,1,
    0,0,
    
    0,1,
    0,0,
    1,0,
    1,1,
    
    0,1,
    0,0,
    1,0,
    1,1,
    
    1,0,
    0,0,
    0,1,
    1,1,
    
    1,0,
    0,0,
    0,1,
    1,1,
    
    1,0,
    1,1,
    0,1,
    0,0



 /*
    //top
    0, 0, 
    0, 1, 
    1, 1, 
    1, 0, 

    //left
    0, 0, 
    1, 0, 
    1, 1, 
    0, 1, 

    //right
    1, 1, 
    0, 1,
    0, 0,
    1, 0,

    //front
    1, 1,
    1, 0,
    0, 0,
    0, 1,

    //back
    0, 0,
    0, 1,
    1, 1,
    1, 0,

    //bottom
    1, 1,
    1, 0,
    0, 0,
    0, 1,

 */


]

var boxIndices = [
    0, 1, 2,
    0, 2, 3,
    4, 5, 6,
    4, 6, 7,
    8, 9, 10,
    8, 10, 11,
    12, 13, 14,
    12, 14, 15,
    16, 17, 18,
    16, 18, 19,
    20, 21, 22,
    20, 22, 23

];

/*var boxIndices = [

    // Top
		0, 1, 2,
		0, 2, 3 ,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 23, 20

]*/

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureData), gl.STATIC_DRAW);

var boxIndexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader,`
    precision mediump float;

    attribute vec3 position;
    attribute vec2 vertexTextureCoord;
    //attribute vec3 color;
    varying vec2 fragmentTextureCoord;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProjection;

    void main(){
        fragmentTextureCoord = vertexTextureCoord;
        gl_Position = mProjection * mView * mWorld * vec4(position, 1.0);  /*right to left*/
    }
`);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader,
    `
    precision mediump float;
    varying vec2 fragmentTextureCoord;
    uniform sampler2D sampler; 
    
    void main(){
        gl_FragColor = texture2D(sampler, fragmentTextureCoord);
    }
`);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

var positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

//how the texture gets rendered on the object                  
var boxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, boxTexture);

console.log('adding texture');
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateImage);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//hierdoor hoef je geen
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);//mipmaps te genereren

//unbind buffer
gl.bindTexture(gl.TEXTURE_2D, null);

gl.useProgram(program);

//object in worldspace

var matrixWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
var matrixViewUniformLocation = gl.getUniformLocation(program, 'mView');
var matrixProjectionUniformLocation = gl.getUniformLocation(program, 'mProjection')

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projectionMatrix = new Float32Array(16);
var xrotMatrix = new Float32Array(16);
var yrotMatrix = new Float32Array(16);

glMatrix.mat4.identity(worldMatrix);
glMatrix.mat4.identity(projectionMatrix);
glMatrix.mat4.identity(projectionMatrix);

glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0 , 1, 0]); //camera, lookat, position
glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

gl.uniformMatrix4fv(matrixWorldUniformLocation, gl.FALSE, worldMatrix);
gl.uniformMatrix4fv(matrixViewUniformLocation, gl.FALSE, viewMatrix);
gl.uniformMatrix4fv(matrixProjectionUniformLocation, gl.FALSE, projectionMatrix);

var textureCoord = gl.getAttribLocation(program, 'vertexTextureCoord');
gl.enableVertexAttribArray(textureCoord);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(textureCoord, 3, gl.FLOAT, gl.FALSE, 0, 4 * Float32Array.BYTES_PER_ELEMENT); 

//main loop
var identityMatrix = new Float32Array(16);
glMatrix.mat4.identity(identityMatrix);
var angle = 0;

var loop = function(){
    
    angle = performance.now()/ 1000 / 6 *2 * Math.PI //angle = theta

    glMatrix.mat4.rotate(yrotMatrix, identityMatrix, angle, [0, -1, 0]);
    glMatrix.mat4.rotate(xrotMatrix, identityMatrix, angle * 0.25, [-1, 0, 0]);
    glMatrix.mat4.mul(worldMatrix, xrotMatrix, yrotMatrix);
    gl.uniformMatrix4fv(matrixWorldUniformLocation, gl.FALSE, worldMatrix);


    gl.clearColor(0.75,  0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);

    gl.drawElements(gl.TRIANGLES, boxIndices.length-1, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);


}

crateImage.addEventListener('load', () => start());