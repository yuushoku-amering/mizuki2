(() => {
  const weather = document.querySelector('.stage');
  const layer = document.querySelector('.window-scene');
  const canvas = layer.querySelector('canvas');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.querySelector('#ambient');
  const turn = document.querySelector('.turn-leaf');
  const bell = document.querySelector('.window-bell');
  const source = layer.querySelector('img');
  const gl = canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false});
  const vertex = `attribute vec2 xy; varying vec2 uv;
    void main(){uv=vec2(.5+xy.x*.5,.5-xy.y*.5);gl_Position=vec4(xy,0.,1.);}`;
  const fragment = `precision highp float;
    varying vec2 uv;
    uniform sampler2D room;
    uniform vec2 resolution;
    uniform float progress, clock, still, strike;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }
    float wash(vec2 p){return noise(p)*.53+noise(p*2.1+7.)*.27+noise(p*4.5+11.)*.13+noise(p*9.3)*.07;}
    float rain(vec2 p,float seed,float depth){
      float offset=.024*sin(clock*.65+depth)*depth;
      p.x-=p.y*offset;
      vec2 grid=p*vec2(127./depth,4.7/depth);grid.y-=clock*(.78+.36*depth);
      vec2 id=floor(grid);float n=hash(id+seed);
      vec2 f=fract(grid);
      return (1.-smoothstep(.012,.09,abs(f.x-n)))*(1.-smoothstep(.025,.39,abs(f.y-.5)))*smoothstep(.63,.91,n);
    }
    void main(){
      float p=progress;
      float turn=smoothstep(.012,.19,p);
      float aspect=resolution.x/resolution.y;
      vec2 crop=min(vec2(1.),vec2(aspect/1.777,1.777/aspect));
      vec2 focus=mix(vec2(.5),vec2(.666,.51),1.-smoothstep(.75,1.4,aspect));
      vec2 pos=focus+(uv-.5)*crop;
      pos=mix(pos,vec2(.744,.39),turn*.40);
      // Only an intentional tap moves the hanging bell around its hook.
      float belowHook=max(0.,pos.y-.101);
      float chimeZone=(1.-smoothstep(.039,.081,abs(pos.x-.736)))
          *(1.-smoothstep(.390,.420,pos.y))*smoothstep(.101,.123,pos.y);
      float sail=smoothstep(.225,.38,pos.y);
      pos.x-=belowHook*chimeZone*strike*(1.+.28*sail)*(1.-still);
      float pane=smoothstep(.412,.43,pos.x)*(1.-smoothstep(.965,.986,pos.x))
          *smoothstep(.105,.13,pos.y)*(1.-smoothstep(.79,.82,pos.y))*(1.-chimeZone);
      // Keep rain and foliage motion outside the seated figure.
      float head=1.-smoothstep(.90,1.06,length((pos-vec2(.591,.346))/vec2(.060,.114)));
      float drape=1.-smoothstep(.87,1.04,length((pos-vec2(.557,.637))/vec2(.129,.266)));
      float skirt=1.-smoothstep(.90,1.05,length((pos-vec2(.612,.798))/vec2(.151,.092)));
      pane*=1.-max(head,max(drape,skirt));
      // As the paper screen slides, the wet garden is glimpsed behind its inner stile.
      float slide=.15*smoothstep(.012,.152,p);
      vec2 samplePos=pos;
      float screen=1.-smoothstep(.402-slide,.407-slide,pos.x);
      if(pos.x<.406)samplePos.x=mix(.406+abs(.406-pos.x),pos.x+slide,screen);
      vec3 photo=texture2D(room,clamp(samplePos,0.,1.)).rgb;
      float drops=(rain(pos,9.,.75)*.13+rain(pos,12.,1.45)*.22)*pane;
      photo+=drops*vec3(.69,.8,.79)*(1.-still);
      if(p<=.025){gl_FragColor=vec4(photo,1.);return;}
      float ink=smoothstep(.025,.145,p);
      float t=smoothstep(.055,.29,p);
      vec2 paper=vec2(uv.x*aspect,uv.y);
      float tooth=hash(floor(gl_FragCoord.xy))-.5;
      float blot=wash(paper*5.+vec2(-t*1.6,t*.8));
      float luma=dot(photo,vec3(.24,.62,.14));
      vec3 pulp=vec3(.932,.931,.881)+vec3(.027*(blot-.5)+tooth*.042);
      vec3 pigment=vec3(.096,.158,.225);
      // Dark branches persist as a photographic afterimage above three wet ink contours.
      float afterimage=(1.-smoothstep(.07,.57,luma+blot*.1))*(.39-.24*t);
      float density=afterimage;
      for(int i=0;i<3;i++){
        float k=float(i),x=paper.x*(1.2+k*.45)+k*8.+t*(.23+k*.13);
        float bank=.39+.17*k+(wash(vec2(x*2.,k+1.))-.5)*(.41+.1*k)
          +.044*sin(x*3.4)+.019*(blot-.5);
        float wet=smoothstep(bank-.028,bank+.021,uv.y);
        density+=wet*(.12+.07*k)+.08*exp(-50.*abs(uv.y-bank));
      }
      density=clamp(density+blot*.11,0.,.92);
      vec3 painting=mix(pulp,pigment,density);
      // A single vermilion bookmark opens out into a strand on the water.
      float redline=.71+.062*sin(paper.x*3.3+t*1.8)+.013*sin(paper.x*12.-t*2.)-.10*paper.x;
      float thread=(1.-smoothstep(.0006,.0026,abs(uv.y-redline)))
        *smoothstep(.18,.52,paper.x)*smoothstep(.06,.13,p);
      painting=mix(painting,vec3(.53,.205,.15),thread*.72);
      float edge=ink*1.65+pos.x*.25+pos.y*.14-1.;
      float flood=smoothstep(-.26,.15,edge+blot*.50);
      vec3 color=mix(photo,painting,flood);
      float clear=smoothstep(.19,.345,p)*1.9-.25;
      float alpha=1.-smoothstep(-.04,.20,clear-(blot*.65+uv.y*.29+uv.x*.15));
      gl_FragColor=vec4(color,alpha);
    }`;
  let program, uniforms, ready=false, frame=0, time=0, last=0, p=0, paused=false;
  let struckAt=-10;
  function init(){
    if(!gl)return;
    try{
      program=gl.createProgram();
      for(const [type,code] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
        const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
        gl.attachShader(program,shader);
      }
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      const attr=gl.getAttribLocation(program,'xy');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      for(const par of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,par,gl.CLAMP_TO_EDGE);
      for(const par of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,par,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);
      uniforms=Object.fromEntries(['resolution','clock','progress','still','strike'].map(n=>[n,gl.getUniformLocation(program,n)]));
      ready=true;layer.classList.add('painted');resize();
    }catch(error){console.warn('Window scene uses the photographic fallback.',error);}
  }
  function resize(){
    const dpr=Math.min(devicePixelRatio||1,1.35,1750/Math.max(innerWidth,1));
    canvas.width=Math.round(weather.clientWidth*dpr);canvas.height=Math.round(weather.clientHeight*dpr);
    const aspect=weather.clientWidth/weather.clientHeight;
    const k=Math.max(0,Math.min(1,(aspect-.75)/.65));
    const blend=k*k*(3-2*k);
    const cropX=Math.min(1,aspect/1.777), cropY=Math.min(1,1.777/aspect);
    const focusX=.666-.166*blend, focusY=.51-.01*blend;
    bell.style.left=(50+100*(.736-focusX)/cropX)+'%';
    bell.style.top=(50+100*(.277-focusY)/cropY)+'%';
    bell.style.width=Math.max(44,weather.clientWidth*.073/cropX)+'px';
    bell.style.height=Math.max(44,weather.clientHeight*.254/cropY)+'px';
    if(ready)gl.viewport(0,0,canvas.width,canvas.height);
    update();
  }
  function render(now){
    frame=0;if(p>=.35||document.hidden||!ready)return;
    if(!motion.matches&&!paused && now-last<32){wake();return;}
    const dt=Math.min(.09,(now-(last||now))/1000);last=now;
    if(!motion.matches&&!paused)time+=dt;
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
    gl.uniform1f(uniforms.clock,time);
    gl.uniform1f(uniforms.still,motion.matches?1:0);
    const age=time-struckAt;
    gl.uniform1f(uniforms.strike,.11*Math.sin(age*5.6)*Math.exp(-age*1.2));
    gl.uniform1f(uniforms.progress,p);gl.drawArrays(gl.TRIANGLES,0,3);
    if(!motion.matches&&!paused)wake();
  }
  function wake(){if(!frame && ready && p<.35 && !document.hidden)frame=requestAnimationFrame(render);}
  function update(){
    const distance=weather.parentElement.offsetHeight-weather.offsetHeight-(motion.matches?0:innerHeight*1.05);
    p=motion.matches?0:Math.max(0,Math.min(1,-weather.parentElement.getBoundingClientRect().top/Math.max(1,distance)));
    layer.hidden=p>=.35;
    layer.style.setProperty('--fallback-opacity',Math.min(1,Math.max(0,(.34-p)/.14)));
    weather.classList.toggle('in-ink',p>.094&&p<.29);
    turn.hidden=p>.075||motion.matches;
    bell.hidden=p>.025;
    weather.dataset.moment=p<.105?'desk':p<.32?'ink':p<.50?'drop':p<.83?'chime':'pool';
    wake();
  }
  turn.addEventListener('click',()=>{
    const distance=weather.parentElement.offsetHeight-weather.offsetHeight-innerHeight*1.05;
    scrollTo({top:weather.parentElement.offsetTop+.157*distance,behavior:'smooth'});
  });
  bell.addEventListener('click',()=>{
    if(!paused&&!motion.matches){struckAt=time;wake();}
    if(typeof playChime==='function')playChime(true);
  });
  pause.addEventListener('click',()=>{paused=pause.getAttribute('aria-pressed')==='true';wake();});
  addEventListener('scroll',update,{passive:true});addEventListener('resize',resize);
  addEventListener('pageshow',update);document.addEventListener('visibilitychange',wake);motion.addEventListener('change',resize);
  canvas.addEventListener('webglcontextlost',()=>{ready=false;layer.classList.remove('painted');});
  if(source.complete&&source.naturalWidth)init();else source.addEventListener('load',init,{once:true});
  resize();
})();
