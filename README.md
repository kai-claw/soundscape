# SoundScape — Audio-Reactive 3D Visualizer

An immersive audio-reactive 3D visualizer built with React, Three.js, and the Web Audio API. Connect your microphone or upload an audio file to watch stunning visualizations respond in real-time.

🔗 **[Live Demo](https://kai-claw.github.io/soundscape/)**

## Features

- **5 Visualization Modes**
  - 🌊 **Waveform Ribbon** — Flowing 3D ribbon responding to audio waveform
  - 📊 **Frequency Bars** — 3D bar grid with heights driven by frequency amplitude
  - ✨ **Particle Field** — 3,000 particles reacting to audio energy
  - 🔮 **Kaleidoscope** — Mirrored geometry patterns with 8-fold symmetry
  - 🕳️ **Tunnel** — Fly-through tunnel that pulses with bass

- **Audio Input** — Microphone or audio file upload
- **BPM Detection** — Automatic tempo detection via onset analysis
- **4 Color Themes** — Neon, Sunset, Ocean, Monochrome
- **Smooth Transitions** — Crossfade between visualization modes
- **Keyboard Shortcuts** — 1-5 (modes), T (theme), Space (pause)
- **Responsive** — Works on desktop and mobile

## Tech Stack

- React + TypeScript
- Three.js (react-three-fiber + drei)
- Web Audio API (AnalyserNode, frequency + time domain data)
- Zustand (state management)
- Vite (build tool)
- Custom GLSL shaders

## Getting Started

```bash
npm install
npm run dev
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| 1-5 | Switch visualization mode |
| T | Cycle color theme |
| Space | Pause/Resume |

## License

MIT
