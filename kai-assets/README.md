# KAI viewer assets

Three transparent cutouts derived from user-provided front, left-facing side and back PNGs in `Desktop/KAi/人物設定`. Originals are unchanged. PNG fallbacks and AVIF/WebP encodings have identical 1024 × 1536 canvases. No 3D model is used.

Generated with the built-in imagegen tool, then encoded to WebP (quality 88) and AVIF (quality 80). Generated editing may introduce small texture differences from the source photographs. The opposite-side view is a CSS mirror, including watch/earring placement, until a dedicated right-facing asset is supplied.

## Prompt set

Shared instruction: “Use case: background-extraction. Edit target: supplied KAI full-body photograph. Remove ONLY studio background, floor and ground shadow; output actual transparent alpha background. Preserve exact identity, hair strands, pose, clothes, watch, shoes, body proportions and original lighting. Full body uncropped shoes, original 1024x1536 framing. No new objects or typography or painted checkerboard. Precise cutout website asset.”

- Front: preserve the exact face and front view.
- Side: preserve the left-facing side view.
- Back: preserve the rear view.

## Adding angles

Add matching PNG/WebP/AVIF files here, then extend the ordered `angles` array in `scripts/kai-viewer.js`. Place all angles in one rotation direction. Match character scale and sole baseline to the front asset; provide unique labels. Replace the 270° mirrored side entry with a dedicated asset when available.

The front is the initial, no-JavaScript and resting view. Non-front assets are warmed only after the front is decoded. Pointer release returns to front after 180ms; keyboard/buttons allow 1600ms for inspection. Reduced-motion disables the crossfade.
