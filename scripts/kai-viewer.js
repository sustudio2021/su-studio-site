// Add angles here; each image shares one canvas and the same sole baseline.
// Replace the mirrored side when a true opposite-side image is available.
const angles = [
  { degrees: 0, asset: 'front', label: 'Front view' },
  { degrees: 90, asset: 'side', label: 'Side view' },
  { degrees: 180, asset: 'back', label: 'Back view' },
  { degrees: 270, asset: 'side', mirror: true, label: 'Opposite side, mirrored preview' },
];
const viewer = document.querySelector('[data-kai-viewer]');
const frames = [...viewer.querySelectorAll('[data-frame]')];
// Match contact shadows to the actual contained image, including its transparent margins.
function sizeCharacterCanvas() {
  const width = Math.min(viewer.clientWidth, viewer.clientHeight * 2 / 3);
  viewer.style.setProperty('--character-width', `${width}px`);
  viewer.style.setProperty('--character-height', `${width * 1.5}px`);
}
sizeCharacterCanvas();
new ResizeObserver(sizeCharacterCanvas).observe(viewer);
frames[0].dataset.view = 'front';
const status = document.querySelector('.kai-status');
const base = new URL('../kai-assets/', import.meta.url);
const cache = new Map();
let activeFrame = 0;
let current = 0;
let target = 0;
let revision = 0;
let pointer = null;
let resetTimer;
const mod = (n) => ((n % angles.length) + angles.length) % angles.length;

function pictureFor(angle) {
  const picture = document.createElement('picture');
  for (const format of ['avif', 'webp']) {
    const source = document.createElement('source');
    source.type = `image/${format}`;
    source.srcset = new URL(`${angle.asset}.${format}`, base).href;
    picture.append(source);
  }
  const img = new Image(1024, 1536);
  img.alt = `KAI — ${angle.label}`;
  img.draggable = false;
  img.src = new URL(`${angle.asset}.png`, base).href;
  picture.append(img);
  return picture;
}
function prepare(angle) {
  if (!cache.has(angle.asset)) {
    const picture = pictureFor(angle);
    const image = picture.querySelector('img');
    const ready = image.decode().then(() => picture).catch((error) => {
      cache.delete(angle.asset);
      throw error;
    });
    cache.set(angle.asset, ready);
  }
  return cache.get(angle.asset);
}
async function show(index) {
  target = mod(index);
  const request = ++revision;
  if (target === current) return;
  const next = target;
  try {
    const ready = await prepare(angles[next]);
    if (request !== revision) return;
    const incoming = frames[1 - activeFrame];
    incoming.dataset.view = angles[next].asset;
    incoming.replaceChildren(...[...ready.childNodes].map((node) => node.cloneNode(true)));
    incoming.querySelector('img').alt = `KAI — ${angles[next].label}`;
    incoming.style.transform = angles[next].mirror ? 'scaleX(-1)' : '';
    // Decode the actual displayed node before beginning the crossfade.
    await incoming.querySelector('img').decode();
    if (request !== revision) return;
    frames[activeFrame].classList.remove('is-visible');
    frames[activeFrame].setAttribute('aria-hidden', 'true');
    incoming.classList.add('is-visible');
    incoming.removeAttribute('aria-hidden');
    activeFrame = 1 - activeFrame;
    current = next;
    status.textContent = angles[next].label;
  } catch {
    if (request === revision) {
      target = current;
      status.textContent = 'This angle is unavailable. Please try again.';
    }
  }
}
function returnToFront(delay = 180) {
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => show(0), delay);
}
viewer.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  clearTimeout(resetTimer);
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: target, horizontal: false };
});
viewer.addEventListener('pointermove', (event) => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (!pointer.horizontal) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { pointer = null; return; }
    if (Math.abs(dx) < 10) return;
    pointer.horizontal = true;
    viewer.setPointerCapture(event.pointerId);
    viewer.classList.add('is-dragging');
  }
  const step = Math.max(32, viewer.clientWidth / 5);
  const index = mod(pointer.start + Math.trunc(dx / step));
  if (index !== target) show(index);
});
function finish(event) {
  if (!pointer || pointer.id !== event.pointerId) return;
  if (viewer.hasPointerCapture(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
  pointer = null;
  viewer.classList.remove('is-dragging');
  returnToFront();
}
window.addEventListener('pointerup', finish);
viewer.addEventListener('pointercancel', finish);
viewer.addEventListener('lostpointercapture', finish);
viewer.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Escape', 'Home'].includes(event.key)) return;
  event.preventDefault();
  clearTimeout(resetTimer);
  show(event.key === 'ArrowLeft' ? target - 1 : event.key === 'ArrowRight' ? target + 1 : 0);
  returnToFront(1600);
});
document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    clearTimeout(resetTimer);
    show(target + Number(button.dataset.direction));
    returnToFront(1600);
  });
});
document.querySelector('[data-controls]').hidden = false;
// Only the front is critical. Warm the remaining three-image set after it loads.
const warm = () => {
  for (const angle of angles) prepare(angle).catch(() => {});
};
const frontImage = frames[0].querySelector('img');
frontImage.decode().then(() => {
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2000 });
  else setTimeout(warm, 300);
}).catch(() => {});
const back = document.querySelector('[data-back-to-work]');
back.addEventListener('click', (event) => {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === location.origin && /^\/work(?:\.html)?\/?$/.test(referrer.pathname)) {
      event.preventDefault();
      history.back();
    }
  } catch { /* Direct visits retain the normal Work link. */ }
});

// Match the Character Study drag cue without intercepting pointer events.
const heroCursor = document.createElement('span');
heroCursor.className = 'kai-hero-cursor';
heroCursor.textContent = '← DRAG →';
heroCursor.setAttribute('aria-hidden', 'true');
document.body.append(heroCursor);
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
function hideHeroCursor() {
  heroCursor.classList.remove('is-visible');
  viewer.classList.remove('has-drag-cursor');
}
viewer.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || !finePointer.matches) return;
  const bounds = viewer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    hideHeroCursor();
    return;
  }
  heroCursor.style.transform = `translate(${event.clientX + 16}px, ${event.clientY + 18}px)`;
  heroCursor.classList.add('is-visible');
  viewer.classList.add('has-drag-cursor');
});
viewer.addEventListener('pointerleave', hideHeroCursor);
viewer.addEventListener('pointercancel', hideHeroCursor);
window.addEventListener('blur', hideHeroCursor);
window.addEventListener('scroll', hideHeroCursor, { passive: true });
finePointer.addEventListener('change', hideHeroCursor);
