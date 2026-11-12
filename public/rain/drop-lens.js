(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = (a, b, value) => { const t = clamp((value - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  const { drawTriangle } = window.RainCanvas;

  function createWaterLens() {
    const snapshot = document.createElement('canvas');
    const captured = snapshot.getContext('2d');
    const extended = document.createElement('canvas');
    const edgeBrush = extended.getContext('2d');

    function capture(scene, width, height) {
      const ratio = Math.min(1, 780 / width, 520 / height);
      const rw = Math.max(1, Math.round(width * ratio)), rh = Math.max(1, Math.round(height * ratio));
      if (snapshot.width !== rw || snapshot.height !== rh) { snapshot.width = rw; snapshot.height = rh; }
      captured.drawImage(scene, 0, 0, rw, rh);
    }

    function extendTexture() {
      const w = snapshot.width, h = snapshot.height;
      const px = Math.ceil(w * .35), py = Math.ceil(h * .35);
      if (extended.width !== w + px * 2 || extended.height !== h + py * 2) {
        extended.width = w + px * 2;
        extended.height = h + py * 2;
      }
      const across = [[0, px, px, -1], [0, w, px, 1], [w - px, px, w + px * 2, -1]];
      const down = [[0, py, py, -1], [0, h, py, 1], [h - py, py, h + py * 2, -1]];
      for (const [sx, width, dx, flipX] of across) {
        for (const [sy, height, dy, flipY] of down) {
          edgeBrush.setTransform(flipX, 0, 0, flipY, dx, dy);
          edgeBrush.drawImage(snapshot, sx, sy, width, height, 0, 0, width, height);
        }
      }
      return { px, py };
    }

    function warp(ctx, width, height, x, y, radius, amplitude, time, curl, wave) {
      if (!edgeBrush) return;
      const rw = snapshot.width, rh = snapshot.height;
      const { px: padX, py: padY } = extendTexture();
      const rx = rw / width, ry = rh / height;
      const tile = Math.max(24, Math.ceil(Math.min(width, height) / 15));
      const minX = Math.max(0, Math.floor((x - radius) / tile) * tile);
      const minY = Math.max(0, Math.floor((y - radius * 1.22) / tile) * tile);
      const maxX = Math.min(width, x + radius * 1.02);
      const maxY = Math.min(height, y + radius);
      function refract([px, py]) {
        const vx = px - x, vy = py - y, distance = Math.hypot(vx, vy);
        const border = ease(0, width * .115, Math.min(px, width - px)) * ease(0, height * .115, Math.min(py, height - py));
        if (wave) {
          const stretch = Math.hypot(vx, vy / wave.aspect);
          const offset = (stretch - wave.front) / wave.band;
          const crest = Math.sin(offset * 5.2) * Math.exp(-offset * offset * .75);
          const behind = offset + 1.32;
          const wake = Math.sin(behind * 5.7) * Math.exp(-behind * behind * 1.25);
          const force = (crest + wake * .44) * amplitude * border / Math.max(1, distance);
          return [padX + (px + vx * force) * rx, padY + (py + vy * force) * ry];
        }
        const edge = Math.min(1.45, distance / radius);
        const bend = (.37 - edge * .52) * amplitude * border;
        const ripple = Math.sin(edge * 17 - time * 2.4 + vy * .008) * amplitude * border * (4 + curl * 10);
        const twist = Math.sin(edge * 5.4 - time * .80) * amplitude * curl * .29 * border;
        return [padX + (px + vx * bend - vy * twist + ripple * vx / Math.max(1, distance)) * rx,
          padY + (py + vy * bend + vx * twist + ripple * vy / Math.max(1, distance)) * ry];
      }
      for (let dy = minY; dy < maxY; dy += tile) {
        for (let dx = minX; dx < maxX; dx += tile) {
          const nextX = Math.min(width, dx + tile), nextY = Math.min(height, dy + tile);
          const a = [dx, dy], b = [nextX, dy], c = [dx, nextY], d = [nextX, nextY];
          const sa = refract(a), sb = refract(b), sc = refract(c), sd = refract(d);
          drawTriangle(ctx, extended, a, b, c, sa, sb, sc);
          drawTriangle(ctx, extended, b, d, c, sb, sd, sc);
        }
      }
    }

    function paintRipple(ctx, scene, width, height, p, time, center) {
      if (!captured || p <= .35 || p >= .48 || !width || !height) return;
      const t = (p - .35) / .13;
      const span = Math.min(width, height);
      const reach = Math.hypot(width, height);
      const spread = ease(.01, .90, t);
      const active = ease(0, .15, t) * (1 - ease(.72, 1, t));
      const front = mix(span * .035, reach * .76, spread);
      const x = mix(center.x, width * .52, spread);
      const y = mix(center.y, height * .54, spread);
      const aspect = mix(.40, .67, spread);
      const band = span * (.068 + spread * .048);
      capture(scene, width, height);

      ctx.save();
      ctx.globalAlpha = active;
      warp(ctx, width, height, x, y, reach, span * .041, time, 0, { front, aspect, band });
      for (let i = 0; i < 4; i++) {
        const r = front - i * band * (.47 + spread * .21);
        if (r <= 2) continue;
        const light = ctx.createLinearGradient(x - r, y + r * aspect, x + r, y - r * aspect);
        light.addColorStop(0, '#94c8e332');
        light.addColorStop(.32, '#c0e8efbf');
        light.addColorStop(.55, '#2c748e27');
        light.addColorStop(.76, '#f5fae2cb');
        light.addColorStop(1, '#b9deea26');
        ctx.globalAlpha = active * (1 - i * .15);
        ctx.strokeStyle = light;
        ctx.lineWidth = 1.35 + (3 - i) * .60 * (1 - spread * .59);
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * aspect, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha *= .42;
        ctx.strokeStyle = '#7bbfd8';
        ctx.lineWidth = .75;
        ctx.beginPath();
        ctx.ellipse(x, y, r + 3.2, (r + 3.2) * aspect, 0, .07, Math.PI * 1.82);
        ctx.stroke();
      }
      ctx.restore();
    }

    function fillCamera(image, opacity) {
      if (!image?.width || !opacity) return;
      const width = snapshot.width, height = snapshot.height;
      const scale = Math.min(width / image.width, height / image.height) * 1.22;
      const w = image.width * scale, h = image.height * scale;
      captured.globalAlpha = opacity;
      captured.drawImage(image, (width - w) * .5, (height - h) * .5, w, h);
      captured.globalAlpha = 1;
    }

    function paintBell(ctx, scene, width, height, p, time, rim, bellWidth, camera, surfaceX, surfaceY) {
      if (!captured || p <= .70 || p >= .895 || !width || !height) return;
      const t = (p - .70) / .195;
      const entry = ease(.01, .55, t);
      const active = ease(0, .17, t) * (1 - ease(.65, 1, t));
      const span = Math.min(width, height);
      const radius = mix(bellWidth * .41, Math.hypot(width, height) * .78, entry);
      const x = mix(rim.x, width * .50, entry), y = mix(rim.y, height * .50, entry);
      const oval = mix(.48, 1, entry);
      capture(scene, width, height);
      const viewOpacity = ease(.02, .19, t) * (1 - ease(.70, .96, t));
      fillCamera(camera, viewOpacity);

      ctx.save();
      ctx.globalAlpha = active;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * oval, -.11 * (1 - entry), 0, Math.PI * 2);
      ctx.clip();
      warp(ctx, width, height, x, y, radius, .85 + .28 * entry, time + t * 5.4, 1.17);
      const tint = ctx.createLinearGradient(x - radius, y + radius, x + radius, y - radius);
      tint.addColorStop(0, '#2162856a');
      tint.addColorStop(.48, '#1d4b6b0b');
      tint.addColorStop(1, '#b5e0f052');
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      const match = ease(.67, 1, t);
      const arcRadius = mix(radius, span * .29, match);
      const arcX = mix(x,surfaceX,match), arcY = mix(y,surfaceY,match);
      ctx.strokeStyle = '#d4f1f7a0';
      ctx.lineWidth = mix(1, 5.4, entry);
      ctx.beginPath();
      ctx.ellipse(arcX, arcY, arcRadius, arcRadius * mix(oval,.18,match), -.11 * (1 - entry), .14, Math.PI * 1.84);
      ctx.stroke();

      const wake = ease(.48, .70, t) * (1 - ease(.77, .98, t));
      for (let i = 0; i < 4; i++) {
        const wave = span * (.14 + i * .083 + t * .31);
        ctx.globalAlpha = active * wake * (.22 - i * .038);
        ctx.strokeStyle = i % 2 ? '#96deed' : '#d2f5ef';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.ellipse(x, y + span * .07, wave * 1.53, wave * .39, -.08, i * .31, Math.PI * 1.76 + i * .31);
        ctx.stroke();
      }
      ctx.restore();
    }

    return { paintRipple, paintBell };
  }

  window.createWaterLens = createWaterLens;
})();
