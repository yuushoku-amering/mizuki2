(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const banks = [
    { x: -1.42, y: -.48, z: .94, span: .69, width: 1.35, opacity: .34 },
    { x: 1.35, y: -.37, z: 1.52, span: .78, width: 1.82, opacity: .42 },
    { x: -.90, y: -.87, z: 2.38, span: .79, width: 1.56, opacity: .38 },
    { x: .95, y: -1.03, z: 2.91, span: .64, width: 1.58, opacity: .43 },
    { x: -1.05, y: -1.68, z: 3.75, span: .77, width: 1.65, opacity: .37 },
    { x: 1.01, y: -1.65, z: 4.68, span: .93, width: 1.82, opacity: .37 },
  ];

  function cameraFor(progress, width, height) {
    const travel = smooth(.01, .735, progress);
    const yaw = mix(-.055, .12, travel);
    const pitch = -.09 - Math.sin(travel * Math.PI) * .16;
    return {
      x: -.14 + .32 * Math.sin(travel * 2.45),
      y: .02 - 1.74 * travel,
      z: -.37 + 3.66 * travel,
      sinYaw: Math.sin(yaw), cosYaw: Math.cos(yaw),
      sinPitch: Math.sin(pitch), cosPitch: Math.cos(pitch),
      focal: Math.min(height * 1.04, width * 1.12),
      centerX: width * .53, centerY: height * .45,
    };
  }

  function project(camera, x, y, z) {
    const dx = x - camera.x, dy = y - camera.y, dz = z - camera.z;
    const side = camera.cosYaw * dx - camera.sinYaw * dz;
    const forward = camera.sinYaw * dx + camera.cosYaw * dz;
    const up = camera.cosPitch * dy - camera.sinPitch * forward;
    const depth = camera.sinPitch * dy + camera.cosPitch * forward;
    if (depth <= .20) return null;
    const scale = camera.focal / depth;
    return { x: camera.centerX + side * scale, y: camera.centerY - up * scale, depth, scale };
  }

  function unproject(camera, x, y, depth) {
    const side = (x - camera.centerX) * depth / camera.focal;
    const up = (camera.centerY - y) * depth / camera.focal;
    const dy = camera.cosPitch * up + camera.sinPitch * depth;
    const forward = -camera.sinPitch * up + camera.cosPitch * depth;
    return {
      x: camera.x + camera.cosYaw * side + camera.sinYaw * forward,
      y: camera.y + dy,
      z: camera.z - camera.sinYaw * side + camera.cosYaw * forward,
    };
  }

  function createCloudScene(texture, fallback) {
    let seed = 7193;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const clouds = banks.map((bank, index) => ({
      index,
      puffs: Array.from({ length: 10 }, (_, i) => ({
        x: bank.x + (random() - .5) * bank.span * 1.73,
        y: bank.y + (random() - .5) * .48,
        z: bank.z + (random() - .5) * .67,
        width: bank.width * mix(.53, 1.17, random()),
        opacity: bank.opacity * mix(.44, 1, random()),
        roll: (random() - .5) * .46, flip: i % 3 === 1,
        phase: random() * Math.PI * 2,
        dx: 0, dy: 0, dz: 0, vx: 0, vy: 0, vz: 0,
      })),
    }));
    const wakes = [];
    const buffer = document.createElement('canvas');
    const layer = buffer.getContext('2d');
    let camera = null, screenW = 0, screenH = 0, visible = [], lastStroke = null;

    function updatePuff(puff, activeWakes, time, dt) {
      if (!dt) return;
      let ax = -puff.dx * 12 - puff.vx * 4.5;
      let ay = -puff.dy * 12 - puff.vy * 4.5;
      let az = -puff.dz * 12 - puff.vz * 4.5;
      for (const wake of activeWakes) {
        const dx = puff.x + puff.dx - wake.x;
        const dy = puff.y + puff.dy - wake.y;
        const dz = puff.z + puff.dz - wake.z;
        const d = Math.hypot(dx, dy, dz * .82);
        const reach = wake.radius * 2.65;
        if (d >= reach) continue;
        const radialX = d > .001 ? dx / d : Math.cos(puff.phase);
        const radialY = d > .001 ? dy / d : Math.sin(puff.phase);
        const force = (1 - d / reach) ** 1.6 * (1 - smooth(.04, .70, time - wake.time)) * wake.strength;
        ax += (radialX * 5.6 - radialY * 7.0 + wake.sweepX * 5.4) * force;
        ay += (radialY * 5.6 + radialX * 7.0 + wake.sweepY * 5.4) * force;
        az += (dz / Math.max(.06, d)) * 3.0 * force;
      }
      puff.vx += ax * dt; puff.vy += ay * dt; puff.vz += az * dt;
      puff.dx += puff.vx * dt; puff.dy += puff.vy * dt; puff.dz += puff.vz * dt;
    }

    function drawPuffs(ctx, puffs, image, fade, time) {
      const aspect = image.width / image.height;
      for (const { puff, pose, width, opacity } of puffs) {
        const h = width / aspect;
        ctx.save();
        ctx.translate(pose.x, pose.y);
        ctx.rotate(puff.roll + Math.sin(time * .38 + puff.phase) * .034 + clamp(puff.vy * .12, -.23, .23));
        if (puff.flip) ctx.scale(-1, 1);
        ctx.globalAlpha = opacity * fade;
        ctx.drawImage(image, -width / 2, -h / 2, width, h);
        ctx.restore();
      }
    }

    function drawBank(ctx, bank, image, fade, time) {
      if (!layer || !bank.wakes.length) {
        drawPuffs(ctx, bank.puffs, image, fade, time);
        return;
      }
      const ratio = Math.min(1, 810 / screenW, 560 / screenH);
      const bw = Math.max(1, Math.round(screenW * ratio)), bh = Math.max(1, Math.round(screenH * ratio));
      if (buffer.width !== bw || buffer.height !== bh) { buffer.width = bw; buffer.height = bh; }
      layer.setTransform(ratio, 0, 0, ratio, 0, 0);
      layer.clearRect(0, 0, screenW, screenH);
      drawPuffs(layer, bank.puffs, image, fade, time);
      layer.save();
      layer.globalCompositeOperation = 'destination-out';
      for (const wake of bank.wakes) {
        const pose = project(camera, wake.x, wake.y, wake.z);
        if (!pose) continue;
        const age = time - wake.time;
        const radius = wake.radius * pose.scale * mix(.86, 1.53, smooth(0, 1.35, age));
        const opening = Math.min(.91, wake.strength * .73) * smooth(0, .085, age) * (1 - smooth(.26, 1.38, age));
        if (opening <= 0) continue;
        const edge = layer.createRadialGradient(pose.x, pose.y, 0, pose.x, pose.y, radius);
        edge.addColorStop(0, `rgba(0,0,0,${opening})`);
        edge.addColorStop(.38, `rgba(0,0,0,${opening * .76})`);
        edge.addColorStop(1, 'rgba(0,0,0,0)');
        layer.fillStyle = edge;
        layer.fillRect(pose.x - radius, pose.y - radius, radius * 2, radius * 2);
      }
      layer.restore();
      ctx.drawImage(buffer, 0, 0, screenW, screenH);
    }

    function paint(ctx, width, height, progress, time, dt, reduced, opacity = 1, opening) {
      const image = texture.naturalWidth ? texture : fallback;
      const fade = (1 - smooth(.671, .785, progress)) * opacity;
      visible = [];
      if (!image || !fade || !width || !height) return;
      camera = cameraFor(progress, width, height);
      if (opening) {
        const share = 1 - smooth(.31, .46, progress);
        camera.x = mix(camera.x, opening.x - .14, share);
        camera.y = mix(camera.y, .02 - opening.y, share);
        camera.z = mix(camera.z, opening.z - .37, share);
      }
      screenW = width;
      screenH = height;
      while (wakes.length && time - wakes[0].time >= 1.48) wakes.shift();
      const layers = [];
      for (const bank of clouds) {
        const activeWakes = reduced ? [] : wakes.filter(wake => wake.bank === bank.index);
        const puffs = [];
        for (const puff of bank.puffs) {
          updatePuff(puff, activeWakes, time, dt);
          const drift = reduced ? 0 : Math.sin(time * .48 + puff.phase);
          const x = puff.x + (reduced ? 0 : puff.dx + drift * .045);
          const y = puff.y + (reduced ? 0 : puff.dy + drift * .017);
          const z = puff.z + (reduced ? 0 : puff.dz);
          const pose = project(camera, x, y, z);
          if (!pose) continue;
          const size = Math.min(width * 1.70, puff.width * pose.scale);
          if (pose.x + size / 2 < 0 || pose.x - size / 2 > width || pose.y + size / 3 < 0 || pose.y - size / 3 > height) continue;
          const opacity = puff.opacity * smooth(.22, .62, pose.depth) * (1 - .42 * smooth(2.3, 6.7, pose.depth));
          puffs.push({ puff, pose, width: size, opacity });
          visible.push({ bank: bank.index, pose, width: size });
        }
        if (!puffs.length) continue;
        puffs.sort((a, b) => b.pose.depth - a.pose.depth);
        const depth = puffs.reduce((sum, item) => sum + item.pose.depth, 0) / puffs.length;
        layers.push({ depth, puffs, wakes: activeWakes });
      }
      layers.sort((a, b) => b.depth - a.depth);
      for (const bank of layers) drawBank(ctx, bank, image, fade, time);
    }

    function stir(x, y, time, tap = false) {
      if (!camera || !visible.length) return false;
      const dx = lastStroke ? x - lastStroke.x : 0;
      const dy = lastStroke ? y - lastStroke.y : 0;
      const travelled = Math.hypot(dx, dy);
      if (!tap && lastStroke && travelled < 21 && time - lastStroke.time < .105) return false;
      if (!tap && lastStroke && travelled < 4) return false;
      lastStroke = { x, y, time };
      let chosen = null, score = Infinity;
      for (const item of visible) {
        const { pose, width } = item;
        if (pose.depth > 3.25) continue;
        const distance = Math.hypot((pose.x - x) / (width * .54), (pose.y - y) / (width * .22));
        if (distance > 1.20) continue;
        const next = distance + pose.depth * .20;
        if (next < score) { chosen = item; score = next; }
      }
      if (!chosen) return false;
      const world = unproject(camera, x, y, chosen.pose.depth);
      const radius = clamp(Math.min(screenW, screenH) * .17 / chosen.pose.scale, .13, .69);
      const length = Math.max(20, travelled);
      if (wakes.length >= 6) wakes.shift();
      wakes.push({
        ...world, bank: chosen.bank, radius, time,
        strength: tap ? 1.31 : clamp(.69 + travelled / 170, .69, 1.48),
        sweepX: dx / length, sweepY: -dy / length,
      });
      return true;
    }

    return { paint, stir, leave() { lastStroke = null; } };
  }

  window.CloudSpace = { cameraFor, project, unproject, createCloudScene };
})();
