(() => {
  const maxWaves = 8;
  const duration = 1.55;
  function createRainRipples(overlay) {
    const gl = overlay.getContext('webgl2',{alpha:false,antialias:false,depth:false});
    const idle = { disturb() {}, paint() {}, clear() {} };
    if (!gl) return idle;

    const vertex = '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}';
    const fragment = `#version 300 es
      precision highp float;
      out vec4 color;
      uniform sampler2D scene;
      uniform vec2 screenSize;
      uniform int count;
      uniform vec4 waves[8];
      void main(){
        vec2 uv=vec2(gl_FragCoord.x/screenSize.x,1.-gl_FragCoord.y/screenSize.y);
        float aspect=screenSize.x/screenSize.y;
        vec2 offset=vec2(0.);
        float glint=0.;
        for(int i=0;i<8;i++){
          if(i>=count)break;
          vec4 wave=waves[i];
          float age=wave.z;
          vec2 v=(uv-wave.xy)*vec2(aspect,1.24);
          float r=length(v);
          vec2 direction=v/max(.0001,r);
          float theta=atan(v.y,v.x);
          float contour=(sin(theta*5.+age*3.)*.009+sin(theta*9.-age*4.)*.004)*smoothstep(.035,.19,r);
          float radius=.007+age*mix(.29,.43,wave.w);
          float off=r-radius+contour;
          float width=.024+age*.020;
          float window=exp(-pow(off/width,2.));
          float fade=smoothstep(0.,.065,age)*(1.-smoothstep(.46,1.55,age));
          float angle=off*152.-age*1.8;
          float energy=window*fade*wave.w*smoothstep(.002,.020,r);
          offset+=vec2(direction.x/aspect,direction.y)*(cos(angle)*energy*.025);
          glint+=sin(angle)*energy;
        }
        vec3 rgb=texture(scene,clamp(uv+offset,0.,1.)).rgb;
        float value=max(rgb.r,max(rgb.g,rgb.b));
        rgb*=1.+clamp(glint,-1.,1.)*.15;
        rgb+=vec3(.24,.32,.35)*max(0.,glint)*smoothstep(.19,.55,value)*.072;
        color=vec4(rgb,1.);
      }`;
    const compile=(type,source)=>{
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program=gl.createProgram();
    try{
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
      gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    }catch(error){console.warn('Ripple rendering unavailable.',error);return idle;}
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());
    const screenSize=gl.getUniformLocation(program,'screenSize');
    const count=gl.getUniformLocation(program,'count');
    const locations=gl.getUniformLocation(program,'waves[0]');
    gl.uniform1i(gl.getUniformLocation(program,'scene'),0);
    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

    const waves=[];
    const values=new Float32Array(maxWaves*4);
    let iw=0,ih=0,off=false;
    const hide=()=>{if(!overlay.hidden)overlay.hidden=true;};
    function clear(){waves.length=0;hide();}
    overlay.addEventListener('webglcontextlost',event=>{event.preventDefault();clear();off=true;});
    function disturb(x,y,time,strength){
      if(off||x<0||x>1||y<0||y>1)return;
      if(waves.length>=maxWaves)waves.shift();
      waves.push({x,y,time,strength});
    }
    function paint(source,time){
      while(waves.length&&time-waves[0].time>=duration)waves.shift();
      if(off||!waves.length){hide();return;}
      if(overlay.width!==source.width||overlay.height!==source.height){
        overlay.width=source.width;
        overlay.height=source.height;
        gl.viewport(0,0,overlay.width,overlay.height);
      }
      for(let i=0;i<waves.length;i++){
        const wave=waves[i], at=i*4;
        values[at]=wave.x; values[at+1]=wave.y;
        values[at+2]=time-wave.time; values[at+3]=wave.strength;
      }
      try{
        if(iw===source.width&&ih===source.height){
          gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);
        }else{
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
          iw=source.width;ih=source.height;
        }
      }catch(error){
        off=true; clear();
        console.warn('Ripple source unavailable.',error);
        return;
      }
      overlay.hidden=false;
      gl.uniform2f(screenSize,overlay.width,overlay.height);
      gl.uniform1i(count,waves.length);
      gl.uniform4fv(locations,values);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    return {disturb,paint,clear};
  }
  window.createRainRipples=createRainRipples;
})();
