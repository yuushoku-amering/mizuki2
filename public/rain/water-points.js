(() => {
  const vertex = `
    attribute vec3 aPoint;
    attribute vec3 aNormal;
    attribute vec3 aDrift;
    attribute float aSeed;
    uniform mat3 uRotation;
    uniform vec2 uHalf;
    uniform vec2 uPivot;
    uniform float uGather;
    uniform float uTime;
    uniform float uSize;
    varying vec3 vNormal;
    varying float vSeed;
    varying float vSettle;
    void main() {
      float settle = smoothstep(aSeed*0.31,0.68+aSeed*0.31,uGather);
      float loose = pow(1.0-settle,1.45);
      float angle = loose*(0.55+sin(uTime*0.31)*0.24);
      mat2 curl = mat2(cos(angle),sin(angle),-sin(angle),cos(angle));
      vec3 drift = vec3(curl*aDrift.xy,aDrift.z);
      vec3 p = uRotation*(aPoint+drift*loose);
      vNormal = normalize(uRotation*aNormal);
      vSettle = settle;
      vSeed = aSeed;
      gl_Position = vec4((p.xy+uPivot)/uHalf,-p.z*0.28,1.0);
      gl_PointSize = uSize*(0.64+aSeed*0.69)*mix(0.68,1.0,settle);
    }`;

  const fragment = `
    precision mediump float;
    varying vec3 vNormal;
    varying float vSeed;
    varying float vSettle;
    void main() {
      vec2 uv = gl_PointCoord*2.0-1.0;
      float r = dot(uv,uv);
      if (r>1.0) discard;
      vec3 key = normalize(vec3(-0.40,0.63,0.53));
      vec3 grain = vec3(uv.x,-uv.y,sqrt(max(0.0,1.0-r)));
      float lambert = max(0.0,dot(normalize(vNormal),key));
      float edge = pow(1.0-abs(vNormal.z),2.5);
      float detail = max(0.0,dot(grain,key));
      float light = (0.13+0.63*lambert+0.15*detail+0.14*edge)*(0.81+vSeed*0.29);
      vec3 cold = mix(vec3(0.10,0.18,0.24),vec3(0.77,0.91,0.96),light);
      float spark = pow(detail,6.0)*pow(vSeed,9.0);
      gl_FragColor = vec4(cold+vec3(0.18,0.23,0.24)*spark,
        (1.0-smoothstep(0.62,1.0,r))*mix(0.53,0.98,vSettle));
    }`;

  function sample(parts, count) {
    let seed = 29461;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const distribution = [];
    let area = 0;
    for (const { vertices, indices, shell } of parts) {
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 6, b = indices[i+1] * 6, c = indices[i+2] * 6;
        const x = vertices[b]-vertices[a], y = vertices[b+1]-vertices[a+1], z = vertices[b+2]-vertices[a+2];
        const u = vertices[c]-vertices[a], v = vertices[c+1]-vertices[a+1], w = vertices[c+2]-vertices[a+2];
        const size = Math.hypot(y*w-z*v,z*u-x*w,x*v-y*u);
        if (size <= 1e-10) continue;
        area += size * (shell ? 1 : 1.38);
        distribution.push({ area, vertices, a, b, c });
      }
    }
    const values = new Float32Array(count * 10);
    for (let i = 0; i < count; i++) {
      const pick = random()*area;
      let first = 0, last = distribution.length - 1;
      while (first < last) {
        const middle = (first+last) >>> 1;
        if (distribution[middle].area < pick) first = middle + 1; else last = middle;
      }
      const {vertices, a, b, c} = distribution[first];
      const ratio = Math.sqrt(random()), direction = random(), k = i * 10;
      for (let j = 0; j < 6; j++) {
        values[k+j] = vertices[a+j]*(1-ratio) + vertices[b+j]*ratio*(1-direction) + vertices[c+j]*ratio*direction;
      }
      const thickness = (random()-.39)*.027;
      for (let j = 0; j < 3; j++) values[k+j] += values[k+3+j]*thickness;
      const bearing = random()*Math.PI*2;
      const pole = random()*2-1;
      const radius = .92*Math.sqrt(random());
      const rim = radius*Math.sqrt(1-pole*pole);
      values[k+6] = Math.cos(bearing)*rim;
      values[k+7] = Math.sin(bearing)*rim*.88;
      values[k+8] = pole*radius;
      values[k+9] = random();
    }
    return values;
  }

  function createWaterPoints(gl, data, parts, compile) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const count = data.parts.length > 1 ? 34500 : 30500;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, sample(parts, count), gl.STATIC_DRAW);
    const attributes = ['aPoint','aNormal','aDrift','aSeed'].map(name => gl.getAttribLocation(program,name));
    const uniform = name => gl.getUniformLocation(program,name);
    const half = uniform('uHalf'), pivot = uniform('uPivot'), rotation = uniform('uRotation');
    const gather = uniform('uGather'), time = uniform('uTime'), size = uniform('uSize');
    const pointSize = data.parts.length > 1 ? 2.39 : 2.46;
    return (matrix, phase, clock) => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      attributes.forEach((location,i) => {
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location,i===3?1:3,gl.FLOAT,false,40,i*12);
      });
      gl.uniform2fv(half,data.half);
      gl.uniform2fv(pivot,data.pivot);
      gl.uniformMatrix3fv(rotation,false,matrix);
      gl.uniform1f(gather,phase);
      gl.uniform1f(time,clock);
      gl.uniform1f(size,pointSize);
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.POINTS,0,count);
    };
  }

  window.createWaterPoints = createWaterPoints;
})();
