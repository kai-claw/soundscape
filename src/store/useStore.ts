import { create } from 'zustand';

export type VisualizationMode = 'waveform' | 'frequency' | 'particles' | 'kaleidoscope' | 'tunnel' | 'waterfall' | 'flame';
export type ColorTheme = 'neon' | 'sunset' | 'ocean' | 'monochrome' | 'arctic' | 'forest';
export type AudioSource = 'mic' | 'file';

/** Curated experience presets — one-click combos that showcase the best feature combinations */
export interface ExperiencePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  mode: VisualizationMode;
  theme: ColorTheme;
  cinematic: boolean;
  starfield: boolean;
  orbitRing: boolean;
  beatPulse: boolean;
  shockwave: boolean;
  sensitivity: number;
}

export const EXPERIENCE_PRESETS: ExperiencePreset[] = [
  {
    id: 'zen',
    name: 'Zen',
    icon: '🧘',
    description: 'Calm ocean waves with gentle starfield',
    mode: 'waveform',
    theme: 'ocean',
    cinematic: false,
    starfield: true,
    orbitRing: false,
    beatPulse: false,
    shockwave: false,
    sensitivity: 1.2,
  },
  {
    id: 'rave',
    name: 'Rave',
    icon: '🎉',
    description: 'Full neon chaos — everything cranked up',
    mode: 'kaleidoscope',
    theme: 'neon',
    cinematic: true,
    starfield: true,
    orbitRing: true,
    beatPulse: true,
    shockwave: true,
    sensitivity: 1.8,
  },
  {
    id: 'ambient',
    name: 'Ambient',
    icon: '🌌',
    description: 'Dreamy particles with orbit ring',
    mode: 'particles',
    theme: 'ocean',
    cinematic: false,
    starfield: true,
    orbitRing: true,
    beatPulse: false,
    shockwave: false,
    sensitivity: 1.4,
  },
  {
    id: 'inferno',
    name: 'Inferno',
    icon: '🔥',
    description: 'Blazing flame with beat shockwaves',
    mode: 'flame',
    theme: 'sunset',
    cinematic: false,
    starfield: false,
    orbitRing: false,
    beatPulse: true,
    shockwave: true,
    sensitivity: 1.6,
  },
  {
    id: 'cinema',
    name: 'Cinema',
    icon: '🎬',
    description: 'Auto-cycling modes with full effects',
    mode: 'tunnel',
    theme: 'neon',
    cinematic: true,
    starfield: true,
    orbitRing: false,
    beatPulse: true,
    shockwave: true,
    sensitivity: 1.0,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: '◻️',
    description: 'Clean monochrome frequency bars',
    mode: 'frequency',
    theme: 'monochrome',
    cinematic: false,
    starfield: false,
    orbitRing: false,
    beatPulse: false,
    shockwave: false,
    sensitivity: 1.0,
  },
  {
    id: 'frozen',
    name: 'Frozen',
    icon: '❄️',
    description: 'Icy particles with arctic starfield',
    mode: 'particles',
    theme: 'arctic',
    cinematic: false,
    starfield: true,
    orbitRing: true,
    beatPulse: false,
    shockwave: false,
    sensitivity: 1.3,
  },
  {
    id: 'jungle',
    name: 'Jungle',
    icon: '🌿',
    description: 'Deep forest tunnel with beat pulse',
    mode: 'tunnel',
    theme: 'forest',
    cinematic: false,
    starfield: true,
    orbitRing: false,
    beatPulse: true,
    shockwave: true,
    sensitivity: 1.5,
  },
];

interface AppState {
  mode: VisualizationMode;
  prevMode: VisualizationMode | null;
  transitionProgress: number;
  theme: ColorTheme;
  sensitivity: number;
  audioSource: AudioSource;
  isPlaying: boolean;
  bpm: number;
  audioLevel: number;
  bassLevel: number;
  midLevel: number;
  highLevel: number;
  fileName: string | null;
  /** True when audio source is connected but no signal is detected */
  noSignal: boolean;
  /** Cinematic autoplay — auto-cycles through visualization modes */
  cinematic: boolean;
  /** Audio-reactive starfield background layer */
  starfield: boolean;
  /** Audio orbit ring overlay — circular frequency mandala */
  orbitRing: boolean;
  /** Beat camera pulse — FOV pump on bass hits */
  beatPulse: boolean;
  /** Beat shockwave — expanding ring on bass hits */
  shockwave: boolean;
  /** Control panel collapsed for immersive viewing */
  panelCollapsed: boolean;
  /** Active preset id (null if manually configured) */
  activePreset: string | null;
  /** Show FPS counter overlay */
  showFps: boolean;
  /** Auto-gain normalization enabled */
  autoGain: boolean;

