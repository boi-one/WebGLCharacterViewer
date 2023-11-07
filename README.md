# WebGL Documentatie
### GLSL

Om iets te renderen op het scherm heb je een shader nodig. Een shader is een programma op je video kaart. Je hebt een vertex shader en een fragment shader nodig.
De vertex shader wordt gecalled voor iedere vertex in een mesh en de fragment shader wordt gecalled voor iedere pixel in de mesh. In de vertex shader kan je positie en kleur opslaan. In de fragment shader kan je bijvoorbeeld de kleur uit de vertex shader gebruiken. 
#### Vertex Shader

```
#version 330 core
precision mediump float;  
  
attribute vec3 vertPosition;  
attribute vec2 vertTexCoord;  
varying vec2 fragTexCoord;  
uniform mat4 mWorld;  
uniform mat4 mView;  
uniform mat4 mProj;  
  
void main()  
{  
	fragTexCoord = vertTexCoord;  
	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);  
}
```

met `#version` kan je specificeren welke versie je gebruikt van webGL. `core` laat je de moderne versie van webGL gebruiken. `precision` zorgt ervoor hoe precies de `float` en `vec` types zijn. Een `attribute` is een input in de shader, hier wordt de position gespecificeerd. `varying` interpoleerd tussen twee punten op de mesh. `uniform` zijn het zelfde voor iedere vertex. `gl_Position` is de positie van de huidige vertex.
#### Fragment Shader

```
precision mediump float;  
  
varying vec2 fragTexCoord;  
uniform sampler2D sampler;  
  
void main()  
{  
	gl_FragColor = texture2D(sampler, fragTexCoord);  
}
```

`gl_FragColor` is de kleur per pixel. `sampler2D` is de texture die de fragment shader gebruikt.

### Javascript

#### WebGL

