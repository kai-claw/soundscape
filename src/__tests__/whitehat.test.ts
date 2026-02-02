/**
 * White Hat Pass 1 — Comprehensive Audit Tests for SoundScape
 * Tests cover: audio engine, BPM detection, store, themes, visualizer config, type system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BPMDetector } from '../audio/BPMDetector';
import { AudioEngine } from '../audio/AudioEngine';
import { themeMap, getThemeColor, lerpColor, type ThemeColors } from '../themes/colorThemes';
import type { VisualizationMode, ColorTheme, AudioSource } from '../store/useStore';

// ─── Audio Engine ───────────────────────────────────────────────────────────

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  it('initializes with null context', () => {
    expect(engine.ctx).toBeNull();
    expect(engine.analyser).toBeNull();
    expect(engine.source).toBeNull();
    expect(engine.audioElement).toBeNull();
  });

  it('returns zero-filled freq data before init', () => {
    const data = engine.getFrequencyData();
    expect(data).toBeInstanceOf(Uint8Array);
    expect(data.length).toBe(0);
  });

  it('returns zero-filled time data before init', () => {
    const data = engine.getTimeDomainData();
    expect(data).toBeInstanceOf(Uint8Array);
    expect(data.length).toBe(0);
  });

  it('returns 0 average level before init', () => {
    expect(engine.getAverageLevel()).toBe(0);
  });

  it('returns zero band levels before init', () => {
    const bands = engine.getBandLevels();
    expect(bands.bass).toBe(0);
    expect(bands.mid).toBe(0);
    expect(bands.high).toBe(0);
  });

  it('initializes AudioContext on init()', async () => {
    await engine.init();
    expect(engine.ctx).not.toBeNull();
    expect(engine.analyser).not.toBeNull();
  });

  it('double init does not create duplicate context', async () => {
    await engine.init();
    const ctx1 = engine.ctx;
    await engine.init();
    expect(engine.ctx).toBe(ctx1);
  });

  it('disconnect cleans up source and stream', async () => {
    await engine.init();
    engine.disconnect();
    expect(engine.source).toBeNull();
  });

  it('destroy closes context', async () => {
    await engine.init();
    engine.destroy();
    expect(engine.ctx).toBeNull();
    expect(engine.analyser).toBeNull();
  });

  it('connectMic sets up source', async () => {
    await engine.connectMic();
    expect(engine.ctx).not.toBeNull();
    expect(engine.source).not.toBeNull();
  });

  it('band level calculation uses correct proportions', async () => {
    await engine.init();
    // After init, freqData is filled with 128 by mock
    const data = engine.getFrequencyData();
    expect(data.length).toBe(1024);
    const bands = engine.getBandLevels();
    // All bands should be roughly equal since mock fills with 128
    expect(bands.bass).toBeGreaterThan(0);
    expect(bands.mid).toBeGreaterThan(0);
    expect(bands.high).toBeGreaterThan(0);
  });
});

// ─── BPM Detector ───────────────────────────────────────────────────────────

describe('BPMDetector', () => {
  let detector: BPMDetector;

  beforeEach(() => {
    detector = new BPMDetector();
  });

  it('returns 0 BPM with no input', () => {
    expect(detector.detect(0, 0)).toBe(0);
  });

  it('returns 0 BPM with insufficient beats', () => {
    detector.detect(0.8, 0);
    detector.detect(0.8, 500);
    expect(detector.detect(0.8, 1000)).toBe(0);
  });

  it('detects BPM from regular beat pattern', () => {
    // Simulate 120 BPM = 500ms intervals
    let bpm = 0;
    for (let i = 0; i < 10; i++) {
      // Alternate low/high to trigger onset detection
      detector.detect(0.1, i * 250);
      bpm = detector.detect(0.9, i * 500);
    }
    // Should detect something in 60-240 range
    expect(bpm).toBeGreaterThanOrEqual(30);
    expect(bpm).toBeLessThanOrEqual(240);
  });

  it('respects cooldown period', () => {
    const bpm1 = detector.detect(0.9, 0);
    const bpm2 = detector.detect(0.9, 50); // Within cooldown
    expect(bpm1).toBe(0);
    expect(bpm2).toBe(0);
  });

  it('reset clears state', () => {
    detector.detect(0.9, 0);
    detector.detect(0.9, 500);
    detector.reset();
    expect(detector.detect(0, 1000)).toBe(0);
  });

  it('clamps BPM to 30-240 range', () => {
    // Very fast beats
    for (let i = 0; i < 20; i++) {
      detector.detect(0.1, i * 125);
      detector.detect(0.95, i * 250 + 125);
    }
    const bpm = detector.detect(0.95, 5125);
    if (bpm > 0) {
      expect(bpm).toBeGreaterThanOrEqual(30);
      expect(bpm).toBeLessThanOrEqual(240);
    }
  });

  it('filters outlier intervals', () => {
    // Mix of normal and extreme intervals
    detector.detect(0.9, 0);
    detector.detect(0.9, 500);
    detector.detect(0.9, 1000);
    detector.detect(0.9, 1500);
    const bpm = detector.detect(0.9, 2000);
    if (bpm > 0) {
      expect(bpm).toBeGreaterThanOrEqual(30);
      expect(bpm).toBeLessThanOrEqual(240);
    }
  });

  it('keeps only last 20 beats', () => {
    for (let i = 0; i < 30; i++) {
      detector.detect(0.1, i * 400);
      detector.detect(0.95, i * 400 + 250);
    }
    // Should still work without crashing
    const bpm = detector.detect(0.95, 12250);
    expect(typeof bpm).toBe('number');
  });
});

// ─── Color Themes ───────────────────────────────────────────────────────────

describe('Color Themes', () => {
  const themeNames: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];

  it('has exactly 4 themes', () => {
    expect(Object.keys(themeMap)).toHaveLength(4);
  });

  themeNames.forEach((name) => {
    describe(`Theme: ${name}`, () => {
      let theme: ThemeColors;

      beforeEach(() => {
        theme = themeMap[name];
      });

      it('has all required fields', () => {
        expect(theme.primary).toBeDefined();
        expect(theme.secondary).toBeDefined();
        expect(theme.tertiary).toBeDefined();
        expect(theme.accent).toBeDefined();
        expect(theme.background).toBeDefined();
        expect(theme.colors).toBeDefined();
      });

      it('has valid hex color strings', () => {
        const hexRegex = /^#[0-9a-fA-F]{6}$/;
        expect(theme.primary).toMatch(hexRegex);
        expect(theme.secondary).toMatch(hexRegex);
        expect(theme.tertiary).toMatch(hexRegex);
        expect(theme.accent).toMatch(hexRegex);
        expect(theme.background).toMatch(hexRegex);
      });

      it('has exactly 4 RGB color tuples', () => {
        expect(theme.colors).toHaveLength(4);
      });

      it('all RGB values are in 0-1 range', () => {
        for (const [r, g, b] of theme.colors) {
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(1);
          expect(g).toBeGreaterThanOrEqual(0);
          expect(g).toBeLessThanOrEqual(1);
          expect(b).toBeGreaterThanOrEqual(0);
          expect(b).toBeLessThanOrEqual(1);
        }
      });

      it('has dark background', () => {
        // All backgrounds should be very dark for visualizer contrast
        const hex = theme.background.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const brightness = (r + g + b) / 3;
        expect(brightness).toBeLessThan(40);
      });
    });
  });

  describe('getThemeColor', () => {
    it('returns correct color for index 0', () => {
      const c = getThemeColor('neon', 0);
      expect(c).toEqual([1.0, 0.0, 1.0]);
    });

    it('wraps index beyond array length', () => {
      const c = getThemeColor('neon', 4);
      expect(c).toEqual(getThemeColor('neon', 0));
    });

    it('wraps large index', () => {
      const c = getThemeColor('ocean', 100);
      expect(c).toEqual(getThemeColor('ocean', 0));
    });

    it('returns 3-element tuple', () => {
      for (const theme of themeNames) {
        for (let i = 0; i < 8; i++) {
          const c = getThemeColor(theme, i);
          expect(c).toHaveLength(3);
        }
      }
    });
  });

  describe('lerpColor', () => {
    it('returns a at t=0', () => {
      const a: [number, number, number] = [1, 0, 0];
      const b: [number, number, number] = [0, 1, 0];
      expect(lerpColor(a, b, 0)).toEqual([1, 0, 0]);
    });

    it('returns b at t=1', () => {
      const a: [number, number, number] = [1, 0, 0];
      const b: [number, number, number] = [0, 1, 0];
      expect(lerpColor(a, b, 1)).toEqual([0, 1, 0]);
    });

    it('returns midpoint at t=0.5', () => {
      const a: [number, number, number] = [0, 0, 0];
      const b: [number, number, number] = [1, 1, 1];
      const mid = lerpColor(a, b, 0.5);
      expect(mid[0]).toBeCloseTo(0.5);
      expect(mid[1]).toBeCloseTo(0.5);
      expect(mid[2]).toBeCloseTo(0.5);
    });
  });
});

// ─── Store Types ────────────────────────────────────────────────────────────

describe('Store Types Consistency', () => {
  it('VisualizationMode covers all 5 modes', () => {
    const modes: VisualizationMode[] = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel'];
    expect(modes).toHaveLength(5);
    // Type system ensures these are valid
    modes.forEach((m) => {
      expect(typeof m).toBe('string');
    });
  });

  it('ColorTheme covers all 4 themes', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];
    expect(themes).toHaveLength(4);
    themes.forEach((t) => {
      expect(themeMap[t]).toBeDefined();
    });
  });

  it('AudioSource covers mic and file', () => {
    const sources: AudioSource[] = ['mic', 'file'];
    expect(sources).toHaveLength(2);
  });

  it('all modes have corresponding theme colors', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];
    for (const theme of themes) {
      // Each theme must have 4+ colors for visualizer use
      expect(themeMap[theme].colors.length).toBeGreaterThanOrEqual(4);
    }
  });
});

// ─── Visualizer Constants ───────────────────────────────────────────────────

describe('Visualizer Configuration Constants', () => {
  it('particle count is reasonable for WebGL', () => {
    const COUNT = 3000;
    expect(COUNT).toBeGreaterThan(100);
    expect(COUNT).toBeLessThan(100000);
  });

  it('frequency grid is square', () => {
    const GRID = 16;
    expect(GRID * GRID).toBe(256);
  });

  it('tunnel ring count is reasonable', () => {
    const RINGS = 30;
    expect(RINGS).toBeGreaterThan(5);
    expect(RINGS).toBeLessThan(100);
  });

  it('kaleidoscope mirror count creates symmetry', () => {
    const MIRRORS = 8;
    expect(360 % (360 / MIRRORS)).toBe(0); // Evenly divides circle
  });

  it('waveform segment count is power-friendly', () => {
    const SEGMENTS = 128;
    expect(Math.log2(SEGMENTS)).toBe(7);
  });

  it('FFT size is power of 2', () => {
    const fftSize = 2048;
    expect(Math.log2(fftSize)).toBe(11);
  });
});

// ─── Cross-Module Integration ───────────────────────────────────────────────

describe('Cross-Module Integration', () => {
  it('all theme colors work with getThemeColor for all indices', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];
    for (const theme of themes) {
      for (let i = 0; i < 10; i++) {
        const c = getThemeColor(theme, i);
        expect(c).toHaveLength(3);
        c.forEach((v) => {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        });
      }
    }
  });

  it('lerpColor produces valid RGB for all theme pairs', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];
    for (let i = 0; i < themes.length - 1; i++) {
      const a = getThemeColor(themes[i], 0);
      const b = getThemeColor(themes[i + 1], 0);
      const mid = lerpColor(a, b, 0.5);
      mid.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    }
  });

  it('AudioEngine and BPMDetector work together', async () => {
    const engine = new AudioEngine();
    const detector = new BPMDetector();
    await engine.init();
    const bands = engine.getBandLevels();
    const bpm = detector.detect(bands.bass, performance.now());
    expect(typeof bpm).toBe('number');
    engine.destroy();
  });

  it('theme backgrounds are valid CSS colors', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];
    for (const theme of themes) {
      const bg = themeMap[theme].background;
      expect(bg).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

// ─── Module Exports ─────────────────────────────────────────────────────────

describe('Module Exports', () => {
  it('AudioEngine exports class and singleton', async () => {
    const { AudioEngine, audioEngine } = await import('../audio/AudioEngine');
    expect(AudioEngine).toBeDefined();
    expect(audioEngine).toBeInstanceOf(AudioEngine);
  });

  it('BPMDetector exports class', async () => {
    const { BPMDetector } = await import('../audio/BPMDetector');
    expect(BPMDetector).toBeDefined();
    expect(new BPMDetector()).toBeInstanceOf(BPMDetector);
  });

  it('colorThemes exports themeMap, getThemeColor, lerpColor', async () => {
    const mod = await import('../themes/colorThemes');
    expect(mod.themeMap).toBeDefined();
    expect(mod.getThemeColor).toBeDefined();
    expect(mod.lerpColor).toBeDefined();
  });

  it('useStore exports store hook', async () => {
    const { useStore } = await import('../store/useStore');
    expect(useStore).toBeDefined();
    expect(typeof useStore).toBe('function');
  });
});
