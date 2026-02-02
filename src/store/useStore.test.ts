import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
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
    });
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useStore.getState();
      expect(state.mode).toBe('waveform');
      expect(state.prevMode).toBeNull();
      expect(state.transitionProgress).toBe(1);
      expect(state.theme).toBe('neon');
      expect(state.sensitivity).toBe(1.0);
      expect(state.audioSource).toBe('mic');
      expect(state.isPlaying).toBe(true);
      expect(state.bpm).toBe(0);
      expect(state.audioLevel).toBe(0);
      expect(state.bassLevel).toBe(0);
      expect(state.midLevel).toBe(0);
      expect(state.highLevel).toBe(0);
      expect(state.fileName).toBeNull();
    });
  });

  describe('setMode', () => {
    it('changes mode and sets transition state', () => {
      useStore.getState().setMode('frequency');
      const state = useStore.getState();
      expect(state.mode).toBe('frequency');
      expect(state.prevMode).toBe('waveform');
      expect(state.transitionProgress).toBe(0);
    });

    it('ignores setting same mode', () => {
      useStore.getState().setMode('waveform');
      const state = useStore.getState();
      expect(state.prevMode).toBeNull(); // unchanged
      expect(state.transitionProgress).toBe(1); // unchanged
    });

    it('tracks mode history through multiple changes', () => {
      useStore.getState().setMode('frequency');
      useStore.getState().setMode('particles');
      const state = useStore.getState();
      expect(state.mode).toBe('particles');
      expect(state.prevMode).toBe('frequency');
    });

    it('handles all visualization modes', () => {
      const modes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel'] as const;
      for (const mode of modes) {
        useStore.getState().setMode(mode);
        expect(useStore.getState().mode).toBe(mode);
      }
    });
  });

  describe('theme management', () => {
    it('cycles through themes in order', () => {
      const expected = ['sunset', 'ocean', 'monochrome', 'arctic', 'forest', 'neon'];
      for (const theme of expected) {
        useStore.getState().cycleTheme();
        expect(useStore.getState().theme).toBe(theme);
      }
    });

    it('wraps around after last theme', () => {
      // Cycle through all 6 themes
      for (let i = 0; i < 6; i++) useStore.getState().cycleTheme();
      expect(useStore.getState().theme).toBe('neon');
    });

    it('setTheme directly sets theme', () => {
      useStore.getState().setTheme('ocean');
      expect(useStore.getState().theme).toBe('ocean');
    });

    it('handles all color themes', () => {
      const themes = ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest'] as const;
      for (const t of themes) {
        useStore.getState().setTheme(t);
        expect(useStore.getState().theme).toBe(t);
      }
    });
  });

  describe('sensitivity', () => {
    it('sets sensitivity value', () => {
      useStore.getState().setSensitivity(2.5);
      expect(useStore.getState().sensitivity).toBe(2.5);
    });

    it('accepts zero', () => {
      useStore.getState().setSensitivity(0);
      expect(useStore.getState().sensitivity).toBe(0);
    });

    it('accepts decimal values', () => {
      useStore.getState().setSensitivity(0.3);
      expect(useStore.getState().sensitivity).toBeCloseTo(0.3);
    });
  });

  describe('audio source', () => {
    it('sets to file', () => {
      useStore.getState().setAudioSource('file');
      expect(useStore.getState().audioSource).toBe('file');
    });

    it('sets to mic', () => {
      useStore.getState().setAudioSource('file');
      useStore.getState().setAudioSource('mic');
      expect(useStore.getState().audioSource).toBe('mic');
    });
  });

  describe('togglePlay', () => {
    it('toggles from playing to paused', () => {
      useStore.getState().togglePlay();
      expect(useStore.getState().isPlaying).toBe(false);
    });

    it('toggles from paused to playing', () => {
      useStore.getState().togglePlay(); // pause
      useStore.getState().togglePlay(); // play
      expect(useStore.getState().isPlaying).toBe(true);
    });
  });

  describe('audio levels', () => {
    it('sets BPM', () => {
      useStore.getState().setBpm(120);
      expect(useStore.getState().bpm).toBe(120);
    });

    it('sets audio level', () => {
      useStore.getState().setAudioLevel(0.75);
      expect(useStore.getState().audioLevel).toBe(0.75);
    });

    it('sets bass level', () => {
      useStore.getState().setBassLevel(0.9);
      expect(useStore.getState().bassLevel).toBe(0.9);
    });

    it('sets mid level', () => {
      useStore.getState().setMidLevel(0.5);
      expect(useStore.getState().midLevel).toBe(0.5);
    });

    it('sets high level', () => {
      useStore.getState().setHighLevel(0.3);
      expect(useStore.getState().highLevel).toBe(0.3);
    });

    it('handles zero values', () => {
      useStore.getState().setBpm(0);
      useStore.getState().setAudioLevel(0);
      useStore.getState().setBassLevel(0);
      expect(useStore.getState().bpm).toBe(0);
      expect(useStore.getState().audioLevel).toBe(0);
      expect(useStore.getState().bassLevel).toBe(0);
    });
  });

  describe('transition progress', () => {
    it('sets transition progress', () => {
      useStore.getState().setTransitionProgress(0.5);
      expect(useStore.getState().transitionProgress).toBe(0.5);
    });

    it('handles complete transition', () => {
      useStore.getState().setTransitionProgress(1);
      expect(useStore.getState().transitionProgress).toBe(1);
    });

    it('handles start of transition', () => {
      useStore.getState().setTransitionProgress(0);
      expect(useStore.getState().transitionProgress).toBe(0);
    });
  });

  describe('fileName', () => {
    it('sets file name', () => {
      useStore.getState().setFileName('track.mp3');
      expect(useStore.getState().fileName).toBe('track.mp3');
    });

    it('clears file name', () => {
      useStore.getState().setFileName('track.mp3');
      useStore.getState().setFileName(null);
      expect(useStore.getState().fileName).toBeNull();
    });
  });
});
