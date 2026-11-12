(() => {
  const clamp = value => Math.max(0, Math.min(1, value));
  const fade = (a, b, value) => {
    const t = clamp((value - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const tau = Math.PI * 2;
  const hands = [[.80,.55],[.72,.64],[.76,.54],[.80,.44],[.79,.52],[.74,.57],[.71,.54],[.81,.45]];

  function createRainDeparture({ overlay, content, reduced, getWater, onStateChange }) {
    const canvas = overlay.querySelector('canvas');
    const brush = canvas.getContext('2d');
    const label = overlay.querySelector('[role="status"]');
    const loader = overlay.querySelector('.rain-loader');
    const skip = overlay.querySelector('.rain-skip');
    const runner = new Image();
    runner.src = '/rain/yuling-run-cycle.webp';
    let width, height, pixelRatio, active = false, leaving = false;
    let frame = 0, start, destination, link, water, fragments, rain, reveal;

    function size() {
      width = overlay.clientWidth;
      height = overlay.clientHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }

    function seedRain() {
      let seed = 713;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      fragments = (water?.points ?? []).filter((_, i) => i % 2 === 0).map(([u, v, r, g, b, z]) => ({
        u: u / 255, v: v / 255, color: `rgb(${r},${g},${b})`,
        angle: random() * tau, velocity: 28 + random() * 128,
        radius: .45 + random() * 1.55, delay: random() * .115, z,
      }));
      rain = Array.from({ length: 310 }, () => ({
        x: random(), y: random(), depth: random(), delay: random(),
      }));
    }

    function paintBreakup(t) {
      if (!water?.source.naturalWidth) return;
      const heightOnScreen = water.height ?? Math.min(height * .43, width * .64, 355);
      const w = heightOnScreen * water.source.naturalWidth / water.source.naturalHeight;
      const x = (water.x ?? width * .5) - w / 2;
      const y = (water.y ?? height * .43) - heightOnScreen * .50;
      const gather = fade(0, .16, t);
      brush.globalAlpha = gather * (1 - fade(.15, .36, t)) * .95;
      brush.drawImage(water.source, x, y, w, heightOnScreen);
      for (const drop of fragments) {
        const move = Math.max(0, (t - .14 - drop.delay) * 3.3);
        const speed = drop.velocity * (1.1 - drop.z * .17);
        const shiftX = Math.cos(drop.angle) * speed * move;
        const shiftY = Math.sin(drop.angle) * speed * .46 * move + height * .88 * move * move;
        const px = x + w * drop.u + shiftX;
        const py = y + heightOnScreen * drop.v + shiftY;
        if (py > height + 30) continue;
        brush.globalAlpha = fade(.02, .18, t) * (1 - fade(.40, .56, t)) * .83;
        brush.fillStyle = drop.color;
        brush.beginPath();
        brush.ellipse(px, py, drop.radius * (1 - Math.min(.36, move * .20)), drop.radius * (1 + move * 2.9), -.13, 0, tau);
        brush.fill();
      }
    }

    function paintRain(t, time) {
      const downpour = fade(.24, .52, t);
      const quiet = fade(.55, .76, t);
      brush.lineCap = 'round';
      for (const line of rain) {
        const z = line.depth;
        const strength = downpour * fade(line.delay * .31, .21 + line.delay * .30, t) * (1 - quiet * .67);
        const drift = time * (.75 + z * .95);
        const x = ((line.x + drift * .10) % 1.14) * width - width * .07;
        const y = ((line.y + drift * 2.7) % 1.35) * height - height * .17;
        const length = 10 + z ** 1.8 * Math.min(90, height * .13);
        brush.globalAlpha = strength * (.10 + z * .44);
        brush.strokeStyle = '#cdebf5';
        brush.lineWidth = .48 + z * 1.20;
        brush.beginPath();
        brush.moveTo(x, y);
        brush.lineTo(x - length * .16, y - length);
        brush.stroke();
      }
    }

    function paintUmbrella(x, y, gripX, gripY, scale) {
      brush.lineCap = 'round';
      brush.strokeStyle = '#b4dce2';
      brush.lineWidth = Math.max(1, scale * 1.7);
      brush.beginPath();
      brush.moveTo(x, y - 4 * scale);
      brush.lineTo(gripX, gripY);
      brush.quadraticCurveTo(gripX - 2 * scale, gripY + 8 * scale, gripX - 8 * scale, gripY + 4 * scale);
      brush.stroke();
      brush.save();
      brush.translate(x, y);
      brush.scale(scale, scale);
      brush.rotate(-.095);
      const tint = brush.createLinearGradient(-29, -30, 28, 6);
      tint.addColorStop(0, '#91c2cd');
      tint.addColorStop(.45, '#497f92');
      tint.addColorStop(1, '#243a55');
      brush.fillStyle = tint;
      brush.strokeStyle = '#b3dce1';
      brush.lineWidth = 1;
      brush.beginPath();
      brush.moveTo(-55, 7);
      brush.bezierCurveTo(-45, -16, -18, -32, 0, -33);
      brush.bezierCurveTo(25, -33, 48, -18, 56, 7);
      brush.quadraticCurveTo(36, .5, 23, 9);
      brush.quadraticCurveTo(0, 1, -20, 9);
      brush.quadraticCurveTo(-36, 1, -55, 7);
      brush.closePath();
      brush.fill();
      brush.stroke();
      brush.strokeStyle = '#d0ebf18f';
      brush.beginPath();
      brush.moveTo(-20, 8);
      brush.quadraticCurveTo(-13, -21, 0, -33);
      brush.quadraticCurveTo(16, -22, 23, 8);
      brush.moveTo(0, -33);
      brush.lineTo(1, -38);
      brush.stroke();
      brush.restore();
    }

    function paintRunner(t, elapsed, advance) {
      if (!runner.naturalWidth) return;
      const footY = height * .64;
      const spriteH = Math.min(158, height * .255, width * .41);
      const spriteW = spriteH * .75;
      const halfRail = Math.min(width * .31, 225);
      const x = width / 2 + (advance * 2 - 1) * halfRail;
      const index = Math.floor(Math.max(0, elapsed - 380) / 89) % hands.length;
      const left = x - spriteW * .61, top = footY - spriteH;
      const sw = runner.naturalWidth / 4, sh = runner.naturalHeight / 2;
      brush.globalAlpha = fade(.51, .68, t);
      brush.drawImage(runner, index % 4 * sw, Math.floor(index / 4) * sh, sw, sh, left, top, spriteW, spriteH);
      const [handX, handY] = hands[index];
      const gripX = left + handX * spriteW;
      const gripY = top + handY * spriteH;
      const scale = spriteH / 150;
      paintUmbrella(gripX + 8 * scale, top - 4 * scale, gripX, gripY, scale);
    }

    function reset(restoreFocus = false) {
      if (!active) return;
      cancelAnimationFrame(frame);
      reveal?.cancel();
      reveal = null;
      active = leaving = false;
      overlay.hidden = true;
      content.inert = false;
      onStateChange(false);
      if (restoreFocus) link?.focus({ preventScroll: true });
    }

    function enterPage() {
      leaving = true;
      const here = new URL(window.location.href);
      const local = destination.origin === here.origin && destination.pathname === here.pathname &&
        destination.search === here.search && destination.hash;
      const target = local && document.getElementById(destination.hash.slice(1));
      if (!target) {
        window.location.assign(destination.href);
        return;
      }
      try { history.pushState(null, '', destination.hash); }
      catch { window.location.hash = destination.hash; }
      target.scrollIntoView({ behavior: 'instant' });
      reveal = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-out', fill: 'forwards' });
      reveal.finished.then(() => {
        reset();
        target.focus({ preventScroll: true });
      }).catch(() => {});
    }

    function render(now) {
      start ??= now;
      const elapsed = now - start;
      const t = clamp(elapsed / 760);
      const advance = fade(.56, .998, t);
      loader.style.opacity = fade(.51, .68, t);
      brush.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      brush.clearRect(0, 0, width, height);
      brush.globalAlpha = fade(0, .47, t);
      const fog = brush.createLinearGradient(0, 0, width * .4, height);
      fog.addColorStop(0, '#10212c');
      fog.addColorStop(.62, '#142c3a');
      fog.addColorStop(1, '#0c1823');
      brush.fillStyle = fog;
      brush.fillRect(0, 0, width, height);
      paintBreakup(t);
      paintRain(t, elapsed / 760);
      paintRunner(t, elapsed, advance);
      brush.globalAlpha = 1;
      if (t === 1 && !leaving) enterPage();
      if (active && !reveal) frame = requestAnimationFrame(render);
    }

    function intercept(event) {
      const anchor = event.currentTarget;
      if (!brush || reduced.matches || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      event.preventDefault();
      if (active) return;
      link = anchor;
      destination = new URL(anchor.href);
      skip.href = destination.href;
      water = getWater();
      active = true;
      start = undefined;
      label.textContent = `正在前往${anchor.dataset.rainExit}`;
      loader.style.opacity = 0;
      overlay.hidden = false;
      content.inert = true;
      overlay.focus({ preventScroll: true });
      size();
      seedRain();
      onStateChange(true);
      frame = requestAnimationFrame(render);
    }

    for (const anchor of content.querySelectorAll('a[data-rain-exit]')) anchor.addEventListener('click', intercept);
    window.addEventListener('resize', () => { if (active) size(); });
    window.addEventListener('pageshow', () => reset());
    window.addEventListener('pagehide', () => reset());
    skip.addEventListener('click', event => {
      if (leaving || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      enterPage();
    });
    overlay.addEventListener('wheel', event => event.preventDefault(), { passive: false });
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !leaving) reset(true);
      if (event.key === 'Enter' && event.target === overlay && !leaving) enterPage();
    });
    return { get active() { return active; } };
  }

  window.createRainDeparture = createRainDeparture;
})();
