(() => {
  const turn = Math.PI / 4;
  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat3 uRotation;
    uniform vec2 uHalf;
    uniform vec2 uPivot;
    uniform vec3 uEye;
    uniform float uCamera;
    varying vec3 vNormal;
    varying vec3 vPoint;
    varying vec2 vFrame;
    void main() {
      vPoint = uRotation * aPosition;
      vNormal = uRotation * aNormal;
      vec2 screen = (vPoint.xy + uPivot) / uHalf;
      vFrame = screen * 0.5 + 0.5;
      if (uCamera > 0.5) {
        vPoint = uRotation * (aPosition - uEye);
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
    varying vec3 vNormal;
    varying vec3 vPoint;
    varying vec2 vFrame;
    vec3 sky(vec2 uv) {
      return texture2D(uEnvironment, clamp(uv, vec2(0.006), vec2(0.994))).rgb;
    }
    float softbox(vec3 ray, vec2 center, vec2 spread) {
      vec2 d = (ray.xy - center) / spread;
      return exp(-dot(d,d) * 1.9) * smoothstep(0.08,0.32,ray.z);
    }
    void main() {
      vec3 n = normalize(vNormal);
      if (!gl_FrontFacing) n = -n;
      vec3 incoming = vec3(0.0, 0.0, -1.0);
      vec3 ray = reflect(incoming,n);
      vec3 through = refract(incoming,n,0.7502);
      float facing = clamp(n.z,0.0,1.0);
      float fresnel = 0.0204 + 0.9796 * pow(1.0-facing,5.0);
      vec2 transmission = vec2(0.54,0.48) + (vFrame - 0.5) * vec2(0.58,0.68)
        + through.xy * (0.37 - uShell*0.12) + vPoint.z * vec2(0.017,-0.025);
      vec3 water = mix(vec3(0.039,0.087,0.125), sky(transmission) * vec3(0.75,0.91,1.0), 0.52);
      vec3 reflection = sky(vec2(0.55,0.54) + ray.xy * vec2(0.34,0.30));
      vec3 color = mix(water, reflection * vec3(0.91,1.01,1.08), 0.16 + fresnel * 0.54);
      float lightRight = softbox(ray,vec2(0.65,0.29),vec2(0.17,0.29));
      float lightLeft = softbox(ray,vec2(-0.58,0.34),vec2(0.115,0.27));
      float lightTop = softbox(ray,vec2(-0.14,0.70),vec2(0.30,0.12));
      color += lightRight * vec3(0.95,0.98,1.0) * 1.05;
      color += lightLeft * vec3(0.62,0.80,0.93) * 0.67;
      color += lightTop * vec3(0.79,0.91,1.0) * 0.79;
      color += vec3(0.14,0.25,0.30) * pow(1.0-facing,2.0) * (0.34 + 0.66*smoothstep(-0.9,0.35,n.y));
      float alpha = mix(0.88,0.60,uShell) + fresnel * 0.28 + 0.18 * max(lightRight,lightTop);
      gl_FragColor = vec4(color, min(1.0,alpha) * mix(1.0,0.36,uRear));
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
    gl.uniform2fv(uniform('uHalf'), data.half);
    gl.uniform2fv(uniform('uPivot'), data.pivot);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(normal);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([55,82,102,255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let dirty = true;
    const sky = new Image();
    sky.addEventListener('load', () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sky);
      dirty = true;
      refresh();
    });
    sky.src = environment;

    const parts = data.parts.map(part => {
      const vertices = gl.createBuffer(), indices = gl.createBuffer();
      const triangles = decode(part.indices, Uint16Array);
      const positions = decode(part.vertices, Float32Array);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
      return { vertices, indices, positions, triangles, count: triangles.length, shell: part.shell };
    });
    const inner = parts.filter(part => !part.shell);
    const walls = parts.filter(part => part.shell);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function drawParts(layer) {
      for (const part of layer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, part.vertices);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indices);
        gl.uniform1f(shell, Number(part.shell));
        gl.drawElements(gl.TRIANGLES, part.count, gl.UNSIGNED_SHORT, 0);
      }
    }

    function drawLayer(layer, cull, back) {
      if (!layer.length) return;
      gl.cullFace(cull);
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.colorMask(false, false, false, false);
      drawParts(layer);
      gl.colorMask(true, true, true, true);
      gl.depthMask(false);
      gl.depthFunc(gl.EQUAL);
      gl.uniform1f(rear, back);
      drawParts(layer);
    }

    let previous, pointsPass, pointMatrix, pointPhase, pointTime;
    let showingPoints = false, pointSupport = Boolean(window.createWaterPoints);
    function drawMesh(matrix, eye = null) {
      if (!dirty && matrix === previous && !eye) return;
      dirty = false;
      showingPoints = false;
      previous = matrix;
      gl.useProgram(program);
      gl.uniformMatrix3fv(rotation, false, matrix);
      gl.uniform1f(cameraMode, Number(Boolean(eye)));
      if (eye) gl.uniform3fv(eyePosition, eye);
      gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (walls.length) {
        drawLayer(walls, gl.FRONT, 1);
        gl.depthMask(true);
        gl.clear(gl.DEPTH_BUFFER_BIT);
      }
      drawLayer(inner, gl.BACK, 0);
      drawLayer(walls, gl.BACK, 0);
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

    function image(yaw, pitch) {
      if (!ready()) return front;
      render(matrix(yaw,pitch));
      return frame;
    }

    function points(yaw, pitch, phase, clock) {
      if (!ready() || !render.points(matrix(yaw,pitch), phase, clock)) return null;
      return frame;
    }

    function screenPoint(surface, x, y, z, yaw, pitch, output) {
      const m = matrix(yaw,pitch);
      const u = .5 + (m[0]*x + m[3]*y + m[6]*z + data.pivot[0]) / (2*data.half[0]);
      const v = .5 - (m[1]*x + m[4]*y + m[7]*z + data.pivot[1]) / (2*data.half[1]);
      surface.project(Math.max(0,Math.min(1,u)), Math.max(0,Math.min(1,v)), output);
    }

    function project(surface, u, v, index, yaw, pitch, output) {
      if (!ready()) { surface.project(u,v,output); return; }
      const i = index * 3;
      screenPoint(surface, samples[i], samples[i+1], samples[i+2], yaw, pitch, output);
    }

    function anchor(surface, name, u, v, yaw, pitch, output) {
      const point = data?.anchors[name];
      if (!ready() || !point) { surface.project(u,v,output); return; }
      screenPoint(surface, ...point, yaw, pitch, output);
    }

    const unit = a => {
      const length = Math.hypot(...a);
      return a.map(value => value / length);
    };
    function camera(progress) {
      if (!ready()) return null;
      const t = Math.max(0, Math.min(1, (progress - .70) / .16));
      const glide = t * t * (3 - 2 * t);
      const eye = [.31 + glide * .15, -1.7 + 2.13 * glide, 2.45 * (1 - glide) + .03];
      const target = [.02 + .23 * glide, .16 + .72 * glide, -.12 - .40 * glide];
      const back = unit(eye.map((value, i) => value - target[i]));
      const right = unit([back[2], 0, -back[0]]);
      const up = [back[1] * right[2], back[2] * right[0] - back[0] * right[2], -back[1] * right[0]];
      render(new Float32Array([right[0],up[0],back[0],right[1],up[1],back[1],right[2],up[2],back[2]]), eye);
      return frame;
    }

    return { image, points, project, anchor, ready, camera };
  }

  window.createWaterViews = createWaterViews;
})();
