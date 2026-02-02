# 🎵 SoundScape

### Audio-Reactive 3D Visualizer

Feed it sound — mic, file, or built-in synth — and watch it come alive across 7 visualization modes, 6 color themes, and 5 stackable experience layers.

**[▶ Live Demo](https://kai-claw.github.io/soundscape/)** · Built with React, Three.js & Web Audio API

![SoundScape](public/og-image.svg)

---

## ✨ Features

### 🎨 7 Visualization Modes

| Key | Mode | How it works |
|-----|------|--------------|
| 1 | 🌊 **Waveform Ribbon** | Custom GLSL vertex + fragment shader, 128-segment flowing ribbon |
| 2 | 📊 **Frequency Bars** | 16×16 InstancedMesh grid (256 bars), height & color mapped to FFT |
| 3 | ✨ **Particle Field** | 3,000 particles with custom shader, additive blending |
| 4 | 🔮 **Kaleidoscope** | 8-fold mirrored geometry, 6 shape types (48 meshes) |
| 5 | 🕳️ **Tunnel** | 30 wireframe torus rings, depth-scrolling, bass-reactive pulse |
| 6 | 🏔️ **Waterfall** | 3D scrolling spectrogram terrain — sound history as landscape |
| 7 | 🔥 **Flame** | Procedural GLSL aurora fire with simplex noise + FBM |

### 🎨 6 Color Themes
💜 Neon · 🌅 Sunset · 🌊 Ocean · ⚪ Monochrome · ❄️ Arctic · 🌲 Forest

### 🔊 Audio Engine
- **Web Audio API** — 2048-point FFT, 8-band spectral analysis with asymmetric attack/release
- **3 audio sources** — Microphone (real-time), file upload (MP3/WAV/FLAC/OGG), built-in demo synth
- **Demo synthesizer** — layered ambient synth: bass drone, detuned mid pad, shimmer harmonics, rhythmic kick/hi-hat at 110 BPM
- **BPM detection** — onset analysis with dynamic thresholding
- **Auto-gain normalization** — quiet tracks feel as punchy as loud ones
- **Idle breathing** — when silence is detected, visualizers gently drift with organic multi-wave pseudo-audio

### ✦ Experience Layers (stackable)
| Layer | Description |
|-------|-------------|
| 🎬 **Cinematic** | Auto-cycles through all 7 modes with smooth transitions |
| ✦ **Starfield** | 800 audio-reactive stars — bass drift + high-freq twinkle |
| ◎ **Orbit Ring** | Circular frequency mandala, dual-ring with spectrum color mapping |
| 💓 **Beat Pulse** | FOV camera pump synced to bass hits (impulse-decay model) |
| 💥 **Shockwave** | Expanding torus rings triggered by strong bass onsets |

### 🎛️ 8 Curated Presets
One-click combos showcasing the best feature combinations:

🧘 Zen · 🎉 Rave · 🌌 Ambient · 🔥 Inferno · 🎬 Cinema · ◻️ Minimal · ❄️ Frozen · 🌿 Jungle

### 🖥️ GPU Performance Tiers
Auto-detected via `WEBGL_debug_renderer_info` + heuristics. Three tiers (High / Medium / Low) scale particle counts, starfield density, post-processing effects, and DPR. Manual override available.

### 📹 Sharing & Recording
- **Video recording** — capture WebGL canvas + audio as WebM (VP9/VP8)
- **URL state encoding** — share your exact configuration via URL hash
- **Screenshot capture** — download PNG snapshots
- **Native share dialog** on mobile, clipboard fallback on desktop

### ♿ Accessibility
- Full ARIA attributes on all controls
- Skip links for keyboard navigation
- `prefers-reduced-motion` support
- Screen reader announcements for mode/theme changes
- Focus management with visible outlines

### 🎭 Emotional Quality
- **Mood text** — evocative phrases bloom during transitions ("dissolve into light", "the bass pulls you forward")
- **Entrance overlay** — cinematic threshold moment when audio first connects
- **Audio-reactive UI** — control panel breathes with the music (bass glow, scale pulse, shimmer)
- **Atmospheric landing** — typewriter tagline, floating dust particles, pulsing icon glow

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`–`7` | Switch visualization mode |
| `←` `→` | Cycle modes |
| `T` | Cycle theme |
| `Space` | Play / Pause |
| `C` | Toggle cinematic autoplay |
| `S` | Toggle starfield |
| `O` | Toggle orbit ring |
| `B` | Toggle beat pulse |
| `W` | Toggle shockwave |
| `P` | Collapse / expand panel |
| `G` | Toggle auto-gain |
| `D` | Toggle demo audio |
| `R` | Start / stop recording |
| `A` | Toggle BPM-adaptive cinematic |
| `F` | Toggle fullscreen |
| `Shift+F` | Toggle FPS counter |
| `H` | Show help overlay |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19 · TypeScript |
| 3D | Three.js · React Three Fiber · drei |
| Audio | Web Audio API (AnalyserNode, MediaStream, MediaElement) |
| Shaders | Custom GLSL (vertex + fragment) for Waveform, Particles, Flame, Starfield, Waterfall |
| State | Zustand |
| Build | Vite |
| Test | Vitest — **565 tests** across 12 suites |
| Deploy | GitHub Pages (gh-pages) |

---

## 📊 Build Stats

| Metric | Value |
|--------|-------|
| Source Files | 45 source + 13 test/setup |
| Source LOC | ~6,000 (source) + ~3,400 (tests) + ~1,900 (CSS) |
| TypeScript Errors | 0 |
| Tests | **565** across 12 suites |
| Bundle (JS gzip) | 29KB app + 152KB R3F + 187KB Three.js ≈ **376KB** |
| CSS (gzip) | 6KB |

---

## 🚀 Getting Started

```bash
npm install          # Install dependencies
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
npm test             # Run all 565 tests
npx tsc --noEmit     # Type check
```

---

## 📁 Project Structure

```
src/
├── audio/           # AudioEngine, BPM detection, smooth processing, auto-gain,
│                    #   idle breathing, demo synthesizer
├── components/      # UI: control panel, landing screen, transport, overlays,
│                    #   mood text, entrance overlay, audio-reactive UI
├── visualizers/     # 7 Three.js visualization modes + scene orchestrator +
│                    #   starfield, orbit ring, shockwave, post-processing
├── themes/          # 6 color theme definitions
├── store/           # Zustand state management + experience presets
├── utils/           # URL state encoding, GPU detection
├── __tests__/       # 10 pass-based test suites (Six Thinking Hats methodology)
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

---

## 🎩 Development Process

SoundScape was built in **10 structured passes** using the [Six Thinking Hats](https://en.wikipedia.org/wiki/Six_Thinking_Hats) methodology — each pass applying a single analytical lens:

| Pass | Hat | Focus | Key Outcome |
|------|-----|-------|-------------|
| 1 | ⚪ White | Facts & Data | Baseline audit, 150 tests, CI/CD, PWA manifest |
| 2 | ⚫ Black | Risks & Caution | ErrorBoundary, ARIA, touch support, WebGL recovery |
| 3 | 🟢 Green | Creative Ideas | Cinematic mode, starfield, beat pulse, orbit ring |
| 4 | 🟡 Yellow | Value & Strengths | Waterfall + Flame modes, presets, URL sharing |
| 5 | 🔴 Red | Intuition & Feeling | Mood text, entrance overlay, emotional UI |
| 6 | 🔵 Blue | Process & Summary | Architecture review, roadmap, structural tests |
| 7 | 🟢 Green #2 | Creative Features | Idle breathing, demo synth, GPU tiers, video recording |
| 8 | ⚫ Black #2 | Re-Audit | Fixed audio leak bug, +91 regression tests |
| 9 | 🔴 Red #2 | Final Polish | Buttery transitions, micro-interactions, premium feel |
| 10 | ⚪ White #2 | Final Verification | This README, final audit, clean deploy |

Each pass added its own test suite, building a comprehensive specification that validates both behavior and structure. Full details in [AUDIT.md](./AUDIT.md).

---

## 📝 License

MIT
