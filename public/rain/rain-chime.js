(() => {
  // Joint origins in the authored bell mesh, from the knot to the end of the cord.
  const hanger = [.06,.903,-.089];
  const suspension = [.014,.549,-.061];
  const tailJoint = [.052,-.980,.087];

  function rotate(matrix, [x,y,z]) {
    return [
      matrix[0]*x + matrix[3]*y + matrix[6]*z,
      matrix[1]*x + matrix[4]*y + matrix[7]*z,
      matrix[2]*x + matrix[5]*y + matrix[8]*z,
    ];
  }

  function joint(pivot, pitch, roll, twist = 0, parent = null) {
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const cy = Math.cos(twist), sy = Math.sin(twist);
    const cz = Math.cos(roll), sz = Math.sin(roll);
    // Local Y twist, then X pitch and Z roll, stored in WebGL column order.
    const rotation = [
      cz*cy - sz*sx*sy, sz*cy + cz*sx*sy, -cx*sy,
      -sz*cx, cz*cx, sx,
      cz*sy + sz*sx*cy, sz*sy - cz*sx*cy, cx*cy,
    ];
    let shift = rotate(rotation,pivot).map((value,i) => pivot[i]-value);
    if (parent) {
      shift = rotate(parent.rotation,shift).map((value,i) => value+parent.shift[i]);
      return {
        rotation: [
          ...rotate(parent.rotation,rotation.slice(0,3)),
          ...rotate(parent.rotation,rotation.slice(3,6)),
          ...rotate(parent.rotation,rotation.slice(6,9)),
        ],
        shift,
      };
    }
    return { rotation, shift };
  }

  function createRainChime() {
    const makeAxis = () => ({ angle:0, speed:0 });
    const sideways = makeAxis(), depth = makeAxis();
    const tailSideways = makeAxis(), tailDepth = makeAxis();

    function advance(axis, force, stiffness, damping, dt, limit) {
      axis.speed += (force-stiffness*axis.angle-damping*axis.speed)*dt;
      axis.angle = Math.max(-limit,Math.min(limit,axis.angle+axis.speed*dt));
    }

    function motion(time, dt, moving, strength) {
      if (!moving) {
        for (const axis of [sideways,depth,tailSideways,tailDepth]) axis.angle=axis.speed=0;
        return null;
      }
      if (strength <= 0) return null;
      const steps = Math.max(1,Math.ceil(dt*120));
      const step = dt/steps;
      for (let i=0; i<steps; i++) {
        const t = time-dt+(i+1)*step;
        const crossWind = .57*Math.sin(t*2.05+.8)+.17*Math.sin(t*3.72-1.1);
        const headWind = .32*Math.sin(t*1.62+1.3)+.10*Math.sin(t*3.18);
        advance(sideways,crossWind,6.6,1.45,step,.18);
        advance(depth,headWind,7.1,1.65,step,.115);
        advance(tailSideways,1.5*crossWind-4.8*sideways.speed,10.4,2.5,step,.29);
        advance(tailDepth,1.25*headWind-4.1*depth.speed,12.0,2.8,step,.19);
      }
      const body = joint(hanger,depth.angle*.22*strength,sideways.angle*.25*strength);
      const cord = joint(suspension,depth.angle*strength,sideways.angle*strength,0,body);
      const twist = (.13*Math.sin(time*2.22-.6)+.52*tailDepth.speed)*strength;
      const tail = joint(tailJoint,tailDepth.angle*strength,tailSideways.angle*strength,twist,cord);
      return { body, cord, tail };
    }

    function kick(direction) {
      sideways.speed = Math.max(-.72,Math.min(.72,sideways.speed+direction*.40));
      depth.speed = Math.min(.52,depth.speed+.19);
      tailSideways.speed = Math.max(-1.1,Math.min(1.1,tailSideways.speed+direction*.61));
    }

    return { motion, kick };
  }

  window.createRainChime = createRainChime;
})();
