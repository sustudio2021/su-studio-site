# KAI'S WORLD media

All media derives from the ten supplied files in `/Users/koweiwu/Desktop/KAi/網站/AI _ 網頁/`. Original files remain unchanged there. `manifest.json` records original paths, SHA-256 digests, dimensions (photos), and file sizes. No placeholder or generated imagery is used.

Photos retain their full aspect ratios: two 1122 × 1402 café images and two 1086 × 1448 street/kitchen images. Each has 480px, 800px and source-width AVIF/WebP variants. All use lazy loading, low priority and explicit dimensions.

Video mapping:

| Web stem | Original | Duration | Source |
| --- | --- | --- | --- |
| kai-world-video-01 | Create-the-opening-shot-of-a-snack-shopp.mp4 | 5.04s | H.264 720×1280, 24fps |
| kai-world-video-02 | Kai_ Eating.mp4 | 6.54s | H.264 720×1280, 24fps |
| kai-world-video-03 | hf_20260911_095353_5d1e394f-a6a3-400e-b7ef-4212b7428fc0.mp4 | 4.04s | HEVC Main 10 1080×1920, 24fps |
| kai-world-video-04 | tomato 4.mp4 | 4.04s | H.264 720×1280, 24fps |
| kai-world-video-05 | tomato1_1.mp4 | 6.92s | H.264 720×1280, 24fps |
| kai-world-video-06 | tomato３.mp4 | 4.04s | H.264 720×1280, 24fps |

Web encodes use H.264 CRF 20, medium preset, yuv420p, faststart, original frame rate; desktop 720×1280, mobile 450×800. Audio is omitted from muted web derivatives only. No footage is cropped or trimmed. Posters are actual first frames. Any text visible within the footage is part of the supplied source, not site controls.

Original video total: 15,201,684 bytes. Desktop total: 7,408,611 bytes. Mobile total: 3,543,372 bytes. These are library totals, not initial-page transfer: videos have preload=none and no src until playback is requested.

Desktop: muted hover playback, loop, pause on exit. Touch: IntersectionObserver chooses one primarily visible video at >=65% visibility; others pause. Reduced motion disables automatic video playback, hover transforms and pointer depth. Videos remain operable with an explicit click/tap/keyboard activation. Failed autoplay preserves the poster.

Composition is fixed in HTML custom properties. World-only CSS is appended to kai-style.css; interactions live in scripts/kai-world.js. No framework or animation dependency.


## Featured-film update

The fixed composition now prioritizes Kai_ 穿搭1.mp4 (10.04s), Kai_照片機.mp4 (8.29s) and Kai_ Eating.mp4. The new sources are 1080×1920 H.264; web variants retain 9:16 at desktop 720×1280 and mobile 450×800. New desktop files total 1,897,456 bytes; mobile files total 819,797 bytes. Photos occupy smaller supporting placements. Primary mobile films are 82–84vw, capped to 78svh tall so the 65% visibility playback threshold remains reachable. Earlier totals above describe the original six-video batch; the manifest includes all eight videos.