Om de bestanden te laden zoals het model en de texture wordt de async functie  [`loadFiles()`](https://github.com/boi-one/WebGLCharacterViewer/blob/master/public/tools.js)  gebruikt. Daarna wordt het scherm leeg gemaakt:

```
gl.clearColor(0.75, 0.85, 0.85, 1.0);  
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
gl.enable(gl.DEPTH_TEST);  
gl.enable(gl.CULL_FACE);  
gl.frontFace(gl.CCW);  
gl.cullFace(gl.BACK);
```

`gl.clear` maakt alle buffers leeg. Een buffer is een array op de video kaart. `gl.enable` zet bepaalde serverside opties aan zoals `gl.DEPTH_TEST` (kijkt of de pixels zichtbaar moeten zijn) en `gl.CULL_FACE` (cult de faces die niet zichtbaar zijn).  `gl.frontFace` bepaald wat de voor en achterkant van de mesh is. `gl.CCW`  staat voor counterclockwise. Daardoor worden de vertices op deze manier gerendered:

![[howtorendervertices.png]]

Nadat het scherm is geleegd worden de shaders gecreëerd. Eerst de vertex en daarna de fragment shader.

```
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
```

Dit gebeurt dus twee keer.
Daarna wordt een program gemaakt. Een program is de vertex shader en fragment shader beide gecompiled en geattached.

```
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
```

zoals eerder verteld `gl.attachShader` zet de gecompilde shaders in de program. `gl.linkProgram` maakt de program klaar om naar de video kaart gestuurd te worden.

Nadat alle shaders compleet zijn worden alle vertices van het model ingeladen.

```
function BindBuffer(buffer, bufferType, arrayType){  
	let newBuffer = gl.createBuffer();  
	gl.bindBuffer(bufferType, newBuffer);  
	gl.bufferData(bufferType, new arrayType(buffer), gl.STATIC_DRAW);  
	return newBuffer;  
}
```

De eerste parameter `buffer` is de array die je naar de gpu wilt sturen, de tweede parameter `bufferType` is hoe de gpu de buffer moet lezen. En de derde parameter `arrayType` is wat voor array je naar de buffer stuurt. Voor de index buffer is dit namelijk iets anders dan voor bijvoorbeeld de vertex buffer.
Zoals eerder vermeld is de buffer een array op de video kaart. Om data te versturen naar die array moet je een nieuwe buffer maken met `gl.createBuffer()`. Om een buffer te bewerken moet je `gl.bindBuffer` gebruiken, met bind buffer selecteer je de buffer die je wilt gebruiken. `gl.bufferData` laad de buffer in de ram van je video kaart.

```
	function ConfigureAttribPointer(program, glslVar, elementsPerAttribute, elementType, normalized, vertexSize, vertexOffset){  
		let attribLocation = gl.getAttribLocation(program, glslVar);  
		gl.vertexAttribPointer(attribLocation, elementsPerAttribute, elementType, normalized, vertexSize, vertexOffset);  
		gl.enableVertexAttribArray(attribLocation);  
}
```

`gl.AttribPointer(index, size, type, normalized, stride, pointer)` heeft een aantal parameters; de locatie van de attribute (bijvoorbeeld locatie of kleur), aantal elementen per attribute (bijvoorbeeld 3 voor een x y z coordinaat), type van element (dit **moet** met de types van webGL gedaan worden, omdat javascript geen types heeft maar dit zou ook moeten in OpenGL/C++. Een voorbeeld hiervan is `float` wordt `gl.FLOAT`), of de attribute genormalizeerd moet worden (bijvoorbeeld voor als je een kleuren systeem gebruikt die 255 is), hoeveel bytes tot het volgende element, hoeveel bytes een element groot is (bijvoorbeeld een vec3 is 3 `float` en een `float` is 4 bytes dus dit element is dus 12 bytes). 


Zodra alle opties zijn ingesteld moet je het shader program gebruiken.

```
gl.useProgram(shaderProgram);
```



Daarna moet je instellen waar in de world space het object en de camera zijn. In de vertex shader zijn een aantal mat4 variables waarmee wordt aangegeven waar de vertices in de wereld zijn. 

```
uniform mat4 mWorld;  
uniform mat4 mView;  
uniform mat4 mProj;
```

mWorld is de matrix van de wereld orientatie, mView is de matrix van de camera orientatie en mProj zorgt voor de clip space en perspectief. Ik ben niet heel diep in de matrices gedoken, ik heb helaas een library gebruikt maar van wat ik begrijp zorgt clip space dat gedeeltes van de mesh buiten het beeld niet worden gerendered.

Dan komen we aan bij de render loop, dit draait de mesh en verwijderd het vorige frame.

```
angle = performance.now() / 1000 / 6 * 2 * Math.PI;  
glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [1, 0, 0]);  
glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [0, 1, 0]);  
glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);  
gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);  

gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);  
  
gl.bindTexture(gl.TEXTURE_2D, objectResources.texture);  
gl.activeTexture(gl.TEXTURE0);  
  
gl.drawElements(gl.TRIANGLES, modelAttribs.Indices.length, gl.UNSIGNED_SHORT, 0);
```

`angle` zorgt voor hoe groot de hoek is waarin het object draait, dit kan je zien als frame rate want als je performance laag zou zijn, zijn de hoeken groter en beweegt het object minder vloeiend. bij de `mat4.rotate` functie moet je vooral letten op de laatste parameter, daarmee wordt bepaald welke kant het object op draait.
`gl.clear` leegt alle buffers op de gpu en daarna wordt de texture op het object gezet en geactiveerd.
als laatst wordt `gl.drawElements` aangeroepen om alles op het scherm te laten verschijnen. de eerste parameter bepaald hoe de faces worden gerendered, de tweede parameter is hoeveel vertices gedrawed moeten worden, de derde parameter bepaald wat de type van de elementen in de array zijn. De vierde parameter is de eventuele offset in de array.
