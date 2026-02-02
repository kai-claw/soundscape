# 🎵 SoundScape — Audio-Reactive 3D Visualizer

An immersive, real-time 3D audio visualizer built with React, Three.js, and the Web Audio API. Connect your microphone or upload any audio file to watch sound come alive.

**[▶ Live Demo](https://kai-claw.github.io/soundscape/)**

![SoundScape](https://img.shields.io/badge/React_19-Three.js-ff00ff?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-00ffff?style=flat-square)

## Features

### 🎨 Five Visualization Modes
- **🌊 Waveform Ribbon** — Custom GLSL shader ribbon that dances with the audio waveform
- **📊 Frequency Bars** — 16×16 instanced 3D bar grid mapped to frequency spectrum
- **✨ Particle Field** — 3,000 additive-blended particles with custom shader, responsive to all frequency bands
- **🔮 Kaleidoscope** — 8-fold mirrored 3D geometry (octahedra, tetrahedra, icosahedra, torus, cones, dodecahedra)
- **🕳️ Tunnel** — 30 depth-scrolling torus rings with bass-reactive pulse

### 🎵 Audio Engine
- **Microphone input** — Real-time visualization of live audio
- **File upload** — MP3, WAV, OGG, FLAC with full transport controls (seek, time display)
- **FFT analysis** — 2048-sample FFT with frequency, time-domain, and band separation (bass/mid/high)
- **BPM detection** — Onset-based beat detection with dynamic thresholding

### ✨ Visual Effects
- **Bloom** — Dynamic post-processing bloom that pulses with bass energy
- **Chromatic aberration** — Bass-reactive color fringing
- **Vignette** — Cinematic edge darkening
- **Beat flash** — Full-screen radial pulse on detected beats
- **Smooth transitions** — Crossfade between visualization modes

### 🎨 Color Themes
- **💜 Neon** — Magenta / Cyan / Yellow
- **🌅 Sunset** — Orange / Red / Gold
- **🌊 Ocean** — Blue / Teal / Sky
- **⚪ Monochrome** — Grayscale elegance

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1-5` | Switch visualization mode |
| `T` | Cycle color themes |
| `Space` | Pause / Resume |

## Tech Stack

- **React 19** + TypeScript
- **Three.js** via `@react-three/fiber` + `@react-three/drei`
- **Post-processing** via `@react-three/postprocessing` (Bloom, ChromaticAberration, Vignette)
- **Custom GLSL shaders** (waveform ribbon, particle field)
- **Web Audio API** (AnalyserNode, FFT, MediaStream, MediaElement)
- **Zustand** for state management
- **Vite** for build tooling

## Architecture

```
src/
├── audio/
│   ├── AudioEngine.ts      # Web Audio API wrapper (mic/file, FFT, bands)
│   └── BPMDetector.ts       # Onset-based BPM detection
├── components/
│   ├── LandingScreen.tsx     # Entry screen with audio source selection
│   ├── ControlPanel.tsx      # Mode/theme/sensitivity controls
│   ├── AudioTransport.tsx    # File playback seek bar
│   ├── BeatFlash.tsx         # Bass-reactive screen flash
│   ├── FullscreenBtn.tsx     # Fullscreen toggle
│   └── KeyboardHandler.tsx   # Keyboard shortcuts
├── visualizers/
│   ├── VisualizerScene.tsx   # Scene orchestrator + audio update loop
│   ├── WaveformRibbon.tsx    # GLSL waveform ribbon
│   ├── FrequencyBars.tsx     # Instanced 3D frequency bars
│   ├── ParticleField.tsx     # 3K particle shader system
│   ├── Kaleidoscope.tsx      # Mirrored geometry kaleidoscope
│   ├── Tunnel.tsx            # Depth-scrolling ring tunnel
│   └── PostProcessing.tsx    # Bloom + chromatic aberration + vignette
├── themes/
│   └── colorThemes.ts        # 4 color palettes with RGB arrays
├── store/
│   └── useStore.ts           # Zustand state (mode, theme, audio levels, BPM)
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── styles.css                 # Full responsive CSS
```

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production build
```

## License

MIT
