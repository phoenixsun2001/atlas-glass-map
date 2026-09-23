export function initGlassInteractions() {
  const readability = document.querySelector('#readability');
  const systemReadability = matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more)');
  function updateReadability() {
    document.body.classList.toggle('readability', readability.checked);
  }
  readability.checked = systemReadability.matches;
  readability.addEventListener('change', updateReadability);
  systemReadability.addEventListener('change', () => {
    readability.checked = systemReadability.matches;
    updateReadability();
  });
  updateReadability();

  // Only update small navigation surfaces while the pointer moves over them.
  // No perpetual animation or full-screen distortion pass on a moving map.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, surface = null, x = 0, y = 0;
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motion.matches || readability.checked) return;
    const target = event.target.closest('.liquid-control');
    if (!target) return;
    surface = target; x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--light-x', `${((x - bounds.left) / bounds.width * 100).toFixed(1)}%`);
      surface.style.setProperty('--light-y', `${((y - bounds.top) / bounds.height * 100).toFixed(1)}%`);
    });
  }, { passive: true });
}
