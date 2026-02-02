import { describe, it, expect, beforeEach } from 'vitest';
import { AudioEngine } from './AudioEngine';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  describe('initial state', () => {
    it('starts with null context', () => {
      expect(engine.ctx).toBeNull();
    });

    it('starts with null analyser', () => {
      expect(engine.analyser).toBeNull();
    });

    it('starts with null source', () => {
      expect(engine.source).toBeNull();
    });

    it('starts with null audioElement', () => {
      expect(engine.audioElement).toBeNull();
    });
  });

  describe('init', () => {
    it('creates AudioContext and AnalyserNode', async () => {
      await engine.init();
      expect(engine.ctx).not.toBeNull();
      expect(engine.analyser).not.toBeNull();
    });

    it('sets fftSize on analyser', async () => {
      await engine.init();
      expect(engine.analyser!.fftSize).toBe(2048);
    });

    it('idempotent — does not recreate on second call', async () => {
      await engine.init();
      const ctx1 = engine.ctx;
      await engine.init();
      expect(engine.ctx).toBe(ctx1);
    });
  });

  describe('connectMic', () => {
    it('initializes and creates source', async () => {
      await engine.connectMic();
      expect(engine.ctx).not.toBeNull();
      expect(engine.source).not.toBeNull();
    });
  });

  describe('getFrequencyData', () => {
    it('returns Uint8Array before init', () => {
      const data = engine.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBe(0);
    });

    it('returns data after init', async () => {
      await engine.init();
      const data = engine.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBe(1024); // frequencyBinCount
    });
  });

  describe('getTimeDomainData', () => {
    it('returns Uint8Array before init', () => {
      const data = engine.getTimeDomainData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBe(0);
    });

    it('returns data after init', async () => {
      await engine.init();
      const data = engine.getTimeDomainData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBe(2048); // fftSize
    });
  });

  describe('getAverageLevel', () => {
    it('returns 0 before init', () => {
      expect(engine.getAverageLevel()).toBe(0);
    });

    it('returns normalized value after init', async () => {
      await engine.init();
      const level = engine.getAverageLevel();
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    });
  });

  describe('getBandLevels', () => {
    it('returns zeros before init', () => {
      const bands = engine.getBandLevels();
      expect(bands).toEqual({ bass: 0, mid: 0, high: 0 });
    });

    it('returns band levels after init', async () => {
      await engine.init();
      // Trigger a getFrequencyData call to populate freqData
      engine.getFrequencyData();
      const bands = engine.getBandLevels();
      expect(bands.bass).toBeGreaterThanOrEqual(0);
      expect(bands.bass).toBeLessThanOrEqual(1);
      expect(bands.mid).toBeGreaterThanOrEqual(0);
      expect(bands.mid).toBeLessThanOrEqual(1);
      expect(bands.high).toBeGreaterThanOrEqual(0);
      expect(bands.high).toBeLessThanOrEqual(1);
    });
  });

  describe('disconnect', () => {
    it('cleans up source', async () => {
      await engine.connectMic();
      engine.disconnect();
      expect(engine.source).toBeNull();
    });

    it('safe to call when not connected', () => {
      expect(() => engine.disconnect()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('cleans up everything', async () => {
      await engine.init();
      engine.destroy();
      expect(engine.ctx).toBeNull();
      expect(engine.analyser).toBeNull();
    });

    it('safe to call when not initialized', () => {
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});
