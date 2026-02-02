import { create } from 'zustand';

export type VisualizationMode = 'waveform' | 'frequency' | 'particles' | 'kaleidoscope' | 'tunnel';
export type ColorTheme = 'neon' | 'sunset' | 'ocean' | 'monochrome';
export type AudioSource = 'mic' | 'file';

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
  setTransitionProgress: (val: number) => void;
  setFileName: (name: string | null) => void;
}

const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];

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
  setTransitionProgress: (transitionProgress) => set({ transitionProgress }),
  setFileName: (fileName) => set({ fileName }),
}));
