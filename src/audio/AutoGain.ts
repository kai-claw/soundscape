/**
 * AutoGain — Automatic sensitivity normalization.
 *
 * Monitors input levels and dynamically adjusts an internal gain so that
 * quiet tracks feel as punchy as loud ones. Users still control the
 * sensitivity slider (multiplied on top of auto-gain).
 *
 * Yellow Hat Pass 4: Makes every audio source shine at its best.
 */

/** How many frames to average for level estimation */
const WINDOW_FRAMES = 120; // ~2 seconds at 60fps
/** Target normalized RMS level */
const TARGET_RMS = 0.35;
/** Gain limits */
const MIN_GAIN = 0.5;
const MAX_GAIN = 4.0;
/** Smoothing for gain changes (avoid pumping) */
const GAIN_SMOOTH = 0.02;

class AutoGainEngine {
  private enabled = true;
  private rmsHistory: Float32Array = new Float32Array(WINDOW_FRAMES);
  private writeIdx = 0;
  private filled = 0;
  private currentGain = 1.0;
  private smoothedGain = 1.0;

  /** Call once per frame with the raw average level (0–1) */
  update(rawLevel: number): number {
    if (!this.enabled) return 1.0;

    // Track RMS history
    this.rmsHistory[this.writeIdx] = rawLevel;
    this.writeIdx = (this.writeIdx + 1) % WINDOW_FRAMES;
    this.filled = Math.min(this.filled + 1, WINDOW_FRAMES);

    // Compute average RMS over window
    let sum = 0;
    for (let i = 0; i < this.filled; i++) {
      sum += this.rmsHistory[i];
    }
    const avgRms = sum / this.filled;

    // Avoid division by near-zero (silence)
    if (avgRms < 0.005) {
      // During silence, hold current gain
      return this.smoothedGain;
    }

    // Compute target gain
    this.currentGain = Math.max(MIN_GAIN, Math.min(MAX_GAIN, TARGET_RMS / avgRms));

    // Smooth gain transitions to avoid pumping
    this.smoothedGain += (this.currentGain - this.smoothedGain) * GAIN_SMOOTH;

    return this.smoothedGain;
  }

  getGain(): number {
    return this.smoothedGain;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.smoothedGain = 1.0;
      this.currentGain = 1.0;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  reset(): void {
    this.rmsHistory.fill(0);
    this.writeIdx = 0;
    this.filled = 0;
    this.currentGain = 1.0;
    this.smoothedGain = 1.0;
  }
}

/** Singleton */
export const autoGain = new AutoGainEngine();
