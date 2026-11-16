(() => {
  const projection = `
    uniform vec3 uEye;
    uniform vec2 uPitch;
    uniform float uAspect, uTime, uWater;
    vec3 rayAt(vec2 uv) {
      vec3 f = vec3(0.,-uPitch.y,uPitch.x);
      vec3 up = vec3(0.,uPitch.x,uPitch.y);
      return normalize(f + vec3(uv.x*uAspect*.47,0.,0.) + up*uv.y*.47);
    }
    float hash(float n) { return fract(sin(n)*43758.5453); }
  `;
  const atmosphere = `#version 300 es
    precision highp float;
    precision highp sampler3D;
    in vec2 vUv;
    out vec4 result;
    ${projection}
    uniform sampler3D uNoise;
    uniform vec4 uCursor;
    uniform vec4 uWake[4];
    uniform int uSteps;
    uniform float uSunlight;
    uniform float uSunPhase;
    const vec3 sun = vec3(.510,.142,.848);
    vec3 sky(vec3 ray) {
      float haze = exp(-2.6*max(0.,ray.y+.04));
      float opening = pow(max(0.,dot(ray,sun)),9.);
      vec3 blue = mix(vec3(.055,.104,.173),vec3(.27,.40,.49),haze);
      vec3 dusk = blue + vec3(.46,.265,.122)*opening*(.71+.29*haze);
      vec3 morning = mix(vec3(.75,.86,.94),vec3(.97,.89,.77),opening*.77+haze*.16);
      return mix(dusk,morning,uSunlight);
    }
    vec3 rainbow(vec3 ray) {
      if(uSunPhase<=.12 || uSunPhase>=.86)return vec3(0.);
      vec3 axis=normalize(vec3(.23,-.52,.81));
      float angle=acos(clamp(dot(ray,axis),-1.,1.));
      float offset=angle-.729;
      vec3 bands=exp(-pow(abs((offset-vec3(.013,-.001,-.015))/vec3(.010,.011,.012)),vec3(2.)));
      float moisture=smoothstep(.12,.40,uSunPhase)*(1.-smoothstep(.59,.86,uSunPhase));
      float visibility=smoothstep(-.125,.043,ray.y)*smoothstep(-.56,.24,ray.x);
      return bands*vec3(1.,.75,.99)*(.25*moisture*visibility);
    }
    float layer(float h,float floorY,float topY,float thickness) {
      return smoothstep(floorY,floorY+thickness,h)*(1.-smoothstep(topY-thickness,topY,h));
    }
    float density(vec3 p, bool stir) {
      if(p.y<2.1 || p.y>30.) return 0.;
      vec3 q = (p+vec3(-uTime*.49,uTime*.067,uTime*.16))*vec3(.064,.113,.060);
      if(stir && uCursor.z>.01) {
        vec3 axis = rayAt(uCursor.xy);
        vec3 delta = p-uEye;
        float dist = max(0.,dot(delta,axis));
        vec3 radial = delta-axis*dist;
        float radius = 1.05+dist*.085;
        float eddy = uCursor.z*exp(-dot(radial,radial)/(radius*radius))*(1.-smoothstep(18.,36.,dist));
        q += (cross(axis,radial)*.12+vec3(.14,.055,.065))*eddy;
      }
      vec3 low = texture(uNoise,q*.38+vec3(.19,.71,.25)).rgb;
      q += (low-.5)*.48;
      vec3 grain = texture(uNoise,q).rgb;
      float altitude = p.y + (low.r-.5)*8.8 + (low.b-.5)*3.0;
      float shelf = layer(altitude,4.1,14.7,4.2);
      float high = layer(altitude,12.1,26.6,5.2);
      float bank = max(shelf*(.29+.87*low.r),high*(.16+.88*low.g));
      float shape = grain.r*.70 + grain.g*.24 + grain.b*.06;
      return max(0.,shape-.545+(bank-.41)*.66)*2.82*bank*(1.-.47*uSunlight);
    }
    vec4 clouds(vec3 origin,vec3 ray,float farDistance,int steps,bool stir) {
      vec3 color=vec3(0.);
      float transmission = 1.;
      float jitter = hash(floor(gl_FragCoord.x)*.521+floor(gl_FragCoord.y)*7.183)*.09+.455;
      for(int i=0;i<42;i++){
        if(i>=steps || transmission<.018)break;
        float t = float(i)/float(steps);
        float next = float(i+1)/float(steps);
        float stride = farDistance*(next*next-t*t);
        vec3 p = origin+ray*(farDistance*t*t+stride*jitter);
        float d = density(p,stir);
        if(d>.007) {
          float shade = exp(-1.73*density(p+sun*3.0,false) - .68*density(p+sun*7.2,false));
          float upper = .58+.42*smoothstep(4.,25.,p.y);
          float forward = pow(max(0.,dot(ray,sun)),5.);
          vec3 dim = vec3(.145,.201,.268)*upper;
          vec3 lit = mix(vec3(.48,.59,.65),vec3(.89,.73,.57),forward);
          vec3 scattered = mix(dim,lit,shade*shade*.92) + vec3(.10,.067,.042)*forward;
          scattered=mix(scattered,mix(vec3(.73,.79,.86),vec3(1.,.94,.81),shade),uSunlight);
          float alpha = 1.-exp(-d*stride*1.50);
          color += transmission*alpha*scattered;
          transmission *= 1.-alpha;
        }
      }
      return vec4(color,transmission);
    }
    float heightAt(vec2 xz,float distance) {
      float detail = 1.-smoothstep(7.,35.,distance);
      float h = sin(dot(xz,vec2(.38,.21))-uTime*1.30)*.045
        + sin(dot(xz,vec2(-.59,.87))-uTime*1.93)*.021
        + (sin(dot(xz,vec2(.97,1.48))+uTime*2.24)*.012
        + sin(dot(xz,vec2(2.77,-1.82))-uTime*2.86)*.008
        + sin(dot(xz,vec2(5.29,3.14))+uTime*3.7)*.004)*detail;
      for(int i=0;i<4;i++) {
        vec4 wake=uWake[i];
        float age=max(0.,uTime-wake.z);
        float d=length(xz-wake.xy);
        float ring=d-age*2.5;
        h += sin(12.*ring)*exp(-1.22*ring*ring-age*1.41)*wake.w*.155;
      }
      return h;
    }
    vec3 lake(vec3 ray,float t) {
      vec3 hit = uEye+ray*t;
      t += heightAt(hit.xz,t)/min(-.018,ray.y);
      hit = uEye+ray*t;
      float h = heightAt(hit.xz,t);
      float dx = (heightAt(hit.xz+vec2(.044,0.),t)-h)/.044;
      float dz = (heightAt(hit.xz+vec2(0.,.044),t)-h)/.044;
      vec3 normal = normalize(vec3(-dx,1.,-dz));
      vec3 mirror = reflect(ray,normal);
      mirror.y = abs(mirror.y);
      vec4 cloudsAbove = clouds(vec3(hit.x,1.,hit.z),mirror,83.,10,false);
      vec3 reflection = cloudsAbove.rgb+cloudsAbove.a*(sky(mirror)+rainbow(mirror)*.26);
      reflection = mix(reflection,sky(mirror)*.83,smoothstep(12.,65.,t)*.72);
      float fresnel = .16+.84*pow(1.-max(0.,dot(-ray,normal)),4.);
      float glint = pow(max(0.,dot(mirror,sun)),26.);
      vec3 water = mix(vec3(.027,.071,.096),reflection*vec3(.72,.84,.90),fresnel*.88);
      water += vec3(.30,.194,.109)*glint*(.19+fresnel*.58);
      return mix(water,sky(ray)*.72,1.-exp(-max(0.,t)*.013));
    }
    void main() {
      vec3 ray = rayAt(vUv);
      vec3 farColor = sky(ray);
      float waterDistance = ray.y<-.001 ? -uEye.y/ray.y : 550.;
      float waterVisible = uWater*(1.-smoothstep(104.,211.,waterDistance));
      if(waterVisible>.001) farColor=mix(farColor,lake(ray,waterDistance),waterVisible);
      float cloudDistance = mix(108.,min(waterDistance,108.),uWater);
      vec4 volume=clouds(uEye,ray,cloudDistance,uSteps,true);
      vec3 mistSpectrum=rainbow(ray)*(.19+.81*volume.a)*(1.-.94*waterVisible);
      vec3 tone=volume.rgb+volume.a*farColor+mistSpectrum;
      float grain = hash(gl_FragCoord.x+gl_FragCoord.y*831.47)-.5;
      result=vec4(pow(clamp(tone,0.,1.),vec3(.86))+grain*.008,1.);
    }`;
  const rain = `#version 300 es
    precision highp float;
    ${projection}
    uniform float uRain;
    out float vAlpha;
    void main(){
      float i=float(gl_VertexID/2)+1.;
      float a=hash(i*73.731), b=hash(i*19.336), c=hash(i*27.877), d=hash(i*37.391);
      float depth=mod(a*55.-uEye.z,55.);
      float x=mod(b*70.+uTime*.58-uEye.x,70.)-35.;
      float y=mod(c*33.-uTime*(8.+d*6.),33.)-2.-uEye.y;
      float end=float(gl_VertexID % 2);
      vec3 p=vec3(x-end*.023,y+end*(.14+d*.36),depth);
      vec2 yz=vec2(dot(p.yz,uPitch), dot(p.yz,vec2(-uPitch.y,uPitch.x)));
      gl_Position=vec4(p.x/(.47*uAspect),yz.x/.47,yz.y-.18,yz.y);
      vAlpha=(.13+.55*d)*smoothstep(.09,2.,yz.y)*(1.-smoothstep(25.,55.,yz.y))*uRain*(.18+.82*(1.-end));
      if(yz.y<.12)gl_Position=vec4(3.,3.,3.,1.);
    }`;

  function makeNoise(size) {
    const fields = [4,8,16,32].map((n, level) => {
      let seed = 28979 + 413*level;
      const data = Float32Array.from({length:n*n*n}, () => {
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        return seed/4294967296;
      });
      return (x,y,z) => {
        const ix=Math.floor(x), iy=Math.floor(y), iz=Math.floor(z);
        const ease = t=>t*t*(3-2*t);
        const [a,b,c]=[ease(x-ix),ease(y-iy),ease(z-iz)];
        const at=(i,j,k)=>data[((iz+k)&(n-1))*n*n+((iy+j)&(n-1))*n+((ix+i)&(n-1))];
        const row=(j,k)=>at(0,j,k)*(1-a)+at(1,j,k)*a;
        return (row(0,0)*(1-b)+row(1,0)*b)*(1-c)+(row(0,1)*(1-b)+row(1,1)*b)*c;
      };
    });
    const data=new Uint8Array(size*size*size*3);
    let index=0;
    for(let z=0;z<size;z++)for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const p=fields[0](x/16,y/16,z/16);
      const q=fields[1](x/8,y/8,z/8);
      const r=fields[2](x/4,y/4,z/4);
      const s=fields[3](x/2,y/2,z/2);
      data[index++]=255*(.47*p+.31*q+.15*r+.07*s);
      data[index++]=255*(.43*q+.34*r+.23*s);
      data[index++]=255*(.47*r+.53*s);
    }
    return data;
  }

  function createProgram(gl,vertex,fragment) {
    const program=gl.createProgram();
    for(const [kind,code] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(kind);
      gl.shaderSource(shader,code);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    return program;
  }

  const smooth = (a,b,t) => {
    const x=Math.max(0,Math.min(1,(t-a)/(b-a)));
    return x*x*(3-2*x);
  };

  function createRainWorld() {
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:true});
    if(!gl)return null;
    let world, streaks;
    try {
      world=createProgram(gl,`#version 300 es
        out vec2 vUv;
        void main(){vUv=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2))*2.-1.;gl_Position=vec4(vUv,0.,1.);}`,atmosphere);
      streaks=createProgram(gl,rain,`#version 300 es
        precision mediump float;
        in float vAlpha;
        out vec4 color;
        void main(){color=vec4(.66,.78,.87,vAlpha);}`);
    } catch(error) {
      console.warn('The 3D rain background switched to the existing scenery.',error);
      return null;
    }
    const texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D,texture);
    gl.texImage3D(gl.TEXTURE_3D,0,gl.RGB8,64,64,64,0,gl.RGB,gl.UNSIGNED_BYTE,makeNoise(64));
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T,gl.TEXTURE_WRAP_R])gl.texParameteri(gl.TEXTURE_3D,axis,gl.REPEAT);
    const names=['uEye','uPitch','uAspect','uTime','uWater','uCursor','uWake[0]','uSteps','uRain','uSunlight','uSunPhase'];
    const uniforms=program=>Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
    const air=uniforms(world), drops=uniforms(streaks);
    const info=gl.getExtension('WEBGL_debug_renderer_info');
    const software=info && /swiftshader|software|llvmpipe/i.test(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    let cursor=[0,0,-10], frame, wakeIndex=0, lastProgress=-1, lastTime=-1, lastSunPhase, moved=false;
    const wakes=new Float32Array(16);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

    function camera(progress,time,aspect,opening,sunPhase) {
      const fall=smooth(.012,.57,progress);
      const pool=smooth(.72,.985,progress);
      const lift=smooth(.17,.95,sunPhase);
      const eye=[-.52+opening.z*.30+fall*.52+(Math.sin(time*.238)*.17),
        (24.1-opening.y*3.65-fall*13.1)*(1.-pool)+pool*1.28+lift*1.53,
        opening.z*2.9+fall*13.6+pool*8.1+lift*2.2];
      const pitch=.115+opening.focus*.09+fall*.012+pool*.13-lift*.49;
      return {eye,cosine:Math.cos(pitch),sine:Math.sin(pitch),aspect};
    }

    function disturb(x,y,time,strength) {
      move(x,y,time);
      if(!frame || frame.eye[1]>6.5)return;
      const lateral=(2*x-1)*.47*frame.aspect, lift=(1-2*y)*.47;
      const down = -frame.sine+frame.cosine*lift;
      if(down>=-.035)return;
      const distance=-frame.eye[1]/down;
      if(distance>104)return;
      wakes.set([frame.eye[0]+distance*lateral,frame.eye[2]+distance*(frame.cosine+frame.sine*lift),time,strength],wakeIndex*4);
      wakeIndex=(wakeIndex+1)%4;
    }
    function move(x,y,time){cursor=[2*x-1,1-2*y,time];moved=true;}

    function paint(target,width,height,progress,time,opening,sunPhase=0) {
      if(gl.isContextLost() || !width || !height)return false;
      const limit=software ? 570 : width<741 ? 670 : 1030;
      const scale=Math.min(1,limit/Math.max(width,height));
      const w=Math.round(width*scale),h=Math.round(height*scale);
      const resize=canvas.width!==w || canvas.height!==h;
      if(resize){canvas.width=w;canvas.height=h;}
      if(resize || progress!==lastProgress || time!==lastTime || sunPhase!==lastSunPhase || moved) {
        lastProgress=progress;lastTime=time;lastSunPhase=sunPhase;
        moved=false;
        frame=camera(progress,time,width/height,opening,sunPhase);
        const water=smooth(.73,.89,progress)*(1.-smooth(.32,.96,sunPhase));
        const daylight=smooth(.07,.94,sunPhase);
        gl.viewport(0,0,w,h);
        function bind(program,u){
          gl.useProgram(program);
          gl.uniform3fv(u.uEye,frame.eye);
          gl.uniform2f(u.uPitch,frame.cosine,frame.sine);
          gl.uniform1f(u.uAspect,frame.aspect);
          gl.uniform1f(u.uTime,time);
          gl.uniform1f(u.uWater,water);
        }
        gl.disable(gl.BLEND);
        bind(world,air);
        gl.uniform4fv(air['uWake[0]'],wakes);
        gl.uniform4f(air.uCursor,cursor[0],cursor[1],Math.exp(-Math.max(0,time-cursor[2])*4.2)*(1-daylight),0);
        gl.uniform1f(air.uSunlight,daylight);
        gl.uniform1f(air.uSunPhase,sunPhase);
        gl.uniform1i(air.uSteps,sunPhase>.90 ? 25 : software ? 30 : width<741 ? 31 : 40);
        gl.drawArrays(gl.TRIANGLES,0,3);
        if(sunPhase<.73){
          gl.enable(gl.BLEND);
          bind(streaks,drops);
          gl.uniform1f(drops.uRain, (.62+.30*smooth(.12,.24,progress))*(1.-.55*water)*(1-smooth(.05,.73,sunPhase)));
          gl.drawArrays(gl.LINES,0,2000);
        }
      }
      target.drawImage(canvas,0,0,width,height);
      return true;
    }
    return { paint, move, disturb, available:() => !gl.isContextLost() };
  }
  window.createRainWorld=createRainWorld;
})();
