/**
 * BPM detection using onset detection via energy peaks in the bass range.
 * Tracks time between beat onsets and computes tempo.
 */
export class BPMDetector {
  private beatTimes: number[] = [];
  private lastBeatTime = 0;
  private threshold = 0.6;
  private cooldownMs = 200;
  private prevEnergy = 0;
  private energyHistory: number[] = [];
  private historySize = 43; // ~1s at 60fps

  detect(bassLevel: number, now: number): number {
    this.energyHistory.push(bassLevel);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    const avg =
      this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
    const dynamicThreshold = Math.max(this.threshold, avg * 1.4);

    const isOnset =
      bassLevel > dynamicThreshold &&
      bassLevel > this.prevEnergy * 1.15 &&
      now - this.lastBeatTime > this.cooldownMs;

    this.prevEnergy = bassLevel;

    if (isOnset) {
      this.lastBeatTime = now;
      this.beatTimes.push(now);

      // Keep last 20 beats
      if (this.beatTimes.length > 20) {
        this.beatTimes.shift();
      }

      if (this.beatTimes.length >= 4) {
        return this.computeBPM();
      }
    }

    // Return last computed BPM from existing beats
    if (this.beatTimes.length >= 4) {
      return this.computeBPM();
    }

    return 0;
  }

  private computeBPM(): number {
    const intervals: number[] = [];
    for (let i = 1; i < this.beatTimes.length; i++) {
      intervals.push(this.beatTimes[i] - this.beatTimes[i - 1]);
    }

    // Filter outliers (keep intervals between 250ms and 2000ms = 30-240 BPM)
    const valid = intervals.filter((v) => v >= 250 && v <= 2000);
    if (valid.length < 2) return 0;

    const avgInterval = valid.reduce((a, b) => a + b, 0) / valid.length;
    const bpm = 60000 / avgInterval;

    // Clamp to reasonable range
    return Math.round(Math.min(240, Math.max(30, bpm)));
  }

  reset() {
    this.beatTimes = [];
    this.lastBeatTime = 0;
    this.prevEnergy = 0;
    this.energyHistory = [];
  }
}
