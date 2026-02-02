/**
 * IdleBreathing — Generates gentle pseudo-audio levels when no signal
 * is detected, so visualizers drift and pulse rather than flatline.
 *
 * Uses multiple overlapping sine waves at different frequencies to create
 * organic, never-repeating breathing patterns. The output values are
 * intentionally low (0.02–0.15 range) to feel like ambient drift, not
 * fake audio.
 */

export class IdleBreathing {
  private startTime = 0;
  private active = false;

  /** Start generating idle breathing values */
  start(): void {
    if (this.active) return;
    this.active = true;
    this.startTime = performance.now();
  }

  /** Stop idle breathing */
  stop(): void {
    this.active = false;
  }

  get isActive(): boolean {
    return this.active;
  }

  /**
   * Get current idle breathing levels.
   * Returns values in the 0–0.15 range with organic variation.
   */
  getLevels(): { level: number; bass: number; mid: number; high: number } {
    if (!this.active) {
      return { level: 0, bass: 0, mid: 0, high: 0 };
    }

    const t = (performance.now() - this.startTime) / 1000;

    // Primary breathing cycle (~4 second inhale/exhale)
    const breath = (Math.sin(t * 0.8) + 1) * 0.5;

    // Secondary slower modulation (~11 seconds) for variation
    const drift = (Math.sin(t * 0.28 + 1.7) + 1) * 0.5;

    // Tertiary micro-rhythm (~1.5 seconds) for subtle pulse
    const pulse = (Math.sin(t * 2.1 + 0.3) + 1) * 0.5;

    // Each band has different phase and rate for organic feel
    const bass = 0.03 + breath * 0.08 + drift * 0.04;
    const mid = 0.02 + (Math.sin(t * 0.6 + 2.0) + 1) * 0.04 + pulse * 0.02;
    const high = 0.01 + (Math.sin(t * 1.1 + 4.5) + 1) * 0.025 + drift * 0.015;
    const level = bass * 0.5 + mid * 0.3 + high * 0.2;

    return { level, bass, mid, high };
  }

  /**
   * Generate idle frequency data (fake FFT) for visualizers that read audioData.freq directly.
   * Fills a Uint8Array with gentle breathing values.
   */
  getFrequencyData(buffer: Uint8Array): void {
    if (!this.active) return;

    const t = (performance.now() - this.startTime) / 1000;
    const len = buffer.length;

    for (let i = 0; i < len; i++) {
      const normPos = i / len; // 0 = bass, 1 = treble

      // Base breathing amplitude — higher for bass, lower for treble
      const baseAmp = (1 - normPos * 0.7) * 20;

      // Slow wave per frequency bin
      const wave = Math.sin(t * (0.5 + normPos * 0.3) + i * 0.1);

      // Gentle random-ish variation using overlapping sines
      const variation = Math.sin(t * 1.3 + i * 0.7) * 0.3
        + Math.sin(t * 0.7 + i * 0.3) * 0.2;

      const value = baseAmp * (0.5 + wave * 0.3 + variation * 0.2);
      buffer[i] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }

  /**
   * Generate idle time-domain data (fake waveform) — gentle sine drift.
   */
  getTimeDomainData(buffer: Uint8Array): void {
    if (!this.active) return;

    const t = (performance.now() - this.startTime) / 1000;
    const len = buffer.length;

    for (let i = 0; i < len; i++) {
      const phase = (i / len) * Math.PI * 2;
      const wave = Math.sin(phase + t * 0.5) * 8
        + Math.sin(phase * 2 + t * 0.3) * 3;
      buffer[i] = 128 + Math.round(wave);
    }
  }
}

export const idleBreathing = new IdleBreathing();
