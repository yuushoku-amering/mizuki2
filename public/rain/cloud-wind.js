(() => {
  const smooth = (a, b, value) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function createCloudWind() {
    const source = document.createElement('canvas');
    const output = document.createElement('canvas');
    const brush = source.getContext('2d');
    const wind = output.getContext('2d');
    const { drawTriangle } = window.RainCanvas;
    let lastBase, lastNext, lastBlend, lastZoom, lastTime, lastProgress, lastWidth, lastHeight;

    function paint(ctx, width, height, progress, time, base, next, blend, zoom, drawSource) {
      if (!brush || !wind || !width || !height) return false;
      const strength = 1 - smooth(.71, .803, progress);
      if (strength < .006) return false;
      const ratio = Math.min(1, 870 / width, 560 / height);
      const w = Math.max(1, Math.round(width * ratio)), h = Math.max(1, Math.round(height * ratio));
      const tick = width >= 741 && progress <= .35 ? time : Math.floor(time * 24) / 24;
      const resized = lastWidth !== width || lastHeight !== height;
      const changedSource = resized || lastBase !== base || lastNext !== next || lastBlend !== blend || lastZoom !== zoom;
      if (changedSource) {
        if (source.width !== w || source.height !== h) {
          source.width = output.width = w;
          source.height = output.height = h;
        }
        drawSource(brush, w, h);
        lastBase = base;
        lastNext = next;
        lastBlend = blend;
        lastZoom = zoom;
        lastWidth = width;
        lastHeight = height;
      }
      if (changedSource || tick !== lastTime || progress !== lastProgress) {
        advect(w, h, progress, tick, strength);
        lastTime = tick;
        lastProgress = progress;
      }
      ctx.drawImage(output, 0, 0, width, height);
      return true;
    }

    function advect(w, h, progress, time, strength) {
      const columns = Math.max(6, Math.round(w / 79));
      const rows = Math.max(6, Math.round(h / 69));
      const span = Math.min(w, h);
      const descent = smooth(0, .35, progress);
      const screen = [], sample = [];
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= columns; col++) {
          const u = col / columns, v = row / rows;
          const x = u * w, y = v * h;
          const border = smooth(0, .14, Math.min(u, 1 - u)) * smooth(0, .15, Math.min(v, 1 - v));
          const lowerBank = smooth(.28 + descent * .09, .87, v);
          const side = (u - .18) * 4.4;
          const wall = Math.exp(-side * side) * (1 - descent * .66);
          const distance = .19 + lowerBank * .63 + wall * .24;
          const flow = span * .105 * distance * border * strength;
          const broad = v * .94 + u * .31 - .40;
          const curl = u * 9.3 + v * 5.4 + Math.sin(v * 7.1) * .9;
          const push = Math.sin(broad - time * (.23 + distance * .20)) - Math.sin(broad);
          const roll = Math.sin(curl - time * (.58 + distance * .25)) - Math.sin(curl);
          const lift = Math.cos(curl - time * (.49 + distance * .24)) - Math.cos(curl);
          const shear = Math.sin(u * 3.7 - v * 6.5 - time * .31) - Math.sin(u * 3.7 - v * 6.5);
          screen.push([x, y]);
          sample.push([x + flow * (push * .67 + roll * .35),
            y + flow * (lift * .24 + shear * .13)]);
        }
      }

      wind.drawImage(source, 0, 0);
      const stride = columns + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const a = row * stride + col, b = a + 1, c = a + stride, d = c + 1;
          drawTriangle(wind, source, screen[a], screen[b], screen[c], sample[a], sample[b], sample[c]);
          drawTriangle(wind, source, screen[b], screen[d], screen[c], sample[b], sample[d], sample[c]);
        }
      }
    }

    return { paint };
  }

  window.createCloudWind = createCloudWind;
})();
