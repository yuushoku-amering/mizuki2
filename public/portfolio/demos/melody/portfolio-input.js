// Portfolio copy only: absolute mouse input works inside an embedded preview.
// The original MelodyAiming project remains unchanged.
lockPointer = function () {};
document.addEventListener('mousemove', e => {
  if (!S.running || S.paused || e.target !== cvs) return;
  const box = cvs.getBoundingClientRect();
  cam.yaw = clamp(((e.clientX - box.left) / box.width - .5) * 120, -VIEW_YAW, VIEW_YAW);
  cam.pitch = clamp((.5 - (e.clientY - box.top) / box.height) * 50, -VIEW_PITCH, VIEW_PITCH);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !S.running || S.paused) return;
  e.preventDefault();e.stopImmediatePropagation();
  S.paused = true;audio.pause();
  if (SCREEN.video) SCREEN.video.pause();
  $pause.style.display = 'flex';
}, true);
cvs.style.cursor = 'crosshair';
