(() => {
  const columns = 7, rows = 9, stride = columns + 1;
  const padding = .20;

  function createLiquidSurface() {
    const buffer = document.createElement('canvas');
    const brush = buffer.getContext('2d');
    const nodes = Array.from({ length: stride * (rows + 1) }, (_, index) => {
      const col = index % stride, row = Math.floor(index / stride);
      const u = col / columns, v = row / rows;
      return {
        offsetX: 0, offsetY: 0, vx: 0, vy: 0, ax: 0, ay: 0, x: 0, y: 0, u, v,
        angle: Math.atan2(v - .5, u - .5),
        neighbors: [col > 0 ? index - 1 : null, col < columns ? index + 1 : null,
          row > 0 ? index - stride : null, row < rows ? index + stride : null].filter(i => i !== null),
      };
    });
    const pressure = {};
    let box, pivot, centerX, centerY, cosine, sine, clearing;
    let displaced = false;

    function reset() {
      for (const node of nodes) node.offsetX = node.offsetY = node.vx = node.vy = 0;
      displaced = false;
    }

    function update(nextBox, nextPivot, tilt, field, dt, enabled) {
      box = nextBox;
      pivot = nextPivot;
      centerX = box.left + box.width / 2;
      centerY = box.top + box.height * pivot;
      cosine = Math.cos(tilt);
      sine = Math.sin(tilt);
      clearing = null;
      if (!enabled) {
        if (displaced) reset();
        return;
      }
      const { x, y, radius, stretch, angle } = field.clearance;
      const localX = box.width / 2 + (x - centerX) * cosine + (y - centerY) * sine;
      const localY = box.height * pivot + (y - centerY) * cosine - (x - centerX) * sine;
      const reach = radius * stretch * 1.29;
      if (radius > .2 && localX > -reach && localX < box.width + reach &&
          localY > -reach && localY < box.height + reach) {
        clearing = { x: localX, y: localY, radius, stretch, angle: angle - tilt };
      }
      if (dt <= 0) return;

      const limit = Math.min(34, box.width * .15, box.height * .14);
      const steps = Math.ceil(dt * 120);
      const step = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const node of nodes) {
          const x = (node.u - .5) * box.width, y = (node.v - pivot) * box.height;
          field.pressureAt(centerX + x * cosine - y * sine + node.offsetX,
            centerY + x * sine + y * cosine + node.offsetY, node.angle + tilt, pressure);
          let adjacentX = 0, adjacentY = 0;
          for (const index of node.neighbors) {
            adjacentX += nodes[index].offsetX - node.offsetX;
            adjacentY += nodes[index].offsetY - node.offsetY;
          }
          node.ax = pressure.x * .34 + adjacentX * 59 - node.offsetX * 34 - node.vx * 7.4;
          node.ay = pressure.y * .34 + adjacentY * 59 - node.offsetY * 34 - node.vy * 7.4;
        }
        for (const node of nodes) {
          node.vx += node.ax * step;
          node.vy += node.ay * step;
          node.offsetX += node.vx * step;
          node.offsetY += node.vy * step;
          const reach = Math.hypot(node.offsetX, node.offsetY);
          if (reach > limit) {
            node.offsetX *= limit / reach;
            node.offsetY *= limit / reach;
            node.vx *= .73;
            node.vy *= .73;
          }
        }
      }
      displaced = nodes.some(node => Math.hypot(node.offsetX, node.offsetY) > .26 || Math.hypot(node.vx, node.vy) > 1.6);
      if (!displaced) reset();
    }

    function project(u, v, output) {
      const x = (u - .5) * box.width, y = (v - pivot) * box.height;
      output.x = centerX + x * cosine - y * sine;
      output.y = centerY + x * sine + y * cosine;
      if (!displaced) return;
      const col = Math.min(columns - 1, Math.floor(u * columns));
      const row = Math.min(rows - 1, Math.floor(v * rows));
      const i = row * stride + col;
      const h = u * columns - col, k = v * rows - row;
      const a = nodes[i], b = nodes[i + (h >= k ? 1 : stride)], d = nodes[i + stride + 1];
      const near = Math.min(h, k), far = Math.max(h, k);
      output.x += a.offsetX * (1 - far) + b.offsetX * (far - near) + d.offsetX * near;
      output.y += a.offsetY * (1 - far) + b.offsetY * (far - near) + d.offsetY * near;
    }

    function drawTriangle(source, a, b, c, origin, across, down, cellWidth, cellHeight, left, top) {
      const center = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
      // Slightly overlap adjacent clips so antialiasing leaves no seams.
      brush.save();
      brush.beginPath();
      brush.moveTo(a.x * 1.065 - center.x * .065, a.y * 1.065 - center.y * .065);
      brush.lineTo(b.x * 1.065 - center.x * .065, b.y * 1.065 - center.y * .065);
      brush.lineTo(c.x * 1.065 - center.x * .065, c.y * 1.065 - center.y * .065);
      brush.closePath();
      brush.clip();
      brush.transform(across.x / cellWidth, across.y / cellWidth,
        down.x / cellHeight, down.y / cellHeight, origin.x, origin.y);
      brush.drawImage(source, -left, -top, box.width, box.height);
      brush.restore();
    }

    function leaveClearWater() {
      if (!clearing) return;
      const { x, y, radius, stretch, angle } = clearing;
      brush.save();
      brush.translate(x, y);
      brush.rotate(angle);
      brush.scale(stretch, 1 / Math.sqrt(stretch));
      const rim = brush.createRadialGradient(0, 0, radius * .80, 0, 0, radius * 1.33);
      rim.addColorStop(0, 'rgba(220,245,249,0)');
      rim.addColorStop(.36, 'rgba(218,245,250,.29)');
      rim.addColorStop(.68, 'rgba(153,221,235,.09)');
      rim.addColorStop(1, 'rgba(153,221,235,0)');
      brush.globalCompositeOperation = 'source-atop';
      brush.fillStyle = rim;
      brush.fillRect(-radius * 1.34, -radius * 1.34, radius * 2.68, radius * 2.68);

      const gap = brush.createRadialGradient(0, 0, radius * .79, 0, 0, radius * 1.05);
      gap.addColorStop(0, '#000');
      gap.addColorStop(1, '#0000');
      brush.globalCompositeOperation = 'destination-out';
      brush.fillStyle = gap;
      brush.fillRect(-radius * 1.06, -radius * 1.06, radius * 2.12, radius * 2.12);
      brush.restore();
    }

    function texture(source) {
      if ((!displaced && !clearing) || !brush) return { source, ...box };
      const padX = box.width * padding, padY = box.height * padding;
      const frameWidth = box.width + padX * 2, frameHeight = box.height + padY * 2;
      const ratio = Math.min(1.45, 640 / Math.max(frameWidth, frameHeight));
      const pixelWidth = Math.max(1, Math.round(frameWidth * ratio));
      const pixelHeight = Math.max(1, Math.round(frameHeight * ratio));
      if (buffer.width !== pixelWidth) buffer.width = pixelWidth;
      if (buffer.height !== pixelHeight) buffer.height = pixelHeight;
      brush.setTransform(1, 0, 0, 1, 0, 0);
      brush.clearRect(0, 0, pixelWidth, pixelHeight);
      brush.setTransform(pixelWidth / frameWidth, 0, 0, pixelHeight / frameHeight,
        padX * pixelWidth / frameWidth, padY * pixelHeight / frameHeight);
      if (displaced) paintMesh(source);
      else brush.drawImage(source, 0, 0, box.width, box.height);
      leaveClearWater();
      return { source: buffer, left: box.left - padX, top: box.top - padY, width: frameWidth, height: frameHeight };
    }

    function paintMesh(source) {
      brush.globalCompositeOperation = 'copy';
      const cellWidth = box.width / columns, cellHeight = box.height / rows;
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= columns; col++) {
          const node = nodes[row * stride + col];
          node.x = col * cellWidth + node.offsetX * cosine + node.offsetY * sine;
          node.y = row * cellHeight + node.offsetY * cosine - node.offsetX * sine;
        }
      }
      const delta = (a, b) => ({ x: b.x - a.x, y: b.y - a.y });
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const i = row * stride + col;
          const a = nodes[i], b = nodes[i + 1], c = nodes[i + stride], d = nodes[i + stride + 1];
          const left = col * cellWidth, top = row * cellHeight;
          drawTriangle(source, a, b, d, a, delta(a, b), delta(b, d), cellWidth, cellHeight, left, top);
          drawTriangle(source, a, d, c, a, delta(c, d), delta(a, c), cellWidth, cellHeight, left, top);
        }
      }
      brush.globalCompositeOperation = 'source-over';
    }

    function paint(ctx, frame, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(centerX, centerY);
      ctx.transform(cosine, sine, -sine, cosine, 0, 0);
      ctx.drawImage(frame.source, frame.left - centerX, frame.top - centerY, frame.width, frame.height);
      ctx.restore();
    }

    return { update, project, texture, paint };
  }

  window.createLiquidSurface = createLiquidSurface;
})();
