# 🎵 SoundScape — Audio-Reactive 3D Visualizer

A real-time audio-reactive 3D visualizer built with React, Three.js, and the Web Audio API. Feed it your microphone or an audio file and watch sound come alive in 7 distinct visualization modes with 6 color themes.

**[🔗 Live Demo](https://kai-claw.github.io/soundscape/)**

![SoundScape](public/og-image.svg)

## ✨ Features

### 7 Visualization Modes

| # | Mode | Description |
|---|------|-------------|
| 1 | 🌊 **Waveform Ribbon** | Custom GLSL vertex+fragment shader, 128-segment flowing ribbon |
| 2 | 📊 **Frequency Bars** | 16×16 InstancedMesh grid (256 bars), height + color mapped to FFT |
| 3 | ✨ **Particle Field** | 3,000 particles with custom shader, additive blending |
| 4 | 🔮 **Kaleidoscope** | 8-fold mirrored geometry, 6 shape types (48 meshes) |
| 5 | 🕳️ **Tunnel** | 30 wireframe torus rings, depth-scrolling, bass-reactive pulse |
| 6 | 🏔️ **Waterfall** | 3D scrolling spectrogram terrain — sound history as landscape |
| 7 | 🔥 **Flame** | Procedural GLSL aurora fire with simplex noise + FBM |

### 6 Color Themes
- 💜 **Neon** — Magenta / Cyan / Yellow
- 🌅 **Sunset** — Orange / Red / Gold
- 🌊 **Ocean** — Blue / Teal / Sky
- ⚪ **Monochrome** — Clean black & white
- ❄️ **Arctic** — Icy blues / whites / frost
- 🌲 **Forest** — Deep emerald / lime / earth

### Audio Engine
- **Web Audio API** with 2048-point FFT analysis
- **3 audio sources**: Microphone (real-time), file upload (MP3/WAV/FLAC/OGG), or built-in demo synth
- **Demo audio synthesizer** — layered ambient synth: bass drone, detuned mid pad, shimmer harmonics, rhythmic kick/hi-hat at 110 BPM
- **Idle breathing** — when no signal detected, visualizers gently drift with organic multi-wave pseudo-audio
- **BPM detection** via onset analysis with dynamic thresholding
- **Auto-gain normalization** — quiet tracks feel as punchy as loud ones
- **Smooth audio processing** — 8-band spectral analysis with asymmetric attack/release
- **Band separation** — bass, mid, high frequency isolation

### Experience Layers (stackable effects)
- 🎬 **Cinematic** — Auto-cycles through all 7 modes with smooth transitions
- ✦ **Starfield** — 800 audio-reactive stars with bass drift + high-freq twinkle
- ◎ **Orbit Ring** — Circular frequency mandala, dual-ring with spectrum color mapping
- 💓 **Beat Pulse** — FOV camera pump synced to bass hits (impulse-decay model)
- 💥 **Shockwave** — Expanding torus rings triggered by strong bass onsets

### 8 Curated Presets
One-click combos that showcase the best feature combinations:
- 🧘 **Zen** — Calm ocean waves + gentle starfield
- 🎉 **Rave** — Full neon chaos, everything cranked up
- 🌌 **Ambient** — Dreamy particles + orbit ring
- 🔥 **Inferno** — Blazing flame + beat shockwaves
- 🎬 **Cinema** — Auto-cycling modes + full effects
- ◻️ **Minimal** — Clean monochrome frequency bars
- ❄️ **Frozen** — Icy particles + arctic starfield
- 🌿 **Jungle** — Deep forest tunnel + beat pulse

### GPU Performance Tiers
- **Auto-detection** via WEBGL_debug_renderer_info + heuristics
- **3 tiers**: High (full effects), Medium (reduced particles), Low (minimal rendering)
- **Manual override** in control panel
- Scales: particle counts, starfield, post-processing, DPR, orbit ring resolution

### Sharing, Screenshots & Recording
- **Video recording** — capture WebGL canvas + audio as WebM (VP9/VP8)
- **URL state encoding** — share your exact configuration via URL hash
- **Native share dialog** on mobile, clipboard fallback on desktop
- **Screenshot capture** — download PNG snapshots of the visualization
- **URL auto-sync** — URL updates as you change settings

### Accessibility
- Full **ARIA** attributes on all controls
- **Skip links** for keyboard navigation
- **Reduced motion** support (`prefers-reduced-motion`)
- **Screen reader** announcements for mode/theme changes
- **Focus management** with visible outlines
- **Tab order** for all interactive elements

### UI / UX
- **Collapsible control panel** (P key) for immersive viewing
- **Mini spectrum analyzer** in control panel
- **FPS counter** toggle
- **Help overlay** (H key) with all keyboard shortcuts
- **Touch support** with swipe gesture handling
- **WebGL context loss** recovery with user notification
- **File error handling** with auto-dismissing notifications
- **Audio context resume** on tab visibility change

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1-7 | Switch visualization mode |
| ← → | Cycle modes |
| T | Cycle theme |
| Space | Play / Pause |
| C | Toggle cinematic autoplay |
| S | Toggle starfield |
| O | Toggle orbit ring |
| B | Toggle beat pulse |
| W | Toggle shockwave |
| P | Collapse / expand panel |
| G | Toggle auto-gain |
| D | Toggle demo audio |
| R | Start / stop recording |
| A | Toggle BPM-adaptive cinematic |
| F | Toggle fullscreen |
| Shift+F | Toggle FPS counter |
| H | Show help overlay |

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Three.js** / **React Three Fiber** / **drei**
- **Web Audio API** (AnalyserNode, MediaStream, MediaElement)
- **Custom GLSL shaders** (vertex + fragment for Waveform, Particles, Flame, Starfield, Waterfall)
- **Zustand** state management
- **Vite** build tooling
- **Vitest** testing (474 tests across 11 suites)

### Emotional Quality (Pass 5)
- 🎭 **Mood Text** — evocative phrases bloom during mode transitions ("dissolve into light", "the bass pulls you forward")
- 🎬 **Entrance Overlay** — cinematic threshold moment when audio first connects
- 💫 **Audio-Reactive UI** — control panel breathes with the music (bass glow, scale pulse, shimmer)
- ✨ **Atmospheric Landing** — typewriter tagline, floating dust particles, pulsing icon glow

## 📊 Build Stats

| Metric | Value |
|--------|-------|
| Total Files | 56 (45 source + 11 test/setup) |
| Total LOC | ~11,000 (5,952 source + 3,312 test + 1,738 CSS) |
| TypeScript Errors | 0 |
| Test Count | 474 (11 test suites, 7 hat passes + 4 unit) |
| Bundle (JS) | 89KB app + 494KB R3F + 719KB Three.js |
| Gzip (JS) | 28KB + 152KB + 187KB = ~372KB |
| CSS | 23.9KB (5.4KB gzip) |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit
```

## 📁 Project Structure

```
src/
├── audio/           # Audio engine, BPM detection, smooth processing, auto-gain
├── components/      # UI: control panel, landing screen, transport, overlays
├── visualizers/     # 7 Three.js visualization modes + scene orchestrator
├── themes/          # 6 color theme definitions
├── store/           # Zustand state management + experience presets
├── utils/           # URL state encoding, GPU detection
├── __tests__/       # Pass-based test suites (7 hat passes + 4 unit)
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## 📝 License

MIT
