/**
 * DemoAudio — Built-in generative audio so users can experience
 * the visualizer without a microphone or audio file.
 *
 * Creates a layered ambient synth using Web Audio API oscillators:
 * - Bass drone (slow LFO-modulated sine)
 * - Mid pad (detuned triangle pair with filter sweep)
 * - High shimmer (quiet sine harmonics with random panning)
 * - Rhythmic pulse (filtered noise burst on a timer)
 *
 * All connected through AudioEngine's analyser for visualization.
 */

import { audioEngine } from './AudioEngine';

export class DemoAudio {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private active = false;

  /** BPM of the rhythmic pulse — drives the beat */
  readonly bpm = 110;
  private get beatMs() {
    return (60 / this.bpm) * 1000;
  }

  async start(): Promise<void> {
    if (this.active) return;

    // Ensure AudioEngine has a context + analyser
    await audioEngine.init();
    audioEngine.disconnect(); // Disconnect any existing source

    this.ctx = audioEngine.ctx!;
    const analyser = audioEngine.analyser!;
    this.active = true;

    // Master gain (keep it moderate — we want visualization, not loudness)
    const master = this.ctx.createGain();
    master.gain.value = 0.35;
    master.connect(analyser);
    analyser.connect(this.ctx.destination);
    this.nodes.push(master);

    this.createBassDrone(master);
    this.createMidPad(master);
    this.createHighShimmer(master);
    this.createRhythmicPulse(master);
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;

    // Clear intervals
    for (const id of this.intervals) clearInterval(id);
    this.intervals = [];

    // Stop and disconnect all nodes
    for (const node of this.nodes) {
      try {
        if (node instanceof OscillatorNode) node.stop();
        node.disconnect();
      } catch {
        // Already stopped/disconnected
      }
    }
    this.nodes = [];
  }

  get isActive(): boolean {
    return this.active;
  }

  /** Bass drone: deep sine with slow LFO vibrato */
  private createBassDrone(dest: AudioNode): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55; // A1

    // LFO for gentle pitch wobble
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // Very slow

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 2; // ±2Hz wobble

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0.6;

    osc.connect(bassGain);
    bassGain.connect(dest);

    osc.start();
    lfo.start();

    this.nodes.push(osc, lfo, lfoGain, bassGain);
  }

  /** Mid pad: detuned triangle pair with filter sweep */
  private createMidPad(dest: AudioNode): void {
    if (!this.ctx) return;

    const baseFreq = 220; // A3

    // Two slightly detuned oscillators for richness
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.value = baseFreq;

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 1.005; // Slight detune

    // Low-pass filter with slow sweep
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;

    // Filter LFO for sweep
    const filterLfo = this.ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.value = 0.08; // Very slow sweep

    const filterLfoGain = this.ctx.createGain();
    filterLfoGain.gain.value = 400; // Sweep range

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.25;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(padGain);
    padGain.connect(dest);

    osc1.start();
    osc2.start();
    filterLfo.start();

    this.nodes.push(osc1, osc2, filter, filterLfo, filterLfoGain, padGain);
  }

  /** High shimmer: quiet harmonics with slow amplitude modulation */
  private createHighShimmer(dest: AudioNode): void {
    if (!this.ctx) return;

    const harmonics = [880, 1320, 1760]; // A5, E6, A6

    for (let i = 0; i < harmonics.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = harmonics[i];

      // Amplitude LFO — each harmonic at different rate for shimmer
      const ampLfo = this.ctx.createOscillator();
      ampLfo.type = 'sine';
      ampLfo.frequency.value = 0.3 + i * 0.2;

      const ampGain = this.ctx.createGain();
      ampGain.gain.value = 0.06;

      const lfoToAmp = this.ctx.createGain();
      lfoToAmp.gain.value = 0.04;

      ampLfo.connect(lfoToAmp);
      lfoToAmp.connect(ampGain.gain);

      osc.connect(ampGain);
      ampGain.connect(dest);

      osc.start();
      ampLfo.start();

      this.nodes.push(osc, ampLfo, ampGain, lfoToAmp);
    }
  }

  /** Rhythmic pulse: filtered noise burst on beat intervals */
  private createRhythmicPulse(dest: AudioNode): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    const scheduleKick = () => {
      if (!this.active || !ctx) return;
      try {
        const now = ctx.currentTime;

        // Kick — short sine burst
        const kickOsc = ctx.createOscillator();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        const kickGain = ctx.createGain();
        kickGain.gain.setValueAtTime(0.5, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        kickOsc.connect(kickGain);
        kickGain.connect(dest);
        kickOsc.start(now);
        kickOsc.stop(now + 0.25);

        // Hi-hat — filtered noise burst (every other beat)
        if (Math.random() > 0.4) {
          const bufferSize = ctx.sampleRate * 0.05;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;

          const hiFilter = ctx.createBiquadFilter();
          hiFilter.type = 'highpass';
          hiFilter.frequency.value = 8000;

          const hiGain = ctx.createGain();
          hiGain.gain.setValueAtTime(0.15, now + 0.01);
          hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          noise.connect(hiFilter);
          hiFilter.connect(hiGain);
          hiGain.connect(dest);
          noise.start(now + 0.01);
        }
      } catch {
        // Context might be closed
      }
    };

    // Schedule beats
    const interval = setInterval(scheduleKick, this.beatMs);
    this.intervals.push(interval);

    // Start immediately
    scheduleKick();
  }
}

export const demoAudio = new DemoAudio();
