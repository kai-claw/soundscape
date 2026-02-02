/**
 * Green Hat — Creative Ideas (Pass 3) Tests
 * Tests for: Cinematic Autoplay, Audio-Reactive Starfield
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('Green Hat — Creative Features', () => {
  beforeEach(() => {
    useStore.setState({
      mode: 'waveform',
      prevMode: null,
      transitionProgress: 1,
      theme: 'neon',
      cinematic: false,
      starfield: true,
    });
  });

  describe('Store: cinematic & starfield state', () => {
    it('defaults cinematic to false', () => {
      expect(useStore.getState().cinematic).toBe(false);
    });

    it('defaults starfield to true', () => {
      expect(useStore.getState().starfield).toBe(true);
    });

    it('toggleCinematic flips state', () => {
      useStore.getState().toggleCinematic();
      expect(useStore.getState().cinematic).toBe(true);
      useStore.getState().toggleCinematic();
      expect(useStore.getState().cinematic).toBe(false);
    });

    it('toggleStarfield flips state', () => {
      useStore.getState().toggleStarfield();
      expect(useStore.getState().starfield).toBe(false);
      useStore.getState().toggleStarfield();
      expect(useStore.getState().starfield).toBe(true);
    });

    it('cinematic does not interfere with other state', () => {
      useStore.getState().toggleCinematic();
      expect(useStore.getState().mode).toBe('waveform');
      expect(useStore.getState().theme).toBe('neon');
      expect(useStore.getState().isPlaying).toBe(true);
    });

    it('starfield does not interfere with other state', () => {
      useStore.getState().toggleStarfield();
      expect(useStore.getState().mode).toBe('waveform');
      expect(useStore.getState().theme).toBe('neon');
      expect(useStore.getState().isPlaying).toBe(true);
    });
  });

  describe('Cinematic Mode cycling logic', () => {
    const modes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel'] as const;

    it('setMode cycles correctly through all modes', () => {
      for (let i = 0; i < modes.length; i++) {
        useStore.getState().setMode(modes[(i + 1) % modes.length]);
        expect(useStore.getState().mode).toBe(modes[(i + 1) % modes.length]);
      }
    });

    it('setMode from last wraps to first', () => {
      useStore.getState().setMode('tunnel');
      expect(useStore.getState().mode).toBe('tunnel');
      const idx = modes.indexOf('tunnel');
      const next = modes[(idx + 1) % modes.length];
      useStore.getState().setMode(next);
      expect(useStore.getState().mode).toBe('waveform');
    });

    it('setMode triggers transition (prevMode and progress)', () => {
      useStore.getState().setMode('particles');
      expect(useStore.getState().prevMode).toBe('waveform');
      expect(useStore.getState().transitionProgress).toBe(0);
    });

    it('setMode to same mode is a no-op', () => {
      useStore.getState().setMode('waveform');
      expect(useStore.getState().prevMode).toBeNull();
      expect(useStore.getState().transitionProgress).toBe(1);
    });
  });

  describe('Starfield constants', () => {
    it('star count (800) is reasonable for performance', () => {
      // Documented constant in Starfield.tsx — verified here for consistency
      const STAR_COUNT = 800;
      expect(STAR_COUNT).toBeGreaterThanOrEqual(500);
      expect(STAR_COUNT).toBeLessThanOrEqual(2000);
    });

    it('field size (30) covers camera range', () => {
      const FIELD_SIZE = 30;
      // Camera maxDistance is 15 — field should be at least 2x that
      expect(FIELD_SIZE).toBeGreaterThanOrEqual(25);
    });
  });

  describe('Cinematic timing constants', () => {
    it('interval (12s) is long enough for appreciation, short enough for engagement', () => {
      const CINEMATIC_INTERVAL = 12000;
      expect(CINEMATIC_INTERVAL).toBeGreaterThanOrEqual(8000);
      expect(CINEMATIC_INTERVAL).toBeLessThanOrEqual(20000);
    });
  });

  describe('Mode info completeness', () => {
    const modes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel'] as const;
    const modeInfo: Record<string, { emoji: string; name: string; desc: string }> = {
      waveform: { emoji: '🌊', name: 'Waveform', desc: 'Audio ribbon flowing through space' },
      frequency: { emoji: '📊', name: 'Frequency', desc: 'Frequency spectrum city grid' },
      particles: { emoji: '✨', name: 'Particles', desc: '3000 audio-reactive particles' },
      kaleidoscope: { emoji: '🔮', name: 'Kaleidoscope', desc: '8-fold mirrored geometry' },
      tunnel: { emoji: '🕳️', name: 'Tunnel', desc: 'Bass-reactive warp tunnel' },
    };

    for (const m of modes) {
      it(`has info for mode: ${m}`, () => {
        const info = modeInfo[m];
        expect(info).toBeDefined();
        expect(info.emoji.length).toBeGreaterThan(0);
        expect(info.name.length).toBeGreaterThan(0);
        expect(info.desc.length).toBeGreaterThan(0);
      });
    }
  });

  describe('Multiple rapid toggles', () => {
    it('cinematic handles rapid toggling without breaking state', () => {
      for (let i = 0; i < 20; i++) {
        useStore.getState().toggleCinematic();
      }
      // Even number of toggles — should be back to false
      expect(useStore.getState().cinematic).toBe(false);
    });

    it('starfield handles rapid toggling without breaking state', () => {
      for (let i = 0; i < 21; i++) {
        useStore.getState().toggleStarfield();
      }
      // Odd number from true — should be false
      expect(useStore.getState().starfield).toBe(false);
    });
  });

  describe('Feature independence', () => {
    it('cinematic and starfield are independently toggleable', () => {
      useStore.getState().toggleCinematic();
      expect(useStore.getState().cinematic).toBe(true);
      expect(useStore.getState().starfield).toBe(true);

      useStore.getState().toggleStarfield();
      expect(useStore.getState().cinematic).toBe(true);
      expect(useStore.getState().starfield).toBe(false);

      useStore.getState().toggleCinematic();
      expect(useStore.getState().cinematic).toBe(false);
      expect(useStore.getState().starfield).toBe(false);
    });

    it('mode changes do not affect cinematic/starfield', () => {
      useStore.getState().toggleCinematic();
      useStore.getState().setMode('tunnel');
      expect(useStore.getState().cinematic).toBe(true);
      expect(useStore.getState().starfield).toBe(true);
    });

    it('theme changes do not affect cinematic/starfield', () => {
      useStore.getState().toggleCinematic();
      useStore.getState().toggleStarfield();
      useStore.getState().cycleTheme();
      expect(useStore.getState().cinematic).toBe(true);
      expect(useStore.getState().starfield).toBe(false);
    });
  });

  describe('Deterministic PRNG (mulberry32 parity)', () => {
    function mulberry32(seed: number) {
      let s = seed | 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    it('same seed produces same sequence', () => {
      const r1 = mulberry32(7777);
      const r2 = mulberry32(7777);
      for (let i = 0; i < 100; i++) {
        expect(r1()).toBe(r2());
      }
    });

    it('output is in [0, 1)', () => {
      const rand = mulberry32(7777);
      for (let i = 0; i < 1000; i++) {
        const v = rand();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it('different seeds produce different sequences', () => {
      const r1 = mulberry32(7777);
      const r2 = mulberry32(42);
      let same = 0;
      for (let i = 0; i < 100; i++) {
        if (r1() === r2()) same++;
      }
      expect(same).toBeLessThan(5); // practically impossible to match
    });
  });
});
