const world = document.querySelector('.kai-world');
const canvas = world.querySelector('.kai-world-canvas');
const media = [...world.querySelectorAll('.kai-world-media')];
const buttons = [...world.querySelectorAll('[data-world-video]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
const compact = matchMedia('(max-width: 900px)');
let active = null;
let hovered = null;
let generation = 0;
let autoplayBlocked = new WeakSet();
const visible = new Map();

function pause() {
  generation++;
  if (active) {
    active.querySelector('video').pause();
    active.dataset.playing = 'false';
    active.setAttribute('aria-pressed', 'false');
    active.setAttribute('aria-label', `Play: ${active.querySelector('img').alt}`);
  }
  active = null;
}
async function play(button, explicit = false) {
  if (document.hidden || (!explicit && (reduced.matches || autoplayBlocked.has(button)))) return;
  if (active === button) return;
  pause();
  active = button;
  const request = generation;
  const video = button.querySelector('video');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  if (!video.getAttribute('src')) {
    // No video URLs enter the media loader before an actual playback request.
    video.poster = button.querySelector('img').currentSrc || button.querySelector('img').src;
    video.src = compact.matches ? video.dataset.mobile : video.dataset.desktop;
  }
  try {
    await video.play();
    if (request !== generation || active !== button) {
      // A newer request for this same video may already be playing.
      if (active !== button) video.pause();
      return;
    }
    button.dataset.playing = 'true';
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', `Pause: ${button.querySelector('img').alt}`);
  } catch {
    if (request === generation && active === button) {
      autoplayBlocked.add(button);
      pause(); // Poster remains usable; a tap/click can retry with user activation.
    }
  }
}
function chooseVisible() {
  if (desktop.matches || reduced.matches || document.hidden) return;
  const candidates = buttons.filter(button => (visible.get(button) || 0) >= .65 && !autoplayBlocked.has(button));
  candidates.sort((a, b) => {
    const distance = button => { const r = button.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - innerHeight / 2); };
    return distance(a) - distance(b);
  });
  const next = candidates[0];
  if (next) play(next);
  else pause();
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    visible.set(entry.target, entry.intersectionRatio);
    if (active === entry.target && entry.intersectionRatio < .6) pause();
  }
  chooseVisible();
}, { threshold: [0, .25, .5, .6, .65, .75, .9, 1] });
for (const button of buttons) {
  observer.observe(button);
  button.addEventListener('pointerenter', event => {
    if (desktop.matches && event.pointerType === 'mouse') { hovered = button; play(button); }
  });
  button.addEventListener('pointerleave', () => {
    if (hovered === button) hovered = null;
    if (desktop.matches && active === button) pause();
  });
  button.addEventListener('click', () => {
    if (active === button) { autoplayBlocked.add(button); pause(); }
    else { autoplayBlocked.delete(button); play(button, true); }
  });
  button.addEventListener('blur', () => {
    if (desktop.matches && active === button && hovered !== button) pause();
  });
}
// Minimal pointer depth: only transforms, max 11px; no work when off screen.
let depthFrame = 0;
let goalX = 0, goalY = 0, currentX = 0, currentY = 0;
function depthTick() {
  currentX += (goalX - currentX) * .12;
  currentY += (goalY - currentY) * .12;
  for (const item of media) {
    const depth = Number(item.style.getPropertyValue('--world-depth'));
    item.style.setProperty('--world-shift-x', `${(currentX * depth).toFixed(2)}px`);
    item.style.setProperty('--world-shift-y', `${(currentY * depth).toFixed(2)}px`);
  }
  if (Math.abs(goalX-currentX)+Math.abs(goalY-currentY) > .001) depthFrame = requestAnimationFrame(depthTick);
  else depthFrame = 0;
}
function resetDepth() {
  cancelAnimationFrame(depthFrame); depthFrame = 0;
  goalX = goalY = currentX = currentY = 0;
  for (const item of media) { item.style.removeProperty('--world-shift-x'); item.style.removeProperty('--world-shift-y'); }
}
canvas.addEventListener('pointermove', event => {
  if (!desktop.matches || reduced.matches || event.pointerType !== 'mouse') return;
  const r = canvas.getBoundingClientRect();
  goalX = Math.max(-1, Math.min(1, (event.clientX-r.left)/r.width*2-1));
  goalY = Math.max(-1, Math.min(1, (event.clientY-r.top)/r.height*2-1));
  const radius = Math.max(1, Math.hypot(goalX, goalY));
  goalX /= radius; goalY /= radius;
  if (!depthFrame) depthFrame = requestAnimationFrame(depthTick);
});
canvas.addEventListener('pointerleave', () => {
  goalX = goalY = 0;
  if (!depthFrame && !reduced.matches && desktop.matches) depthFrame = requestAnimationFrame(depthTick);
});
function modeChanged() { pause(); resetDepth(); chooseVisible(); }
reduced.addEventListener('change', modeChanged);
desktop.addEventListener('change', modeChanged);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pause(); resetDepth(); }
  else chooseVisible();
});
window.addEventListener('pagehide', () => { pause(); resetDepth(); });

// Progressive enhancement: without JS every film remains available.
const more = world.querySelector('.kai-world-more');
if (more) {
  world.classList.add('has-more');
  more.addEventListener('click', () => {
    world.classList.add('is-expanded');
    more.setAttribute('aria-expanded', 'true');
    const firstExtra = world.querySelector('.kai-world-media:not(.kai-world-featured) button');
    firstExtra?.focus({ preventScroll: true });
  });
}
