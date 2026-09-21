// Native scrolling is the baseline, including touch inertia and no-JS browsing.
const gallery = document.querySelector('[data-study-gallery]');
const section = gallery.closest('.kai-study');
const cursor = section.querySelector('.kai-study-cursor');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let drag = null;
let frame = 0;
let velocity = 0;
let lastFrame = 0;
// Three identical sequences keep the viewport away from physical scroll edges.
// Copies reuse cached image URLs and are hidden from assistive technology.
const originals = [...gallery.children];
function copySequence() {
  return originals.map((original) => {
    const copy = original.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.dataset.loopCopy = '';
    return copy;
  });
}
gallery.prepend(...copySequence());
gallery.append(...copySequence());
let cycle = 0;
function measureCycle() {
  const next = originals[0].getBoundingClientRect().left - gallery.children[0].getBoundingClientRect().left;
  if (!next || Math.abs(next - cycle) < .5) return;
  const phase = cycle ? ((gallery.scrollLeft % cycle) + cycle) % cycle / cycle : 0;
  cycle = next;
  const position = cycle * (1 + phase);
  if (drag) drag.scroll += position - gallery.scrollLeft;
  gallery.scrollLeft = position;
}
function wrap() {
  if (!cycle) return;
  const before = gallery.scrollLeft;
  let next = before;
  while (next < cycle * .5) next += cycle;
  while (next >= cycle * 1.5) next -= cycle;
  if (next !== before) {
    gallery.scrollLeft = next;
    if (drag) drag.scroll += next - before;
  }
}
measureCycle();
new ResizeObserver(measureCycle).observe(gallery);
gallery.addEventListener('scroll', wrap, { passive: true });
const maxScroll = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);
const clamp = (value) => Math.max(0, Math.min(maxScroll(), value));
function stop() { cancelAnimationFrame(frame); frame = 0; velocity = 0; }
function coast(now) {
  const dt = Math.min(32, now - lastFrame);
  lastFrame = now;
  const before = gallery.scrollLeft;
  gallery.scrollLeft = clamp(before + velocity * dt);
  velocity *= Math.exp(-dt / 180);
  if (Math.abs(velocity) < .025 || Math.abs(gallery.scrollLeft - before) < .1) { stop(); return; }
  frame = requestAnimationFrame(coast);
}
function startCoast() {
  if (reducedMotion.matches || Math.abs(velocity) < .025) return;
  lastFrame = performance.now();
  frame = requestAnimationFrame(coast);
}
gallery.addEventListener('pointerdown', (event) => {
  stop();
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, origin: event.clientX, scroll: gallery.scrollLeft, time: performance.now(), moved: false };
});
gallery.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'mouse') {
    cursor.style.transform = `translate(${event.clientX + 16}px, ${event.clientY + 18}px)`;
    section.classList.add('has-drag-cursor');
  }
  if (!drag || event.pointerId !== drag.id) return;
  if (!drag.moved && Math.abs(event.clientX - drag.origin) < 4) return;
  if (!drag.moved) {
    drag.moved = true;
    gallery.setPointerCapture(event.pointerId);
    gallery.classList.add('is-dragging');
    gallery.focus({ preventScroll: true });
  }
  event.preventDefault();
  const now = performance.now();
  const dt = Math.max(8, now - drag.time);
  velocity = Math.max(-3, Math.min(3, (drag.x - event.clientX) / dt));
  gallery.scrollLeft = clamp(drag.scroll + drag.origin - event.clientX);
  drag.x = event.clientX;
  drag.time = now;
});
function release(event) {
  if (!drag || event.pointerId !== drag.id) return;
  const old = drag;
  drag = null;
  gallery.classList.remove('is-dragging');
  if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
  if (event.type === 'pointercancel' || performance.now() - old.time > 100) velocity = 0;
  if (old.moved) startCoast();
}
window.addEventListener('pointerup', release);
gallery.addEventListener('pointercancel', release);
gallery.addEventListener('lostpointercapture', release);
gallery.addEventListener('pointerleave', () => section.classList.remove('has-drag-cursor'));
window.addEventListener('blur', () => { stop(); drag = null; gallery.classList.remove('is-dragging'); section.classList.remove('has-drag-cursor'); });
// Leave horizontal trackpad scrolling native. Map a conventional vertical wheel
// into the continuous sequence. Touch vertical scrolling remains native.
gallery.addEventListener('wheel', (event) => {
  if (event.ctrlKey) return; // Preserve pinch-to-zoom.
  if (Math.abs(event.deltaX) > 0) { stop(); return; }
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientWidth : 1;
  const delta = event.deltaY * unit;
  if (!delta) return;
  const before = gallery.scrollLeft;
  if ((delta < 0 && before <= 1) || (delta > 0 && before >= maxScroll() - 1)) { stop(); return; }
  event.preventDefault();
  stop();
  gallery.scrollLeft = clamp(before + delta * .55);
  if (!reducedMotion.matches) {
    velocity = Math.max(-2.5, Math.min(2.5, delta / 110));
    startCoast();
  } else gallery.scrollLeft = clamp(before + delta);
}, { passive: false });
gallery.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  stop();
  const next = event.key === 'Home' ? cycle : event.key === 'End' ? cycle + (originals.at(-1).getBoundingClientRect().left - originals[0].getBoundingClientRect().left) : gallery.scrollLeft + (event.key === 'ArrowLeft' ? -1 : 1) * gallery.clientWidth * .45;
  gallery.scrollTo({ left: clamp(next), behavior: reducedMotion.matches || event.key === 'Home' || event.key === 'End' ? 'instant' : 'smooth' });
});
reducedMotion.addEventListener('change', stop);
