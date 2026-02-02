# SoundScape — White Hat Audit (Pass 1)

**Date:** 2026-02-02  
**Auditor:** Kai (worker session 3ab89e22)

## Baseline Metrics

| Metric | Value |
|--------|-------|
| Source Files | 25 (14 source + 4 test + 1 CSS + setup) |
| Source LOC | 2,814 |
| TypeScript Errors | 0 |
| ESLint Errors | 29 (all react-hooks/immutability in WaveformRibbon.tsx — false positives from useMemo shader uniform updates) |
| Unit Tests | 150 (5 test files) |
| Build Status | ✅ Clean |
| Bundle Size | 1,245KB total (JS: 23.8KB app + 493.6KB R3F vendor + 719.2KB Three.js vendor) |
| Gzip Size | ~347KB total (8.3KB app + 152.3KB R3F + 187.0KB Three.js) |
| CSS | 8.07KB (2.20KB gzip) |

## Architecture

```
src/ (2,814 LOC)
├── audio/
│   ├── AudioEngine.ts         (124 LOC) — Web Audio API: mic/file, FFT, bands
│   ├── AudioEngine.test.ts    (144 LOC) — 20 tests
│   ├── BPMDetector.ts          (76 LOC) — Onset-based BPM via bass energy peaks
│   └── BPMDetector.test.ts    (139 LOC) — 11 tests
├── components/
│   ├── AudioTransport.tsx      (81 LOC) — File playback seek bar + time display
│   ├── BeatFlash.tsx           (42 LOC) — Bass-reactive screen flash overlay
│   ├── ControlPanel.tsx       (171 LOC) — Mode/theme/sensitivity/source controls
│   ├── FullscreenBtn.tsx       (25 LOC) — Fullscreen toggle button
│   ├── KeyboardHandler.tsx     (38 LOC) — Keyboard shortcuts (1-5, T, Space)
│   └── LandingScreen.tsx      (110 LOC) — Entry screen with mic/file selection
├── visualizers/
│   ├── VisualizerScene.tsx    (101 LOC) — Scene orchestrator + audio→store loop
│   ├── WaveformRibbon.tsx      (86 LOC) — Custom GLSL shader ribbon
│   ├── FrequencyBars.tsx       (80 LOC) — 16×16 instanced 3D bars
│   ├── ParticleField.tsx      (125 LOC) — 3K additive-blended particle shader
│   ├── Kaleidoscope.tsx        (83 LOC) — 8-fold mirrored geometry
│   ├── Tunnel.tsx              (71 LOC) — 30 depth-scrolling torus rings
│   └── PostProcessing.tsx      (34 LOC) — Bloom + chromatic aberration + vignette
├── themes/
│   ├── colorThemes.ts          (82 LOC) — 4 palettes with RGB arrays
│   └── colorThemes.test.ts   (132 LOC) — 27 tests
├── store/
│   ├── useStore.ts             (74 LOC) — Zustand: mode, theme, audio levels, BPM
│   └── useStore.test.ts       (212 LOC) — 27 tests
├── __tests__/
│   └── whitehat.test.ts       (326 LOC) — 65 audit tests
├── test/
│   └── setup.ts               (131 LOC) — Mock WebGL/AudioContext/mediaDevices
├── App.tsx                     (47 LOC) — Root component with landing gate
├── main.tsx                    (10 LOC) — Entry point
└── styles.css                 (596 LOC) — Full responsive CSS
```

## Features Inventory

### Visualization Modes (5)
1. **Waveform Ribbon** — Custom vertex+fragment GLSL shader, 128 segments, 8-unit width
2. **Frequency Bars** — 16×16 InstancedMesh grid (256 bars), height+color mapped to FFT
3. **Particle Field** — 3,000 particles, custom vertex+fragment shader, additive blending
4. **Kaleidoscope** — 8 mirrors × 6 shapes (48 meshes), 6 geometry types
5. **Tunnel** — 30 wireframe torus rings, depth-scrolling, bass-reactive pulse

### Audio Engine
- Web Audio API with AnalyserNode (2048 FFT)
- Microphone input (MediaStream)
- File upload (MediaElement) with loop + transport controls
- Frequency/time-domain data extraction
- Band separation (bass 0-10%, mid 10-50%, high 50-100%)
- Average level computation

### BPM Detection
- Onset detection via bass energy peaks
- Dynamic thresholding (max of 0.6, avg×1.4)
- 200ms cooldown between beats
- 20-beat history with outlier filtering (250ms-2000ms)
- Clamped to 30-240 BPM range

### Visual Effects
- Post-processing: Bloom (bass-reactive), Chromatic Aberration, Vignette
- Beat flash overlay (radial gradient on onset)
- Mode crossfade transitions (opacity blending)
- Environment preset (night)
- Fog
- Auto-rotate OrbitControls

### Color Themes (4)
- Neon (magenta/cyan/yellow), Sunset (orange/red/gold), Ocean (blue/teal/sky), Monochrome

### UI
- Landing screen with mic/file selection
- Control panel: mode, theme, sensitivity slider, play/pause, source toggle
- Audio transport: seek bar, time display (file mode only)
- Fullscreen button
- Keyboard shortcuts: 1-5, T, Space

## Known Issues

1. **ESLint 29 errors** — All in WaveformRibbon.tsx from react-hooks/immutability rule flagging shader uniform updates inside useFrame. These are intentional Three.js patterns (mutating `material.uniforms` in the render loop), not actual bugs. Could suppress with eslint-disable comments.

2. **No Error Boundary** — App has no React ErrorBoundary for WebGL crashes/context loss recovery.

3. **No ARIA accessibility** — Canvas, controls, buttons lack role/aria-label/aria-* attributes. No focus-visible outlines. No prefers-reduced-motion support.

4. **No keyboard accessibility** — Keyboard shortcuts exist but no focus management, no tab order, no screen reader support.

5. **No mobile responsiveness** — Control panel is fixed-position overlay but no responsive adjustments for small screens or touch targets.

6. **Per-frame allocations in FrequencyBars** — Creates `new THREE.InstancedBufferAttribute(colorArray, 3)` every frame in useFrame. Should reuse the attribute and just mark needsUpdate.

7. **PostProcessing creates new Vector2 every render** — `new Vector2(aberration, aberration)` in component body creates fresh object each render (though R3F may handle this).

8. **No touch support** — Landing screen buttons work but no touch gesture support for visualizer interaction.

9. **Window globals** — `window.devicePixelRatio` used directly in shader material (ParticleField). Would break in SSR but not relevant for this app.

10. **No help overlay** — Keyboard shortcuts only shown as tiny hints in control panel. No H-key help overlay.

11. **No PWA manifest** — Was missing, now added in this pass.

12. **No loading spinner** — Was bare div#root, now added in this pass.

## What This Pass Added

- 65 new unit tests (150 total, 5 test files)
- Enhanced HTML meta tags (OG image alt, Twitter image alt, apple-mobile-web-app, keywords)
- JSON-LD structured data enhancements (version, license, featureList, isAccessibleForFree)
- Custom SVG favicon (frequency bars in circle)
- OG image SVG
- PWA manifest.json
- Loading spinner with audio bar animation + auto-fadeout
- 404.html with SPA redirect
- Updated robots.txt and sitemap.xml
- CI/CD GitHub Actions workflow (typecheck + test + build + deploy)
- Deploy script in package.json
- This AUDIT.md

## Readiness

**Current State:** Functional MVP with solid audio engine and 5 distinct visualizations. Good visual quality. Needs accessibility, error handling, mobile support, and performance optimization in subsequent passes.
