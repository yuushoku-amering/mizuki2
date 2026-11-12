const pageTurnDuration = 730;
const pageColumns = 28;
const pageRows = 8;
const pageCornerNames = ["back-spine", "back-edge", "front-spine", "front-edge"];

function pageMesh(corners, progress) {
  const [backSpine, backEdge, frontSpine, frontEdge] = corners;
  const angle = Math.PI * progress;
  const bend = Math.sin(angle) * .77;
  const cornerLift = progress < .25 ? Math.sin(Math.PI * progress / .25) * .62 : 0;

  return Array.from({ length: pageRows + 1 }, (_, row) => {
    const v = row / pageRows;
    let x = backSpine.x + (frontSpine.x - backSpine.x) * v;
    let y = backSpine.y + (frontSpine.y - backSpine.y) * v;
    const width = backEdge.x + (frontEdge.x - backEdge.x) * v - x;
    const slope = backEdge.y + (frontEdge.y - backEdge.y) * v - y;
    const points = [{ x, y, face: Math.cos(angle) }];

    for (let column = 0; column < pageColumns; column++) {
      const u = (column + .5) / pageColumns;
      const tangent = angle + bend * u * (.65 + .35 * v) + cornerLift * u ** 3 * (.25 + .75 * v ** 2);
      const face = Math.cos(tangent);
      x += width * face / pageColumns;
      y += (slope * face - width * Math.sin(tangent) * (.63 - .08 * v)) / pageColumns;
      points.push({ x, y, face });
    }
    return points;
  });
}

function drawPaperPage(context, mesh, opacity) {
  const back = mesh[0];
  const front = mesh[pageRows];
  context.beginPath();
  context.moveTo(back[0].x, back[0].y);
  for (const point of back.slice(1)) context.lineTo(point.x, point.y);
  for (const row of mesh.slice(1)) context.lineTo(row[pageColumns].x, row[pageColumns].y);
  for (const point of front.slice(0, -1).reverse()) context.lineTo(point.x, point.y);
  context.closePath();

  context.save();
  context.globalAlpha = opacity;
  context.shadowColor = "#5d462f63";
  context.shadowBlur = 25;
  context.shadowOffsetX = 9;
  context.shadowOffsetY = 16;
  context.fillStyle = "#f7ead2";
  context.fill();
  context.restore();

  context.save();
  context.globalAlpha = opacity;
  context.clip();
  for (let row = 0; row < pageRows; row++) {
    for (let col = 0; col < pageColumns; col++) {
      const quad = [mesh[row][col], mesh[row][col + 1], mesh[row + 1][col + 1], mesh[row + 1][col]];
      const face = quad[1].face;
      const shade = Math.abs(face) * 17 + Math.sin(col / pageColumns * Math.PI) * 12;
      const paper = face < 0 ? [223, 205, 170] : [234, 218, 186];
      context.beginPath();
      context.moveTo(quad[0].x, quad[0].y);
      for (const point of quad.slice(1)) context.lineTo(point.x, point.y);
      context.closePath();
      context.fillStyle = context.strokeStyle = `rgb(${paper.map(channel => Math.round(channel + shade)).join(",")})`;
      context.lineWidth = 1.4;
      context.fill();
      context.stroke();
    }
  }
  context.restore();

  context.save();
  context.globalAlpha = opacity * .85;
  context.beginPath();
  const edge = mesh.map(row => row[pageColumns]);
  context.moveTo(edge[0].x, edge[0].y);
  for (const point of edge.slice(1)) context.lineTo(point.x, point.y);
  context.strokeStyle = "#fffdf4";
  context.lineWidth = 1.3;
  context.stroke();
  context.restore();
}

function animatePaperTurn(canvas, onHalfway, onFinish) {
  const context = canvas.getContext("2d");
  if (!context) {
    onHalfway();
    onFinish();
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const corners = pageCornerNames.map(name => {
    const point = document.querySelector(`[data-corner="${name}"]`).getBoundingClientRect();
    return { x: point.left - bounds.left, y: point.top - bounds.top };
  });
  const density = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = Math.ceil(bounds.width * density);
  canvas.height = Math.ceil(bounds.height * density);
  context.setTransform(density, 0, 0, density, 0, 0);

  let frame;
  let committed = false;
  const start = performance.now();
  canvas.classList.add("is-turning");

  const stop = () => {
    cancelAnimationFrame(frame);
    canvas.classList.remove("is-turning");
    context.clearRect(0, 0, bounds.width, bounds.height);
  };

  function draw(now) {
    const time = Math.min(1, (now - start) / pageTurnDuration);
    const progress = (1 - Math.cos(Math.PI * time)) / 2;
    context.clearRect(0, 0, bounds.width, bounds.height);
    if (time < 1) {
      const opacity = Math.min(1, time / .18, (1 - time) / .2);
      drawPaperPage(context, pageMesh(corners, progress), opacity);
    }
    if (!committed && time >= .53) {
      committed = true;
      onHalfway();
    }
    if (time < 1) frame = requestAnimationFrame(draw);
    else {
      stop();
      onFinish();
    }
  }

  frame = requestAnimationFrame(draw);
  return stop;
}
