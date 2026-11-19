(() => {
  const stage = document.querySelector('.stage');
  const trail = stage.querySelector('.rain-trail');
  const scene = stage.querySelector('.window-scene');
  const pause = stage.querySelector('#ambient');
  const enabled = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
  let previous = null;
  let distance = 0;
  let count = 0;

  function reset() {
    scene.style.removeProperty('--view-x');
    scene.style.removeProperty('--view-y');
    trail.replaceChildren();
    previous = null;
    distance = 0;
  }

  function bead(x, y, angle) {
    const drop = document.createElement('i');
    const size = ++count % 3 === 0 ? 3.1 : 2;
    drop.style.width = size + 'px';
    drop.style.height = size * 1.65 + 'px';
    const position = 'translate(' + x + 'px,' + y + 'px)';
    const tilt = 'rotate(' + angle + 'rad)';
    if (trail.childElementCount >= 18) trail.firstElementChild.remove();
    trail.append(drop);
    const fade = drop.animate([
      {transform: position + ' ' + tilt, opacity: 0.9},
      {transform: position + ' translateY(5px) ' + tilt + ' scale(.3)', opacity: 0}
    ], {duration: 350, easing: 'ease-out', fill: 'forwards'});
    fade.onfinish = () => drop.remove();
  }

  stage.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse' || document.hidden ||
        pause.getAttribute('aria-pressed') === 'true' || stage.classList.contains('sun-ready')) return;
    const bounds = stage.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    if (!scene.hidden) {
      scene.style.setProperty('--view-x', ((.5 - x / bounds.width) * Math.min(16, bounds.width * .014)) + 'px');
      scene.style.setProperty('--view-y', ((.5 - y / bounds.height) * Math.min(10, bounds.height * .014)) + 'px');
    }
    if (previous && event.timeStamp - previous.time < 180) {
      const dx = x - previous.x, dy = y - previous.y;
      const length = Math.hypot(dx, dy);
      const spacing = 13;
      const angle = Math.atan2(dy, dx) - Math.PI / 2;
      for (let along = spacing - distance; along <= length; along += spacing) {
        if (along >= length - spacing * 7) bead(previous.x + dx * along / length, previous.y + dy * along / length, angle);
      }
      distance = (distance + length) % spacing;
    } else distance = 0;
    previous = {x, y, time: event.timeStamp};
  }, {passive: true});

  for (const event of ['pointerleave', 'pointercancel']) stage.addEventListener(event, reset);
  for (const event of ['blur', 'resize', 'pageshow', 'scroll']) window.addEventListener(event, reset, {passive: true});
  document.addEventListener('visibilitychange', reset);
  enabled.addEventListener('change', reset);
  pause.addEventListener('click', reset);
})();
