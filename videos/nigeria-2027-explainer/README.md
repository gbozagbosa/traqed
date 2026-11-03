# Nigeria 2027 General Elections — explainer video

- `nigeria_2027_elections_explainer.mp4`: 2:45, 1920×1080, voiceover and burned-in captions
- `nigeria_2027_elections_explainer.srt`: caption file for platforms that take separate captions
- `storyboard.png`: frames from nine scenes

Facts are current as of 3 November 2026. Sources: INEC election calendar and homepage figures (inecnigeria.org); INEC final presidential candidate list, 12 September 2026 (via Channels TV); 1999 Constitution s.134 (the 25% rule).

## Rebuild
1. Narration: `script.json` → offline Kokoro TTS (voice `bm_george`) → `voice.wav` + `timeline.json`
2. Visuals: `video.html` exposes `render(t)`, which draws the frame for time t
3. `node render.cjs full` captures 25 fps frames with Playwright and encodes them with ffmpeg
