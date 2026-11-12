(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = (min, max, value) => {
    const t = clamp((value - min) / (max - min), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const wrap = (value, period) => ((value % period) + period) % period;
  const dropDepth = 2.30;
  const closeDistance = .027;

  function openingCamera(progress) {
    const approach = smooth(.045, .236, progress);
    const distance = dropDepth * (closeDistance / dropDepth) ** approach;
    const z = dropDepth - distance;
    const fall = z * .43;
    return {
      x: distance * .065 * (1 - approach),
      y: fall + distance * .087 * (1 - approach),
      z, fall, distance,
      magnification: closeDistance / distance,
      cloudProgress: .205 * z / (dropDepth - closeDistance) + .145 * smooth(.235, .35, progress),
      cloudZoom: 14.5 / (14.5 - z),
      focus: smooth(.09, .64, closeDistance / distance),
    };
  }

  function projectOpeningRain(point, camera, seconds, width, height, centerX, centerY) {
    const depth = point.depth * 1.43;
    const distance = depth - camera.z;
    if (distance <= .10) return null;
    const x = (point.x - .5) * width * 2.8 * 1.43 + (width * .57 - centerX) * depth;
    const repeat = height * 4.8;
    const fall = height * seconds * (.41 + point.speed * .31);
    const y = wrap((point.y - .5) * repeat + fall - camera.y * height + repeat / 2, repeat) - repeat / 2;
    const perspective = 1.43 / distance;
    return {
      x: centerX + (x - camera.x * height) / distance,
      y: centerY + (y + (height * .47 - centerY) * depth) / distance,
      perspective,
      visibility: smooth(.10, .66, distance),
    };
  }

  function projectRain(point, progress, seconds, width, height) {
    const cameraY = height * (.92 * smooth(.065, .232, progress) + 1.43 * smooth(.24, .50, progress));
    const storyFall = height * Math.max(0, progress - .18) * .62;
    const freeFall = height * seconds * (.33 + point.speed * .19);
    const repeatHeight = height * 3.8;
    const worldY = (point.y - .5) * repeatHeight + storyFall + freeFall;
    const relativeY = wrap(worldY - cameraY + repeatHeight / 2, repeatHeight) - repeatHeight / 2;
    const perspective = 1 / point.depth;
    return {
      x: width * (.57 + (point.x - .5) * 2.8 * perspective),
      y: height * .47 + relativeY * perspective,
      perspective,
    };
  }

  function createPointerField() {
    let x = 0, y = 0, fromX = 0, fromY = 0, hovering = false, tracking = false, pulse = 0;
    let strokeX = 0, strokeY = 0, strokeLength = 0, strength = 0, radius = 76;
    const clearance = { x: 0, y: 0, radius: 0, angle: 0, stretch: 1 };
    let cursorVX = 0, cursorVY = 0;
    const pressure = { x: 0, y: 0 };

    function move(nextX, nextY, touch = false) {
      if (!tracking) { fromX = nextX; fromY = nextY; }
      x = nextX;
      y = nextY;
      hovering = !touch;
      tracking = true;
      if (touch) pulse = .19;
    }

    function leave() { hovering = false; tracking = false; }

    function begin(radiusPx, dt = 0) {
      radius = radiusPx;
      strokeX = x - fromX;
      strokeY = y - fromY;
      strokeLength = strokeX * strokeX + strokeY * strokeY;
      strength = hovering || pulse > 0 ? 1 + Math.min(1.6, Math.sqrt(strokeLength) / 29) + pulse * 7 : 0;
      if (!dt) return;
      if (strength) {
        if (clearance.radius <= .2) { clearance.x = x; clearance.y = y; }
        const follow = 1 - Math.exp(-38 * dt);
        clearance.x += (x - clearance.x) * follow;
        clearance.y += (y - clearance.y) * follow;
        const lag = Math.hypot(x - clearance.x, y - clearance.y);
        const limit = radius * .16;
        if (lag > limit) {
          clearance.x = x + (clearance.x - x) * limit / lag;
          clearance.y = y + (clearance.y - y) * limit / lag;
        }
      }
      const retain = Math.exp(-16 * dt);
      cursorVX = cursorVX * retain + clamp(strokeX / dt, -1000, 1000) * (1 - retain);
      cursorVY = cursorVY * retain + clamp(strokeY / dt, -1000, 1000) * (1 - retain);
      const speed = Math.hypot(cursorVX, cursorVY);
      if (speed > 9) clearance.angle = Math.atan2(cursorVY, cursorVX);
      clearance.stretch = 1 + Math.min(.33, speed * .00047);
      const target = hovering ? radius * .46 : radius * .46 * smooth(0, .12, pulse);
      clearance.radius += (target - clearance.radius) * (1 - Math.exp(-dt * (target ? 17 : 8.5)));
      if (clearance.radius < .2 && !target) clearance.radius = 0;
    }

    function pressureAt(px, py, angle, out) {
      out.x = out.y = 0;
      if (!strength) return;
      const nearest = strokeLength > 0 ? clamp(((px - fromX) * strokeX + (py - fromY) * strokeY) / strokeLength, 0, 1) : 0;
      const dx = px - fromX - nearest * strokeX;
      const dy = py - fromY - nearest * strokeY;
      if (Math.abs(dx) >= radius || Math.abs(dy) >= radius) return;
      const distance = Math.hypot(dx, dy);
      if (distance >= radius) return;
      const force = (1 - smooth(0, radius, distance)) ** 1.45 * strength;
      const nx = distance > .001 ? dx / distance : Math.cos(angle);
      const ny = distance > .001 ? dy / distance : Math.sin(angle);
      out.x = (nx - ny * .08) * 5500 * force + cursorVX * force * 1.15;
      out.y = (ny + nx * .08) * 5500 * force + cursorVY * force * 1.15;
    }

    function apply(point, baseX, baseY, dt, weight = 1, droplets = false) {
      const steps = Math.ceil(dt * 100);
      const step = dt / steps;
      for (let i = 0; i < steps; i++) {
        pressureAt(baseX + point.offsetX, baseY + point.offsetY, point.angle, pressure);
        const fall = droplets ? Math.min(110, Math.hypot(point.vx, point.vy) * .70) : 0;
        const ax = pressure.x * weight - point.offsetX * 29 - point.vx * 8.2;
        const ay = pressure.y * weight - point.offsetY * 29 - point.vy * 8.2 + fall;
        point.vx = clamp(point.vx + ax * step, -760, 760);
        point.vy = clamp(point.vy + ay * step, -760, 760);
        point.offsetX += point.vx * step;
        point.offsetY += point.vy * step;
      }
    }

    function end(dt) {
      fromX = x;
      fromY = y;
      pulse = Math.max(0, pulse - dt);
    }

    function avoid(px, py, angle, out) {
      out.x = px;
      out.y = py;
      if (!clearance.radius) return;
      const dx = px - clearance.x, dy = py - clearance.y;
      const edge = clearance.radius * 1.02;
      const reach = edge * 2.2;
      if (Math.abs(dx) >= reach * 1.35 || Math.abs(dy) >= reach * 1.35) return;
      const cosine = Math.cos(clearance.angle), sine = Math.sin(clearance.angle);
      const stretch = clearance.stretch;
      const side = 1 / Math.sqrt(stretch);
      const u = (dx * cosine + dy * sine) / stretch;
      const v = (dy * cosine - dx * sine) / side;
      const distance = Math.hypot(u, v);
      if (distance >= reach) return;
      const push = edge * (1 - distance / reach) ** 2;
      const along = push * stretch * (distance > .01 ? u / distance : Math.cos(angle));
      const across = push * side * (distance > .01 ? v / distance : Math.sin(angle));
      out.x += along * cosine - across * sine;
      out.y += along * sine + across * cosine;
    }

    return { move, leave, begin, pressureAt, apply, end, avoid, clearance };
  }

  window.RainSpace = { createPointerField, openingCamera, projectOpeningRain, projectRain };
})();
