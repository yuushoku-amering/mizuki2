(() => {
  function drawTriangle(ctx, image, a, b, c, sa, sb, sc) {
    const ux = sb[0] - sa[0], uy = sb[1] - sa[1];
    const vx = sc[0] - sa[0], vy = sc[1] - sa[1];
    const determinant = ux * vy - uy * vx;
    if (Math.abs(determinant) < .001) return;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const ex = c[0] - a[0], ey = c[1] - a[1];
    const m00 = (dx * vy - ex * uy) / determinant;
    const m01 = (ex * ux - dx * vx) / determinant;
    const m10 = (dy * vy - ey * uy) / determinant;
    const m11 = (ey * ux - dy * vx) / determinant;
    const tx = a[0] - m00 * sa[0] - m01 * sa[1];
    const ty = a[1] - m10 * sa[0] - m11 * sa[1];
    const centerX = (a[0] + b[0] + c[0]) / 3, centerY = (a[1] + b[1] + c[1]) / 3;
    ctx.save();
    ctx.beginPath();
    [a, b, c].forEach(([px, py], i) => {
      const length = Math.max(1, Math.hypot(px - centerX, py - centerY));
      const x = px + .65 * (px - centerX) / length;
      const y = py + .65 * (py - centerY) / length;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath(); ctx.clip();
    ctx.transform(m00, m10, m01, m11, tx, ty);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }

  window.RainCanvas = { drawTriangle };
})();
