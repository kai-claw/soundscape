/**
 * SmoothAudio — Shared utility for interpolated, smoothed audio data.
 *
 * Provides exponentially-smoothed frequency & time-domain data that
 * all visualizers can consume for buttery, cinematic audio reactivity.
 * Also tracks peak levels, transient energy, and spectral flux for
 * advanced visualizer effects.
 *
 * Yellow Hat Pass 4: Amplifies SoundScape's core strength — audio reactivity.
 */

/** Smoothing factor (0–1). Lower = smoother/slower, higher = snappier */
const ATTACK = 0.35;   // how fast values rise
const RELEASE = 0.12;  // how fast values fall (slower = silky decay tails)

/** Number of spectral bands for compact band analysis */
const NUM_BANDS = 8;
/** Band edges as fractions of the frequency range */
const BAND_EDGES = [0, 0.03, 0.06, 0.12, 0.2, 0.35, 0.55, 0.78, 1.0];

export interface SmoothBands {
  /** 8-band spectral energy (0–1 each) */
  bands: Float32Array;
  /** Peak hold per band (decays slowly) */
  peaks: Float32Array;
  /** Spectral flux — how much the spectrum changed since last frame */
  flux: number;
  /** Transient energy — sudden loud burst detection (0–1) */
  transient: number;
  /** RMS level (overall energy, 0–1) */
  rms: number;
  /** Smoothed overall level (0–1) */
  level: number;
}

class SmoothAudioEngine {
  private smoothFreq: Float32Array = new Float32Array(0);
  private prevFreq: Float32Array = new Float32Array(0);
  private bandValues: Float32Array = new Float32Array(NUM_BANDS);
  private bandPeaks: Float32Array = new Float32Array(NUM_BANDS);
  private prevRms = 0;
  private smoothLevel = 0;
  private flux = 0;
  private transient = 0;

  /**
   * Call once per frame with raw frequency data.
   * Returns the smoothed band analysis.
   */
  update(rawFreq: Uint8Array, sensitivity = 1.0): SmoothBands {
    const len = rawFreq.length;

    // Lazy-init smoothed buffers
    if (this.smoothFreq.length !== len) {
      this.smoothFreq = new Float32Array(len);
      this.prevFreq = new Float32Array(len);
    }

    // Exponential smoothing with asymmetric attack/release
    for (let i = 0; i < len; i++) {
      const raw = (rawFreq[i] / 255) * sensitivity;
      const prev = this.smoothFreq[i];
      const factor = raw > prev ? ATTACK : RELEASE;
      this.smoothFreq[i] = prev + (raw - prev) * factor;
    }

    // Compute spectral flux (sum of positive changes)
    let fluxSum = 0;
    for (let i = 0; i < len; i++) {
      const delta = this.smoothFreq[i] - this.prevFreq[i];
      if (delta > 0) fluxSum += delta;
    }
    this.flux = Math.min(1, fluxSum / (len * 0.02));

    // Compute RMS
    let rmsSum = 0;
    for (let i = 0; i < len; i++) {
      rmsSum += this.smoothFreq[i] * this.smoothFreq[i];
    }
    const rms = Math.sqrt(rmsSum / len);

    // Transient detection: sudden RMS jump
    const rmsDelta = rms - this.prevRms;
    this.transient = Math.max(0, Math.min(1, rmsDelta * 8));
    // Decay transient
    if (this.transient < 0.01) this.transient = 0;

    // Smooth overall level
    const levelFactor = rms > this.smoothLevel ? 0.3 : 0.08;
    this.smoothLevel += (rms - this.smoothLevel) * levelFactor;

    // Compute 8-band analysis
    for (let b = 0; b < NUM_BANDS; b++) {
      const startIdx = Math.floor(BAND_EDGES[b] * len);
      const endIdx = Math.floor(BAND_EDGES[b + 1] * len);
      let sum = 0;
      const count = Math.max(1, endIdx - startIdx);
      for (let i = startIdx; i < endIdx; i++) {
        sum += this.smoothFreq[i];
      }
      const val = sum / count;
      this.bandValues[b] = val;

      // Peak hold with slow decay
      if (val > this.bandPeaks[b]) {
        this.bandPeaks[b] = val;
      } else {
        this.bandPeaks[b] *= 0.97; // slow decay
      }
    }

    // Save for next frame's flux calculation
    this.prevFreq.set(this.smoothFreq);
    this.prevRms = rms;

    return {
      bands: this.bandValues,
      peaks: this.bandPeaks,
      flux: this.flux,
      transient: this.transient,
      rms,
      level: this.smoothLevel,
    };
  }

  /** Get the full smoothed frequency array (0–1 normalized) */
  getSmoothedFreq(): Float32Array {
    return this.smoothFreq;
  }

  reset(): void {
    this.smoothFreq.fill(0);
    this.prevFreq.fill(0);
    this.bandValues.fill(0);
    this.bandPeaks.fill(0);
    this.prevRms = 0;
    this.smoothLevel = 0;
    this.flux = 0;
    this.transient = 0;
  }
}

/** Singleton — shared across all visualizers */
export const smoothAudio = new SmoothAudioEngine();
