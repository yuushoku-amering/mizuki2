(() => {
  const turn = Math.PI / 4;
  const rest = { rotation:[1,0,0,0,1,0,0,0,1], shift:[0,0,0] };
  const neutralContact = [0,0,1,1], neutralForce = [0,0,0];
  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat3 uRotation;
    uniform mat3 uJoint;
    uniform vec3 uJointShift;
    uniform vec2 uHalf;
    uniform vec2 uPivot;
    uniform vec3 uEye;
    uniform mediump float uCamera;
    uniform mediump float uBeads;
    uniform vec3 uFlow;
    uniform vec4 uContact;
    uniform vec3 uForce;
    varying vec3 vNormal;
    varying vec3 vPoint;
    varying vec2 vFrame;
    varying vec3 vSurface;
    varying float vTear;
    varying float vSeed;
    void main() {
      vSurface = aPosition;
      vec3 shape = aPosition;
      float wave = uFlow.y * sin(uFlow.x + shape.y*2.8);
      float splash = uFlow.y * sin(uFlow.x*.81 + shape.y*3.4 + 1.7);
      vec3 stretch = vec3(1.+wave,1.-wave*.84,1.+splash*.88);
      shape *= stretch;
      shape.x += uFlow.z*shape.y*shape.y;
      vec3 posed = uJoint * shape + uJointShift;
      vPoint = uRotation * posed;
      vNormal = uRotation * uJoint * (aNormal/stretch);
      vec2 screen = (vPoint.xy + uPivot) / uHalf;
      vTear = 0.;
      vSeed = 0.;
      gl_PointSize = 1.;
      if (uForce.x>.003 && uCamera<.5) {
        vec2 offset = (screen-uContact.xy)/uContact.zw;
        float radius = length(offset);
        vec2 away = offset/max(radius,.08);
        float influence = 1.-smoothstep(.10,1.32,radius);
        float ripples = sin(12.*radius-uForce.z*21.) * (1.-smoothstep(.35,1.75,radius));
        screen += uContact.zw * away * uForce.x * (.54*influence + .09*ripples);
        vPoint.z -= uForce.x * (.38*influence + .065*ripples);
        vNormal = normalize(vNormal + vec3(-away*.51*uForce.x*influence,0.));
        float bearing = atan(away.y,away.x+.0001);
        float brokenRadius = radius*(1.+.14*sin(3.*bearing+.6*vPoint.z)+.073*sin(7.*bearing+vPoint.z*3.));
        vTear = uForce.y * (1.-smoothstep(.13,.92,brokenRadius));
        if (uBeads>.5) {
          vSeed = fract(sin(dot(aPosition,vec3(28.17,59.43,14.71)))*1772.69);
          float launch = uForce.x * sqrt(vTear) * (.65+vSeed*1.27);
          vec2 fan = vec2(cos(vSeed*6.283),sin(vSeed*6.283));
          screen += uContact.zw * launch * (away*.82+fan*.64+vec2(.06,-.34));
          vPoint.z += .5*launch;
          gl_PointSize = (2.0+6.9*vSeed*vSeed)*(.38+.78*sqrt(vTear));
        }
      }
      vFrame = screen * .5 + .5;
      if (uCamera > 0.5) {
        vPoint = uRotation * (posed - uEye);
        float z = -vPoint.z;
        float near = 0.045, far = 8.0;
        gl_Position = vec4(vPoint.x * 1.05, vPoint.y * 1.05,
          (far + near) / (far - near) * z - (2.0 * far * near) / (far - near), z);
        vFrame = 0.5 + vPoint.xy / max(0.045, z) * 0.4;
      } else {
        gl_Position = vec4(screen, -vPoint.z * 0.28, 1.0);
      }
    }`;
  const fragmentShader = `
    precision mediump float;
    uniform sampler2D uEnvironment;
    uniform float uShell;
    uniform float uRear;
    uniform vec2 uSceneCenter;
    uniform vec2 uSceneAcross;
    uniform vec2 uSceneUp;
    uniform vec2 uTilt;
    uniform float uPool;
    uniform mediump float uCamera;
    uniform mediump float uBeads;
    varying vec3 vNormal;
    varying vec3 vPoint;
    varying vec2 vFrame;
    varying vec3 vSurface;
    varying float vTear;
    varying float vSeed;
    vec3 sky(vec2 uv, float blur) {
      return texture2D(uEnvironment, clamp(uv, vec2(.018), vec2(.982)), blur).rgb;
    }
    vec2 toScene(vec2 direction) {
      return vec2(dot(uTilt,direction), dot(vec2(-uTilt.y,uTilt.x),direction));
    }
    void main() {
      if (uBeads>.5) {
        if (vTear<.115 || vSeed<.61) discard;
        vec2 uv = gl_PointCoord*2.-1.;
        float radius = dot(uv,uv);
        if (radius>1.) discard;
        vec3 through = sky(vFrame,0.);
        float shine = exp(-13.*dot(uv-vec2(.28,.37),uv-vec2(.28,.37)));
        vec3 color = through*vec3(.81,.92,.96) + vec3(.54,.66,.69)*(.17+.82*shine);
        float alpha = smoothstep(.11,.43,vTear)*(1.-smoothstep(.56,1.,radius))*.95;
        gl_FragColor = vec4(color,alpha);
        return;
      }
      float hole = 0.;
      if (vTear>.28) {
        float bits = .5 + .28*sin(vSurface.x*27.+vSurface.y*17.+sin(vSurface.z*29.))
          + .19*sin(vSurface.z*41.-vSurface.x*35.+vSurface.y*42.);
        hole = smoothstep(.28+.21*bits,.45+.21*bits,vTear);
        if (hole>.985) discard;
      }
      vec3 n = normalize(vNormal);
      if (!gl_FrontFacing) n = -n;
      vec3 incident = normalize(mix(vec3(0.,0.,-1.),vPoint,uCamera));
      vec3 reflected = reflect(incident,n);
      float facing = abs(dot(n,incident));
      float edge = pow(1.-facing,3.4);
      float fresnel = .0204 + .9796 * pow(1.-facing,5.);
      vec2 sceneUv = uSceneCenter + (vFrame.x-.5)*uSceneAcross + (vFrame.y-.5)*uSceneUp;
      vec2 bend = toScene(refract(incident,n,.7502).xy - incident.xy) * vec2(.74,.93);
      float thickness = mix(.64 + .20*facing,.43 + .52*edge,uShell);
      vec2 transmission = uSceneCenter + (sceneUv-uSceneCenter)*mix(-.60,.82,uShell) + bend*thickness;
      vec3 seenThrough = sky(transmission,-.5);
      seenThrough *= mix(vec3(.71,.83,.91),vec3(.91,.95,.97),edge);
      float reflectionMix = .12 + .62*edge;
      vec2 reflectedUv = vec2(.68,.60) + toScene(reflected.xy) * vec2(.35,.31);
      vec3 cloudReflection = sky(reflectedUv,.15);
      vec3 water = mix(seenThrough,cloudReflection,reflectionMix);
      float lip = exp(-abs(vSurface.y+.55)*25.) * uShell;
      float rimFacing = smoothstep(-.33,.80,n.y+.84*n.x);
      float lightEdge = (.015+.31*fresnel+.10*lip) * rimFacing;
      vec3 windowLight = sky(vec2(.79,.56),2.);
      float bandDistance = (reflectedUv.y-.55)/.065;
      float skyBand = exp(-bandDistance*bandDistance) *
        smoothstep(.68,.87,reflectedUv.x) * smoothstep(.18,.69,reflected.z);
      vec3 glint = max(vec3(0.),cloudReflection-sky(reflectedUv,3.)-.014);
      water += (cloudReflection + vec3(.19,.20,.21)) * lightEdge
        + glint*(.29+edge*.48) + windowLight*skyBand*.16;
      float coverage = mix(.94,.74,uShell) + .22*edge;
      coverage *= mix(1.,.28,uRear);
      water = mix(water,water*vec3(.78,.88,.94),uPool);
      gl_FragColor = vec4(water,min(1.,coverage)*(1.-hole));
    }`;

  function decode(encoded, Type) {
    const raw = atob(encoded);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Type(bytes.buffer);
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function createWaterLighting() {
    const source = document.createElement('canvas');
    const brush = source.getContext('2d', { alpha: false });
    const light = { source, revision: 0 };
    let lastTime, lastProgress, lastWidth, lastHeight;
    return (canvas,time,progress,force) => {
      if (!brush || !canvas.width || !canvas.height) return null;
      const { width,height } = canvas;
      if (lastWidth !== width || lastHeight !== height) {
        source.width = width >= height ? 512 : 256;
        source.height = width >= height ? 256 : 512;
        lastWidth = width;
        lastHeight = height;
      } else if (!force && Math.abs(progress-lastProgress) < .007 && time-lastTime < .055) return light;
      brush.drawImage(canvas,0,0,source.width,source.height);
      lastTime = time;
      lastProgress = progress;
      light.revision++;
      return light;
    };
  }

  function createRenderer(gl, data, environment, width, height, refresh) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPosition');
    const normal = gl.getAttribLocation(program, 'aNormal');
    const uniform = name => gl.getUniformLocation(program, name);
    const rotation = uniform('uRotation'), shell = uniform('uShell'), rear = uniform('uRear');
    const cameraMode = uniform('uCamera'), eyePosition = uniform('uEye');
    const jointRotation = uniform('uJoint'), jointShift = uniform('uJointShift');
    const flow = uniform('uFlow'), contact = uniform('uContact'), force = uniform('uForce'), beads = uniform('uBeads');
    const center = uniform('uSceneCenter'), across = uniform('uSceneAcross'), up = uniform('uSceneUp');
    const tilt = uniform('uTilt'), pool = uniform('uPool');
    gl.uniform2fv(uniform('uHalf'), data.half);
    gl.uniform2fv(uniform('uPivot'), data.pivot);
    gl.uniform2f(center,.54,.48);
    gl.uniform2f(across,.58,0);
    gl.uniform2f(up,0,.68);
    gl.uniform2f(tilt,1,0);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(normal);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([55,82,102,255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let dirty = true, sceneRevision = 0, sceneWidth, sceneHeight, sceneAvailable = true;
    const sky = new Image();
    sky.addEventListener('load', () => {
      if (sceneRevision) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky);
      dirty = true;
      refresh();
    });
    sky.src = environment;

    function lightFrom(scene, box, pivot, roll, viewportWidth, viewportHeight, water) {
      if (!scene?.revision || !sceneAvailable) return;
      gl.useProgram(program);
      if (sceneRevision !== scene.revision) {
        const source = scene.source;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        try {
          if (source.width === sceneWidth && source.height === sceneHeight) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
          } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            sceneWidth = source.width;
            sceneHeight = source.height;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          }
          gl.generateMipmap(gl.TEXTURE_2D);
          sceneRevision = scene.revision;
        } catch (error) {
          sceneAvailable = false;
          console.warn('Water lighting input could not sample the scene.',error);
          return;
        }
      }
      const cosine = Math.cos(roll), sine = Math.sin(roll);
      const offset = box.height * (.5-pivot);
      gl.uniform2f(center,(box.left+box.width*.5-offset*sine)/viewportWidth,
        1-(box.top+box.height*pivot+offset*cosine)/viewportHeight);
      gl.uniform2f(across,box.width*cosine/viewportWidth,-box.width*sine/viewportHeight);
      gl.uniform2f(up,box.height*sine/viewportWidth,box.height*cosine/viewportHeight);
      gl.uniform2f(tilt,cosine,sine);
      gl.uniform1f(pool,water);
      dirty = true;
    }

    const parts = data.parts.map((part,index) => {
      const vertices = gl.createBuffer(), indices = gl.createBuffer();
      const triangles = decode(part.indices, Uint16Array);
      const positions = decode(part.vertices, Float32Array);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
      // The bell exports its cord, striker and tail as separate indexed meshes.
      const joint = index === 5 ? 'tail' : index === 3 || index === 4 ? 'cord' : 'body';
      return { vertices, indices, positions, triangles, count: triangles.length, shell: part.shell, joint };
    });
    const inner = parts.filter(part => !part.shell);
    const walls = parts.filter(part => part.shell);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function drawParts(layer, rig, spray = false) {
      for (const part of layer) {
        const joint = rig?.[part.joint] ?? rest;
        gl.bindBuffer(gl.ARRAY_BUFFER, part.vertices);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indices);
        gl.uniform1f(shell, Number(part.shell));
        gl.uniformMatrix3fv(jointRotation,false,joint.rotation);
        gl.uniform3fv(jointShift,joint.shift);
        if (spray) gl.drawArrays(gl.POINTS,0,part.positions.length/6);
        else gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, 0);
      }
    }

    function drawLayer(layer, cull, back, rig) {
      if (!layer.length) return;
      gl.cullFace(cull);
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.colorMask(false, false, false, false);
      drawParts(layer, rig);
      gl.colorMask(true, true, true, true);
      gl.depthMask(false);
      gl.depthFunc(gl.EQUAL);
      gl.uniform1f(rear, back);
      drawParts(layer, rig);
    }

    let previous, previousRig, previousMotion, pointsPass, pointMatrix, pointPhase, pointTime;
    let showingPoints = false, pointSupport = Boolean(window.createWaterPoints);
    function drawMesh(matrix, eye = null, rig = null, motion = null) {
      if (!dirty && matrix === previous && rig === previousRig && motion === previousMotion && !eye) return;
      dirty = false;
      showingPoints = false;
      previous = matrix;
      previousRig = rig;
      previousMotion = motion;
      gl.useProgram(program);
      gl.uniformMatrix3fv(rotation, false, matrix);
      gl.uniform1f(cameraMode, Number(Boolean(eye)));
      gl.uniform3fv(flow,motion?.flow ?? neutralForce);
      gl.uniform4fv(contact,motion?.point ?? neutralContact);
      gl.uniform3fv(force,motion?.force ?? neutralForce);
      gl.uniform1f(beads,0);
      if (eye) gl.uniform3fv(eyePosition, eye);
      gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (walls.length) {
        drawLayer(walls, gl.FRONT, 1, rig);
        gl.depthMask(true);
        gl.clear(gl.DEPTH_BUFFER_BIT);
      }
      drawLayer(inner, gl.BACK, 0, rig);
      drawLayer(walls, gl.BACK, 0, rig);
      if (motion?.force?.[1]>.115) {
        gl.depthMask(false);
        gl.depthFunc(gl.LEQUAL);
        gl.uniform1f(beads,1);
        drawParts(parts,rig,true);
      }
    }
    drawMesh.points = (matrix, phase, clock) => {
      if (!pointSupport) return false;
      if (!pointsPass) {
        try {
          pointsPass = window.createWaterPoints(gl, data,
            parts.map(part => ({ vertices: part.positions, indices: part.triangles, shell: part.shell })), compile);
        } catch (error) {
          pointSupport = false;
          console.warn('The water mesh remains available without its grain layer.', error);
          return false;
        }
      }
      if (!showingPoints || pointMatrix !== matrix || pointPhase !== phase || (phase < .99 && pointTime !== clock)) {
        pointsPass(matrix, phase, clock);
        showingPoints = true;
        pointMatrix = matrix;
        pointPhase = phase;
        pointTime = clock;
        dirty = true;
      }
      return true;
    };
    drawMesh.lightFrom = lightFrom;
    return drawMesh;
  }

  function createWaterViews(name, front, width, height, refresh) {
    const data = window.rainWaterMeshes?.[name];
    const frame = document.createElement('canvas');
    frame.width = width;
    frame.height = height;
    let gl, render, samples;
    if (data) {
      try {
        gl = frame.getContext('webgl', { alpha: true, antialias: true, preserveDrawingBuffer: true });
        if (gl) {
          render = createRenderer(gl, data, window.rainWaterMeshes.environment, width, height, refresh);
          samples = decode(data.samples, Float32Array);
        }
      } catch (error) { console.warn('Water model preview is using its front view.', error); }
    }
    const ready = () => Boolean(render && samples && !gl.isContextLost());

    let previousYaw, previousPitch, pose;
    function matrix(yaw, pitch) {
      if (yaw === previousYaw && pitch === previousPitch) return pose;
      previousYaw = yaw;
      previousPitch = pitch;
      const a = turn * yaw, b = turn * pitch;
      const c = Math.cos(a), s = Math.sin(a), d = Math.cos(b), e = Math.sin(b);
      pose = new Float32Array([c, -e*s, d*s, 0, d, e, -s, -e*c, d*c]);
      return pose;
    }

    function image(yaw, pitch, rig = null, motion = null) {
      if (!ready()) return front;
      render(matrix(yaw,pitch),null,rig,motion);
      return frame;
    }

    function points(yaw, pitch, phase, clock) {
      if (!ready() || !render.points(matrix(yaw,pitch), phase, clock)) return null;
      return frame;
    }

    function modelPoint(x, y, z, yaw, pitch) {
      if (!ready()) return {u:.52,v:.638};
      const m = matrix(yaw,pitch);
      const u = .5 + (m[0]*x + m[3]*y + m[6]*z + data.pivot[0]) / (2*data.half[0]);
      const v = .5 - (m[1]*x + m[4]*y + m[7]*z + data.pivot[1]) / (2*data.half[1]);
      return {u,v};
    }
    function screenPoint(surface, x, y, z, yaw, pitch, output) {
      const {u,v} = modelPoint(x,y,z,yaw,pitch);
      surface.project(Math.max(0,Math.min(1,u)), Math.max(0,Math.min(1,v)), output);
    }

    function project(surface, u, v, index, yaw, pitch, output) {
      if (!ready()) { surface.project(u,v,output); return; }
      const i = index * 3;
      screenPoint(surface, samples[i], samples[i+1], samples[i+2], yaw, pitch, output);
    }

    function anchor(surface, name, u, v, yaw, pitch, output, rig = null) {
      let point = data?.anchors[name];
      if (!ready() || !point) { surface.project(u,v,output); return; }
      const joint = name === 'tip' ? rig?.tail : rig?.body;
      if (joint) {
        const [x,y,z] = point;
        const { rotation:m,shift:d } = joint;
        point = d.map((value,i) => value + m[i]*x + m[i+3]*y + m[i+6]*z);
      }
      screenPoint(surface, ...point, yaw, pitch, output);
    }

    const unit = a => {
      const length = Math.hypot(...a);
      return a.map(value => value / length);
    };
    function camera(progress, rig = null) {
      if (!ready()) return null;
      const t = Math.max(0, Math.min(1, (progress - .70) / .16));
      const glide = t * t * (3 - 2 * t);
      const eye = [.31 + glide * .15, -1.7 + 2.13 * glide, 2.45 * (1 - glide) + .03];
      const target = [.02 + .23 * glide, .16 + .72 * glide, -.12 - .40 * glide];
      const back = unit(eye.map((value, i) => value - target[i]));
      const right = unit([back[2], 0, -back[0]]);
      const up = [back[1] * right[2], back[2] * right[0] - back[0] * right[2], -back[1] * right[0]];
      render(new Float32Array([right[0],up[0],back[0],right[1],up[1],back[1],right[2],up[2],back[2]]), eye,rig);
      return frame;
    }

    function lightFrom(...args) {
      if (ready()) render.lightFrom(...args);
    }
    return { image, points, project, anchor, modelPoint, ready, camera, lightFrom };
  }

  window.createWaterViews = createWaterViews;
  window.createWaterLighting = createWaterLighting;
})();