  setMode: (mode: VisualizationMode) => void;
  cycleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
  setSensitivity: (val: number) => void;
  setAudioSource: (src: AudioSource) => void;
  togglePlay: () => void;
  setBpm: (bpm: number) => void;
  setAudioLevel: (level: number) => void;
  setBassLevel: (level: number) => void;
  setMidLevel: (level: number) => void;
  setHighLevel: (level: number) => void;
  /** Batch audio update — single set() call per frame instead of 4 */
  setAudioLevels: (level: number, bass: number, mid: number, high: number) => void;
  setTransitionProgress: (val: number) => void;
  setFileName: (name: string | null) => void;
  setNoSignal: (noSignal: boolean) => void;
  toggleCinematic: () => void;
  toggleStarfield: () => void;
  toggleOrbitRing: () => void;
  toggleBeatPulse: () => void;
  toggleShockwave: () => void;
  togglePanelCollapsed: () => void;
  toggleShowFps: () => void;
  toggleAutoGain: () => void;
  /** Apply a curated experience preset */
  applyPreset: (preset: ExperiencePreset) => void;
}

const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest'];

export const useStore = create<AppState>((set, get) => ({
  mode: 'waveform',
  prevMode: null,
  transitionProgress: 1,
  theme: 'neon',
  sensitivity: 1.0,
  audioSource: 'mic',
  isPlaying: true,
  bpm: 0,
  audioLevel: 0,
  bassLevel: 0,
  midLevel: 0,
  highLevel: 0,
  fileName: null,
  noSignal: false,
  cinematic: false,
  starfield: true,
  orbitRing: false,
  beatPulse: true,
  shockwave: false,
  panelCollapsed: false,
  activePreset: null,
  showFps: false,
  autoGain: true,

  setMode: (mode) => {
    const current = get().mode;
    if (current === mode) return;
    set({ prevMode: current, mode, transitionProgress: 0 });
  },
  cycleTheme: () => {
    const idx = themes.indexOf(get().theme);
    set({ theme: themes[(idx + 1) % themes.length] });
  },
  setTheme: (theme) => set({ theme }),
  setSensitivity: (sensitivity) => set({ sensitivity }),
  setAudioSource: (audioSource) => set({ audioSource }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setBpm: (bpm) => set({ bpm }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setBassLevel: (bassLevel) => set({ bassLevel }),
  setMidLevel: (midLevel) => set({ midLevel }),
  setHighLevel: (highLevel) => set({ highLevel }),
  setAudioLevels: (audioLevel, bassLevel, midLevel, highLevel) =>
    set({ audioLevel, bassLevel, midLevel, highLevel }),
  setTransitionProgress: (transitionProgress) => set({ transitionProgress }),
  setFileName: (fileName) => set({ fileName }),
  setNoSignal: (noSignal) => set({ noSignal }),
  toggleCinematic: () => set((s) => ({ cinematic: !s.cinematic, activePreset: null })),
  toggleStarfield: () => set((s) => ({ starfield: !s.starfield, activePreset: null })),
  toggleOrbitRing: () => set((s) => ({ orbitRing: !s.orbitRing, activePreset: null })),
  toggleBeatPulse: () => set((s) => ({ beatPulse: !s.beatPulse, activePreset: null })),
  toggleShockwave: () => set((s) => ({ shockwave: !s.shockwave, activePreset: null })),
  togglePanelCollapsed: () => set((s) => ({ panelCollapsed: !s.panelCollapsed })),
  toggleShowFps: () => set((s) => ({ showFps: !s.showFps })),
  toggleAutoGain: () => set((s) => ({ autoGain: !s.autoGain })),
  applyPreset: (preset) => {
    const current = get().mode;
    set({
      mode: preset.mode,
      prevMode: current !== preset.mode ? current : null,
      transitionProgress: current !== preset.mode ? 0 : 1,
      theme: preset.theme,
      cinematic: preset.cinematic,
      starfield: preset.starfield,
      orbitRing: preset.orbitRing,
      beatPulse: preset.beatPulse,
      shockwave: preset.shockwave,
      sensitivity: preset.sensitivity,
      activePreset: preset.id,
    });
  },
}));
