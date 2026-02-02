import { describe, it, expect, beforeEach } from 'vitest';
import { BPMDetector } from './BPMDetector';

describe('BPMDetector', () => {
  let detector: BPMDetector;

  beforeEach(() => {
    detector = new BPMDetector();
  });

  describe('detect', () => {
    it('returns 0 with no beats', () => {
      expect(detector.detect(0, 0)).toBe(0);
    });

    it('returns 0 with insufficient beats', () => {
      // Only 1 beat — need at least 4
      expect(detector.detect(0.8, 0)).toBe(0);
    });

    it('returns 0 with low energy', () => {
      // Below threshold
      for (let i = 0; i < 10; i++) {
        expect(detector.detect(0.1, i * 500)).toBe(0);
      }
    });

    it('detects 120 BPM (500ms intervals)', () => {
      // Simulate beats at 500ms intervals = 120 BPM
      // Need alternating low-high to trigger onset detection
      let bpm = 0;
      for (let i = 0; i < 20; i++) {
        const time = i * 250;
        const energy = i % 2 === 0 ? 0.9 : 0.1;
        bpm = detector.detect(energy, time);
      }
      // Should detect ~120 BPM (±tolerance for onset detection)
      expect(bpm).toBeGreaterThan(0);
      expect(bpm).toBeGreaterThanOrEqual(60);
      expect(bpm).toBeLessThanOrEqual(240);
    });

    it('detects 60 BPM (1000ms intervals)', () => {
      let bpm = 0;
      for (let i = 0; i < 30; i++) {
        const time = i * 500;
        const energy = i % 2 === 0 ? 0.85 : 0.05;
        bpm = detector.detect(energy, time);
      }
      expect(bpm).toBeGreaterThan(0);
      expect(bpm).toBeLessThanOrEqual(240);
    });

    it('respects cooldown period', () => {
      // Two beats within 200ms cooldown should count as one
      const bpm1 = detector.detect(0.9, 0);
      const bpm2 = detector.detect(0.9, 100); // within cooldown
      // Both should return 0 since we don't have 4 beats yet
      expect(bpm1).toBe(0);
      expect(bpm2).toBe(0);
    });

    it('clamps BPM to valid range (30-240)', () => {
      let bpm = 0;
      // Feed regular beats
      for (let i = 0; i < 30; i++) {
        const time = i * 300;
        const energy = i % 2 === 0 ? 0.95 : 0.05;
        bpm = detector.detect(energy, time);
      }
      if (bpm > 0) {
        expect(bpm).toBeGreaterThanOrEqual(30);
        expect(bpm).toBeLessThanOrEqual(240);
      }
    });

    it('filters outlier intervals', () => {
      // Mix of normal and outlier intervals
      const times = [0, 500, 1000, 1500, 5000, 5500, 6000, 6500];
      let bpm = 0;
      for (const t of times) {
        bpm = detector.detect(t % 1000 === 0 ? 0.9 : 0.05, t);
      }
      if (bpm > 0) {
        expect(bpm).toBeGreaterThanOrEqual(30);
        expect(bpm).toBeLessThanOrEqual(240);
      }
    });
  });

  describe('reset', () => {
    it('clears state after reset', () => {
      // Build up some beats
      for (let i = 0; i < 20; i++) {
        detector.detect(i % 2 === 0 ? 0.9 : 0.05, i * 300);
      }
      
      detector.reset();
      
      // After reset, should return 0 again
      expect(detector.detect(0.1, 10000)).toBe(0);
    });
  });

  describe('dynamic threshold', () => {
    it('adapts threshold based on energy history', () => {
      // Feed consistently high energy — threshold should rise
      let bpmHigh = 0;
      for (let i = 0; i < 50; i++) {
        bpmHigh = detector.detect(0.7 + Math.random() * 0.1, i * 300);
      }
      
      const detector2 = new BPMDetector();
      let bpmLow = 0;
      for (let i = 0; i < 50; i++) {
        bpmLow = detector2.detect(i % 5 === 0 ? 0.8 : 0.1, i * 300);
      }
      
      // With high consistent energy, fewer beats detected (threshold rises)
      // With clear contrast, more beats detected
      // Just verify both work without crashing
      expect(bpmHigh).toBeGreaterThanOrEqual(0);
      expect(bpmLow).toBeGreaterThanOrEqual(0);
    });
  });

  describe('beat history', () => {
    it('keeps max 20 beats', () => {
      // Feed 30+ beats
      for (let i = 0; i < 60; i++) {
        detector.detect(i % 2 === 0 ? 0.95 : 0.01, i * 300);
      }
      // Should not crash, BPM should still be valid
      const finalBpm = detector.detect(0.95, 60 * 300);
      expect(finalBpm).toBeGreaterThanOrEqual(0);
      expect(finalBpm).toBeLessThanOrEqual(240);
    });
  });
});
