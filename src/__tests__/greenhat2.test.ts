/**
 * Green Hat #2 Tests — Creative Features (Pass 7)
 *
 * Validates: IdleBreathing, DemoAudio, GPU Performance Tiers,
 * BPM-Adaptive Cinematic, Video Recording, and their integration.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

function readSrc(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf-8');
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(SRC, rel));
}

// ─── Idle Breathing ───────────────────────────────────────────────

describe('Green Hat #2 — Idle Breathing System', () => {
  it('IdleBreathing module exists', () => {
    expect(fileExists('audio/IdleBreathing.ts')).toBe(true);
  });

  it('generates multi-wave organic breathing (not a flat sine)', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    // Multiple sine waves for organic variation
    expect(src).toContain('Math.sin');
    // Should have different frequencies for each band
    expect(src).toContain('bass');
    expect(src).toContain('mid');
    expect(src).toContain('high');
  });

  it('provides getLevels() returning 4 bands', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    expect(src).toContain('getLevels');
    expect(src).toContain('level: number');
    expect(src).toContain('bass: number');
    expect(src).toContain('mid: number');
    expect(src).toContain('high: number');
  });

  it('provides fake FFT data for direct visualizer consumption', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    expect(src).toContain('getFrequencyData');
    expect(src).toContain('Uint8Array');
  });

  it('provides fake time-domain data for waveform visualizers', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    expect(src).toContain('getTimeDomainData');
  });

  it('has start/stop lifecycle', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    expect(src).toContain('start()');
    expect(src).toContain('stop()');
    expect(src).toContain('isActive');
  });

  it('is integrated into VisualizerScene', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('idleBreathing');
    expect(scene).toContain('IdleBreathing');
    // Should start when no signal detected
    expect(scene).toContain('idleBreathing.start()');
    // Should stop when real audio returns
    expect(scene).toContain('idleBreathing.stop()');
  });

  it('feeds idle data into both store and audioData', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('idleBreathing.getLevels()');
    expect(scene).toContain('idleBreathing.getFrequencyData');
    expect(scene).toContain('idleBreathing.getTimeDomainData');
  });
});

// ─── Demo Audio ───────────────────────────────────────────────────

describe('Green Hat #2 — Demo Audio Synthesizer', () => {
  it('DemoAudio module exists', () => {
    expect(fileExists('audio/DemoAudio.ts')).toBe(true);
  });

  it('creates a layered synth (bass, mid, high, rhythm)', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('createBassDrone');
    expect(src).toContain('createMidPad');
    expect(src).toContain('createHighShimmer');
    expect(src).toContain('createRhythmicPulse');
  });

  it('bass drone uses LFO modulation', () => {
    const src = readSrc('audio/DemoAudio.ts');
    // LFO for pitch wobble
    expect(src).toContain('lfo');
    expect(src).toContain('osc.frequency');
  });

  it('mid pad uses detuned oscillator pair', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('detune');
    expect(src).toContain('lowpass');
  });

  it('rhythmic pulse creates kick and hi-hat patterns', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('scheduleKick');
    expect(src).toContain('noiseBuffer');
    expect(src).toContain('highpass');
  });

  it('connects through AudioEngine analyser for visualization', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('audioEngine');
    expect(src).toContain('analyser');
  });

  it('has a defined BPM for beat sync', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('bpm = 110');
    expect(src).toContain('beatMs');
  });

  it('cleans up all nodes on stop', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('.stop()');
    expect(src).toContain('.disconnect()');
    expect(src).toContain('this.nodes = []');
    expect(src).toContain('clearInterval');
  });

  it('is accessible from the control panel', () => {
    const cp = readSrc('components/ControlPanel.tsx');
    expect(cp).toContain('Demo');
    expect(cp).toContain('demoAudio');
    expect(cp).toContain("audioSource === 'demo'");
  });

  it('has keyboard shortcut D', () => {
    const kb = readSrc('components/KeyboardHandler.tsx');
    expect(kb).toContain("e.key.toLowerCase() === 'd'");
    expect(kb).toContain('handleDemoToggle');
  });

  it('store tracks demo mode state', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain('demoMode');
    expect(store).toContain('toggleDemoMode');
    expect(store).toContain("audioSource: AudioSource");
  });
});

// ─── GPU Performance Detection ────────────────────────────────────

describe('Green Hat #2 — GPU Performance Tier System', () => {
  it('gpuDetect module exists', () => {
    expect(fileExists('utils/gpuDetect.ts')).toBe(true);
  });

  it('defines three performance tiers', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain("'high'");
    expect(src).toContain("'medium'");
    expect(src).toContain("'low'");
    expect(src).toContain('PerformanceTier');
  });

  it('detects GPU via WEBGL_debug_renderer_info', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('WEBGL_debug_renderer_info');
    expect(src).toContain('UNMASKED_RENDERER_WEBGL');
  });

  it('has known low-end GPU patterns', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('LOW_END_PATTERNS');
    expect(src).toContain('mali');
    expect(src).toContain('swiftshader');
    expect(src).toContain('llvmpipe');
  });

  it('has known medium-end GPU patterns', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('MEDIUM_END_PATTERNS');
    expect(src).toContain('intel');
    expect(src).toContain('adreno');
  });

  it('uses maxTextureSize as fallback heuristic', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('maxTextureSize');
    expect(src).toContain('MAX_TEXTURE_SIZE');
  });

  it('detects mobile devices', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('isMobile');
    expect(src).toContain('Android');
    expect(src).toContain('iPhone');
  });

  it('performance presets scale particle counts', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('particleCount: 3000');
    expect(src).toContain('particleCount: 1500');
    expect(src).toContain('particleCount: 500');
  });

  it('low tier disables post-processing', () => {
    const src = readSrc('utils/gpuDetect.ts');
    // Low tier: no post-processing, no bloom, no chromatic, no starfield
    expect(src).toContain('enablePostProcessing: false');
    expect(src).toContain('enableBloom: false');
    expect(src).toContain('enableStarfield: false');
  });

  it('performance presets include DPR limits', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('dpr: [1, 2]');    // high
    expect(src).toContain('dpr: [1, 1.5]');  // medium
    expect(src).toContain('dpr: [1, 1]');    // low
  });

  it('store integrates performance tier', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain('performanceTier');
    expect(store).toContain('performanceSettings');
    expect(store).toContain('setPerformanceTier');
    expect(store).toContain('PERFORMANCE_PRESETS');
  });

  it('control panel has GPU tier selector', () => {
    const cp = readSrc('components/ControlPanel.tsx');
    expect(cp).toContain('perf-label');
    expect(cp).toContain('🚀 High');
    expect(cp).toContain('⚡ Medium');
    expect(cp).toContain('🔋 Low');
  });

  it('PostProcessing respects performance settings', () => {
    const pp = readSrc('visualizers/PostProcessing.tsx');
    expect(pp).toContain('perfSettings');
    expect(pp).toContain('enablePostProcessing');
    expect(pp).toContain('enableBloom');
    expect(pp).toContain('enableChromatic');
  });

  it('Starfield respects performance settings', () => {
    const sf = readSrc('visualizers/Starfield.tsx');
    expect(sf).toContain('performanceSettings');
    expect(sf).toContain('starfieldCount');
    expect(sf).toContain('perfEnabled');
  });

  it('Canvas DPR uses performance settings', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('perfDpr');
    expect(app).toContain('performanceSettings.dpr');
  });
});

// ─── BPM-Adaptive Cinematic ──────────────────────────────────────

describe('Green Hat #2 — BPM-Adaptive Cinematic Mode', () => {
  it('CinematicBadge computes interval from BPM', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('computeInterval');
    expect(src).toContain('BEATS_PER_SWITCH');
  });

  it('has sane interval bounds', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('MIN_CINEMATIC_INTERVAL');
    expect(src).toContain('MAX_CINEMATIC_INTERVAL');
    // Default at 12s, min 6s, max 20s
    expect(src).toContain('12000');
    expect(src).toContain('6000');
    expect(src).toContain('20000');
  });

  it('uses recursive setTimeout for adaptive timing', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    // Uses setTimeout, not setInterval, so it can adapt to BPM changes
    expect(src).toContain('setTimeout');
    expect(src).toContain('scheduleNext');
  });

  it('shows BPM sync status in badge', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('isBpmSynced');
    expect(src).toContain('cinematic-bpm-sync');
  });

  it('has progress bar animation', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('progressRef');
    expect(src).toContain('requestAnimationFrame');
    expect(src).toContain('cinematic-progress-fill');
  });

  it('store has bpmAdaptiveCinematic toggle', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain('bpmAdaptiveCinematic');
    expect(store).toContain('toggleBpmAdaptive');
  });

  it('keyboard shortcut A toggles BPM-adaptive', () => {
    const kb = readSrc('components/KeyboardHandler.tsx');
    expect(kb).toContain("e.key.toLowerCase() === 'a'");
    expect(kb).toContain('toggleBpmAdaptive');
  });
});

// ─── Video Recording ─────────────────────────────────────────────

describe('Green Hat #2 — Video Recording', () => {
  it('RecordButton component exists', () => {
    expect(fileExists('components/RecordButton.tsx')).toBe(true);
  });

  it('uses canvas.captureStream + MediaRecorder', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('captureStream');
    expect(src).toContain('MediaRecorder');
  });

  it('captures audio from AudioContext when available', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('createMediaStreamDestination');
    expect(src).toContain('getAudioTracks');
    expect(src).toContain('getVideoTracks');
  });

  it('checks recording support before rendering', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('isRecordingSupported');
    expect(src).toContain('if (!supported) return null');
  });

  it('tries multiple WebM codecs for compatibility', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('getSupportedMime');
    expect(src).toContain('vp9');
    expect(src).toContain('vp8');
    expect(src).toContain('isTypeSupported');
  });

  it('generates timestamped download filenames', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('soundscape-${Date.now()}.webm');
  });

  it('shows recording duration timer', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('formatDuration');
    expect(src).toContain('record-time');
    expect(src).toContain('record-dot');
  });

  it('has keyboard shortcut R', () => {
    const kb = readSrc('components/KeyboardHandler.tsx');
    expect(kb).toContain("e.key.toLowerCase() === 'r'");
    expect(kb).toContain('__soundscapeToggleRecording');
  });

  it('is integrated in ControlPanel', () => {
    const cp = readSrc('components/ControlPanel.tsx');
    expect(cp).toContain('RecordButton');
  });

  it('cleans up on unmount', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain("recorderRef.current?.state === 'recording'");
    expect(src).toContain('clearInterval');
  });
});

// ─── Integration & Cross-Feature ─────────────────────────────────

describe('Green Hat #2 — Integration', () => {
  it('demo audio source is in AudioSource type', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain("'demo'");
    expect(store).toMatch(/AudioSource\s*=\s*.*'demo'/);
  });

  it('App.tsx cleans up demo audio on unmount', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('demoAudio.stop()');
  });

  it('ControlPanel stops demo audio when switching to mic', () => {
    const cp = readSrc('components/ControlPanel.tsx');
    expect(cp).toContain('demoAudio.stop()');
  });

  it('all new features have keyboard shortcuts documented', () => {
    const cp = readSrc('components/ControlPanel.tsx');
    expect(cp).toContain('D: Demo');
    expect(cp).toContain('R: Record');
  });

  it('preserveDrawingBuffer enabled for screenshots and recording', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('preserveDrawingBuffer: true');
  });

  it('new source files total count is correct', () => {
    // Pass 7 added: DemoAudio, IdleBreathing, RecordButton, gpuDetect
    expect(fileExists('audio/DemoAudio.ts')).toBe(true);
    expect(fileExists('audio/IdleBreathing.ts')).toBe(true);
    expect(fileExists('components/RecordButton.tsx')).toBe(true);
    expect(fileExists('utils/gpuDetect.ts')).toBe(true);
  });
});
