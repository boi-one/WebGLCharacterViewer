Om iets te renderen op het scherm heb je een vertex shader en een fragment shader nodig.
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

`#version` defines which webGL version you're using. `core` defines that you are using the modern version of webGL, it's not necessary because when
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
