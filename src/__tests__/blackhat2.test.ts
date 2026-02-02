/**
 * Black Hat #2 Tests — Re-Audit (Pass 8)
 *
 * Deep re-audit of all code added in passes 3-7.
 * Validates: code quality fixes, edge cases, accessibility completeness,
 * resource cleanup, performance guards, and integration correctness.
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

// ─── 1. Rules of Hooks Compliance ──────────────────────────────────

describe('Black Hat #2 — Rules of Hooks', () => {
  it('PostProcessing: useMemo called before conditional returns', () => {
    const src = readSrc('visualizers/PostProcessing.tsx');
    const useMemoIdx = src.indexOf('useMemo');
    const firstReturnNull = src.indexOf('return null');
    // useMemo must appear BEFORE the first conditional return null
    expect(useMemoIdx).toBeLessThan(firstReturnNull);
  });

  it('PostProcessing: EffectComposer children are always Elements (no boolean)', () => {
    const src = readSrc('visualizers/PostProcessing.tsx');
    // Should not use && pattern inside EffectComposer which produces false | Element
    expect(src).not.toMatch(/enableBloom\s*&&/);
  });
});

// ─── 2. TypeScript Strictness ──────────────────────────────────────

describe('Black Hat #2 — TypeScript Strictness', () => {
  it('window casts use double-cast pattern (window as unknown as Record)', () => {
    const kb = readSrc('components/KeyboardHandler.tsx');
    const rb = readSrc('components/RecordButton.tsx');
    // The unsafe `window as Record<string, unknown>` pattern should be gone
    // Only `window as unknown as Record<string, unknown>` should exist
    const kbCasts = kb.match(/window as (?:unknown as )?Record/g) || [];
    for (const cast of kbCasts) {
      expect(cast).toContain('unknown as');
    }
    const rbCasts = rb.match(/window as (?:unknown as )?Record/g) || [];
    for (const cast of rbCasts) {
      expect(cast).toContain('unknown as');
    }
  });
});

// ─── 3. TouchHandler Mode Coverage ─────────────────────────────────

describe('Black Hat #2 — Touch Handler Completeness', () => {
  it('TouchHandler includes ALL 7 visualization modes', () => {
    const src = readSrc('components/TouchHandler.tsx');
    const allModes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
    for (const mode of allModes) {
      expect(src).toContain(`'${mode}'`);
    }
  });

  it('TouchHandler modes array length matches VisualizationMode union', () => {
    const src = readSrc('components/TouchHandler.tsx');
    // Extract the modes array definition
    const match = src.match(/const modes.*?=\s*\[(.*?)\]/s);
    expect(match).toBeTruthy();
    const items = match![1].split(',').filter(s => s.trim().length > 0);
    expect(items.length).toBe(7);
  });
});

// ─── 4. A11y Announcer Completeness ────────────────────────────────

describe('Black Hat #2 — Accessibility Completeness', () => {
  it('A11yAnnouncer has names for ALL 7 modes', () => {
    const src = readSrc('components/A11yAnnouncer.tsx');
    const allModes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
    for (const mode of allModes) {
      expect(src).toContain(`${mode}:`);
    }
  });

  it('A11yAnnouncer has names for ALL 6 themes', () => {
    const src = readSrc('components/A11yAnnouncer.tsx');
    const allThemes = ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest'];
    for (const theme of allThemes) {
      expect(src).toContain(`${theme}:`);
    }
  });

  it('HelpOverlay documents ALL keyboard shortcuts including D and R', () => {
    const src = readSrc('components/HelpOverlay.tsx');
    const requiredShortcuts = [
      "'1-7'", "'T'", "'C'", "'S'", "'O'", "'B'", "'W'", "'P'",
      "'Space'", "'G'", "'A'", "'D'", "'R'", "'F'", "'Shift+F'",
      "'H / ?'", "'Esc'", "'←/→'",
    ];
    for (const key of requiredShortcuts) {
      expect(src).toContain(key);
    }
  });

  it('RecordButton has ARIA labels for both recording states', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('aria-label');
    expect(src).toContain('Stop recording');
    expect(src).toContain('Start recording');
  });

  it('BpmDisplay has ARIA role=status and aria-label', () => {
    const src = readSrc('components/BpmDisplay.tsx');
    expect(src).toContain('role="status"');
    expect(src).toContain('aria-label');
  });

  it('CinematicBadge has ARIA role=status', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('role="status"');
  });

  it('FpsCounter has ARIA role=status', () => {
    const src = readSrc('components/FpsCounter.tsx');
    expect(src).toContain('role="status"');
  });

  it('MoodText is hidden from screen readers (decorative)', () => {
    const src = readSrc('components/MoodText.tsx');
    expect(src).toContain('aria-hidden="true"');
  });

  it('EntranceOverlay is hidden from screen readers (decorative)', () => {
    const src = readSrc('components/EntranceOverlay.tsx');
    expect(src).toContain('aria-hidden="true"');
  });
});

// ─── 5. Resource Cleanup ───────────────────────────────────────────

describe('Black Hat #2 — Resource Cleanup', () => {
  it('DemoAudio tracks transient nodes (kick/hi-hat) for cleanup', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('transientNodes');
    // Should add and remove from the set
    expect(src).toContain('.add(kickOsc)');
    expect(src).toContain('.delete(kickOsc)');
  });

  it('DemoAudio stop() cleans up transient nodes', () => {
    const src = readSrc('audio/DemoAudio.ts');
    // stop() should clear the transient nodes set
    expect(src).toContain('transientNodes.clear()');
  });

  it('RecordButton disconnects audio routing nodes on stop', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('audioNodesRef');
    expect(src).toContain('gain.disconnect');
    expect(src).toContain('dest.disconnect');
  });

  it('RecordButton cleans up on unmount', () => {
    const src = readSrc('components/RecordButton.tsx');
    // Should stop recorder and clear interval on unmount
    expect(src).toContain("recorderRef.current?.state === 'recording'");
    expect(src).toContain('clearInterval');
  });

  it('AudioReactiveUI has no dead rAF code', () => {
    const src = readSrc('components/AudioReactiveUI.tsx');
    // Should NOT reference requestAnimationFrame or cancelAnimationFrame
    expect(src).not.toContain('requestAnimationFrame');
    expect(src).not.toContain('cancelAnimationFrame');
    // Should NOT have rafRef
    expect(src).not.toContain('rafRef');
  });

  it('Every visualizer shader material has dispose() in cleanup', () => {
    const visualizers = [
      'visualizers/WaveformRibbon.tsx',
      'visualizers/ParticleField.tsx',
      'visualizers/AudioFlame.tsx',
      'visualizers/SpectrumWaterfall.tsx',
      'visualizers/Starfield.tsx',
    ];
    for (const v of visualizers) {
      const src = readSrc(v);
      expect(src).toContain('material.dispose()');
    }
  });

  it('Kaleidoscope disposes all geometries and materials', () => {
    const src = readSrc('visualizers/Kaleidoscope.tsx');
    expect(src).toContain('geo.dispose()');
    expect(src).toContain('mat.dispose()');
  });

  it('Tunnel disposes ring geometry and materials', () => {
    const src = readSrc('visualizers/Tunnel.tsx');
    expect(src).toContain('ringGeo.dispose()');
    expect(src).toContain('mat.dispose()');
  });

  it('BeatShockwave disposes torus geometry and materials', () => {
    const src = readSrc('components/BeatShockwave.tsx');
    expect(src).toContain('torusGeo.dispose()');
    expect(src).toContain('.dispose()');
  });

  it('AudioOrbitRing disposes geometries and materials', () => {
    const src = readSrc('visualizers/AudioOrbitRing.tsx');
    expect(src).toContain('outerGeometry.dispose()');
    expect(src).toContain('innerGeometry.dispose()');
    expect(src).toContain('outerMaterial.dispose()');
    expect(src).toContain('innerMaterial.dispose()');
  });

  it('AudioEngine revokes blob URLs on disconnect', () => {
    const src = readSrc('audio/AudioEngine.ts');
    expect(src).toContain('URL.revokeObjectURL');
    // Should revoke in both disconnect() and connectFile()
    const revokeCount = (src.match(/revokeObjectURL/g) || []).length;
    expect(revokeCount).toBeGreaterThanOrEqual(2);
  });
});

// ─── 6. Keyboard-Recording Integration ─────────────────────────────

describe('Black Hat #2 — Keyboard-Recording Bridge', () => {
  it('KeyboardHandler reads __soundscapeToggleRecording from window', () => {
    const src = readSrc('components/KeyboardHandler.tsx');
    expect(src).toContain('__soundscapeToggleRecording');
  });

  it('RecordButton exposes __soundscapeToggleRecording on window', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain('__soundscapeToggleRecording');
    // Should expose AND clean up
    const references = (src.match(/__soundscapeToggleRecording/g) || []).length;
    expect(references).toBeGreaterThanOrEqual(2); // set + delete
  });

  it('KeyboardHandler and RecordButton use same bridge name', () => {
    const kb = readSrc('components/KeyboardHandler.tsx');
    const rb = readSrc('components/RecordButton.tsx');
    // Both must reference the exact same global name
    const kbMatch = kb.match(/__\w+Recording/)?.[0];
    const rbMatch = rb.match(/__\w+Recording/)?.[0];
    expect(kbMatch).toBe(rbMatch);
  });
});

// ─── 7. Edge Cases — Browser Support ───────────────────────────────

describe('Black Hat #2 — Edge Cases', () => {
  it('RecordButton gracefully handles missing MediaRecorder', () => {
    const src = readSrc('components/RecordButton.tsx');
    expect(src).toContain("typeof MediaRecorder === 'undefined'");
    expect(src).toContain('if (!supported) return null');
  });

  it('RecordButton catches captureStream failures', () => {
    const src = readSrc('components/RecordButton.tsx');
    // The entire startRecording is wrapped in try/catch
    expect(src).toContain('catch (err)');
    expect(src).toContain('Recording failed');
  });

  it('AudioEngine handles mic permission denial', () => {
    const src = readSrc('audio/AudioEngine.ts');
    expect(src).toContain('catch (e)');
    expect(src).toContain('Mic access denied');
    expect(src).toContain('throw e');
  });

  it('AudioEngine handles corrupt audio files', () => {
    const src = readSrc('audio/AudioEngine.ts');
    expect(src).toContain('error');
    expect(src).toContain('corrupted or in an unsupported format');
  });

  it('gpuDetect handles missing WebGL', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain("tier: 'low'");
    expect(src).toContain('No WebGL support');
  });

  it('gpuDetect cleans up detection canvas', () => {
    const src = readSrc('utils/gpuDetect.ts');
    expect(src).toContain('WEBGL_lose_context');
    expect(src).toContain('loseContext()');
  });

  it('BPMDetector handles insufficient beats gracefully', () => {
    const src = readSrc('audio/BPMDetector.ts');
    // Should require minimum beats before returning BPM
    expect(src).toContain('beatTimes.length >= 4');
    expect(src).toContain('return 0');
  });

  it('IdleBreathing handles start/stop lifecycle correctly', () => {
    const src = readSrc('audio/IdleBreathing.ts');
    // Double-start should be safe
    expect(src).toContain('if (this.active) return');
    // getLevels when inactive should return zeros
    expect(src).toContain('if (!this.active)');
    expect(src).toContain('level: 0, bass: 0, mid: 0, high: 0');
  });

  it('DemoAudio double-start is safe', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('if (this.active) return');
  });

  it('VisualizerScene no-signal detection has proper threshold', () => {
    const src = readSrc('visualizers/VisualizerScene.tsx');
    expect(src).toContain('NO_SIGNAL_THRESHOLD');
    expect(src).toContain('180'); // ~3 seconds at 60fps
  });

  it('PostProcessing handles all 3 performance tiers', () => {
    const src = readSrc('visualizers/PostProcessing.tsx');
    // Checks enablePostProcessing (low tier), enableChromatic (medium tier), enableBloom
    expect(src).toContain('enablePostProcessing');
    expect(src).toContain('enableChromatic');
    expect(src).toContain('enableBloom');
  });

  it('Starfield respects perfEnabled flag', () => {
    const src = readSrc('visualizers/Starfield.tsx');
    expect(src).toContain('perfEnabled');
    expect(src).toContain('if (!visible) return null');
  });
});

// ─── 8. Behavioral Tests — IdleBreathing ───────────────────────────

describe('Black Hat #2 — IdleBreathing Behavioral', () => {
  it('IdleBreathing produces values in expected range', async () => {
    // Dynamic import to get the actual module
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();

    // Before start: all zeros
    const beforeLevels = ib.getLevels();
    expect(beforeLevels.level).toBe(0);
    expect(beforeLevels.bass).toBe(0);

    // Start breathing
    ib.start();

    // After start: values should be small but non-zero
    const levels = ib.getLevels();
    expect(levels.bass).toBeGreaterThan(0);
    expect(levels.bass).toBeLessThan(0.2);
    expect(levels.mid).toBeGreaterThan(0);
    expect(levels.high).toBeGreaterThan(0);
    expect(levels.level).toBeGreaterThan(0);

    // Stop
    ib.stop();
    const afterLevels = ib.getLevels();
    expect(afterLevels.level).toBe(0);
  });

  it('IdleBreathing fills frequency buffer with gentle values', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();
    ib.start();

    const buffer = new Uint8Array(1024);
    ib.getFrequencyData(buffer);

    // Should have non-zero values (gentle breathing)
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i];
    expect(sum).toBeGreaterThan(0);
    // But values should be modest (not full-scale)
    const avg = sum / buffer.length;
    expect(avg).toBeLessThan(50); // gentle, not loud
    expect(avg).toBeGreaterThan(0);

    ib.stop();
  });

  it('IdleBreathing does not modify buffer when inactive', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();

    const buffer = new Uint8Array(64);
    buffer.fill(99);
    ib.getFrequencyData(buffer);

    // Buffer should be unchanged
    for (let i = 0; i < buffer.length; i++) {
      expect(buffer[i]).toBe(99);
    }
  });

  it('IdleBreathing double-start is safe', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();
    ib.start();
    ib.start(); // Should not throw
    expect(ib.isActive).toBe(true);
    ib.stop();
  });

  it('IdleBreathing stop-without-start is safe', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();
    ib.stop(); // Should not throw
    expect(ib.isActive).toBe(false);
  });
});

// ─── 9. Behavioral Tests — SmoothAudio ─────────────────────────────

describe('Black Hat #2 — SmoothAudio Behavioral', () => {
  it('SmoothAudio handles empty/zero input', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    smoothAudio.reset();

    const zeroInput = new Uint8Array(128);
    const result = smoothAudio.update(zeroInput);
    expect(result.rms).toBe(0);
    expect(result.flux).toBe(0);
    expect(result.transient).toBe(0);
    expect(result.level).toBe(0);
  });

  it('SmoothAudio detects transients on sudden input', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    smoothAudio.reset();

    // Feed silence first
    const silence = new Uint8Array(128);
    smoothAudio.update(silence);
    smoothAudio.update(silence);

    // Then a sudden loud signal
    const loud = new Uint8Array(128);
    loud.fill(255);
    const result = smoothAudio.update(loud);

    // Should detect some transient energy
    expect(result.transient).toBeGreaterThan(0);
  });

  it('SmoothAudio reset clears all state', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    const loud = new Uint8Array(128);
    loud.fill(255);
    smoothAudio.update(loud);

    smoothAudio.reset();

    // After reset, everything should be zero
    const result = smoothAudio.update(new Uint8Array(128));
    expect(result.level).toBe(0);
  });
});

// ─── 10. Behavioral Tests — AutoGain ───────────────────────────────

describe('Black Hat #2 — AutoGain Behavioral', () => {
  it('AutoGain returns 1.0 when disabled', async () => {
    const { autoGain } = await import('../audio/AutoGain');
    autoGain.setEnabled(false);
    expect(autoGain.update(0.5)).toBe(1.0);
    autoGain.setEnabled(true);
    autoGain.reset();
  });

  it('AutoGain holds gain during silence', async () => {
    const { autoGain } = await import('../audio/AutoGain');
    autoGain.reset();
    // Feed some non-zero level to establish gain
    for (let i = 0; i < 200; i++) autoGain.update(0.2);
    const gainBefore = autoGain.getGain();
    // Now feed silence
    const gainAfter = autoGain.update(0.0);
    // Should hold close to previous value (not go to infinity)
    expect(gainAfter).toBeCloseTo(gainBefore, 1);
    // Should definitely not be Infinity or NaN
    expect(isFinite(gainAfter)).toBe(true);
    autoGain.reset();
  });

  it('AutoGain clamps to safe range', async () => {
    const { autoGain } = await import('../audio/AutoGain');
    autoGain.reset();
    // Feed very quiet audio
    for (let i = 0; i < 300; i++) autoGain.update(0.01);
    const gain = autoGain.getGain();
    expect(gain).toBeLessThanOrEqual(4.0);
    expect(gain).toBeGreaterThanOrEqual(0.5);
    autoGain.reset();
  });
});

// ─── 11. Behavioral Tests — BPMDetector ────────────────────────────

describe('Black Hat #2 — BPMDetector Edge Cases', () => {
  it('BPMDetector returns 0 with too few beats', async () => {
    const { BPMDetector } = await import('../audio/BPMDetector');
    const det = new BPMDetector();
    // Single strong beat — not enough for BPM
    const bpm = det.detect(0.8, 1000);
    expect(bpm).toBe(0);
  });

  it('BPMDetector clamps to 30-240 range', async () => {
    const { BPMDetector } = await import('../audio/BPMDetector');
    const det = new BPMDetector();
    // Simulate beats at 120 BPM (500ms intervals)
    let bpm = 0;
    for (let i = 0; i < 10; i++) {
      bpm = det.detect(0.8, i * 500);
      det.detect(0.0, i * 500 + 250); // low between beats
    }
    if (bpm > 0) {
      expect(bpm).toBeGreaterThanOrEqual(30);
      expect(bpm).toBeLessThanOrEqual(240);
    }
  });

  it('BPMDetector reset clears state', async () => {
    const { BPMDetector } = await import('../audio/BPMDetector');
    const det = new BPMDetector();
    det.detect(0.8, 1000);
    det.detect(0.8, 1500);
    det.reset();
    // After reset, should need to rebuild beat history
    expect(det.detect(0.0, 2000)).toBe(0);
  });
});

// ─── 12. Store Integration ─────────────────────────────────────────

describe('Black Hat #2 — Store Integration', () => {
  it('store has all audio source types', async () => {
    const src = readSrc('store/useStore.ts');
    expect(src).toContain("'mic'");
    expect(src).toContain("'file'");
    expect(src).toContain("'demo'");
  });

  it('store toggleDemoMode clears activePreset', () => {
    const src = readSrc('store/useStore.ts');
    // The toggleDemoMode should include activePreset: null
    expect(src).toContain('toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode, activePreset: null }))');
  });

  it('store setPerformanceTier updates both tier and settings', () => {
    const src = readSrc('store/useStore.ts');
    expect(src).toContain('performanceTier: tier');
    expect(src).toContain('PERFORMANCE_PRESETS[tier]');
  });

  it('store applyPreset is atomic (single set call)', () => {
    const src = readSrc('store/useStore.ts');
    // Find the implementation (the second occurrence, after the interface)
    const implStart = src.indexOf('applyPreset: (preset) =>');
    expect(implStart).toBeGreaterThan(0);
    const presetFn = src.slice(implStart, src.indexOf('setPerformanceTier:', implStart));
    // Should use set({ ... }) with multiple properties in one call
    expect(presetFn).toContain('set(');
    expect(presetFn).toContain('activePreset: preset.id');
    // All state changes should be in a single set() call — count opening braces after set(
    const setMatches = presetFn.match(/\bset\(/g) || [];
    expect(setMatches.length).toBe(1);
  });
});

// ─── 13. Performance Guards ────────────────────────────────────────

describe('Black Hat #2 — Performance Guards', () => {
  it('VisualizerScene uses batch audio update (single set per frame)', () => {
    const src = readSrc('visualizers/VisualizerScene.tsx');
    expect(src).toContain('setAudioLevels');
    // Should NOT call individual setters in the hot path
    expect(src).not.toContain('setAudioLevel(');
    expect(src).not.toContain('setBassLevel(');
    expect(src).not.toContain('setMidLevel(');
    expect(src).not.toContain('setHighLevel(');
  });

  it('FrequencyBars reuses color buffer attribute (no per-frame allocation)', () => {
    const src = readSrc('visualizers/FrequencyBars.tsx');
    expect(src).toContain('colorAttrRef');
    expect(src).toContain('needsUpdate = true');
    // The InstancedBufferAttribute is created ONCE in useEffect, not in useFrame
    // Verify it's in a setup effect, not in the render loop
    const useFrameBlock = src.slice(src.indexOf('useFrame('));
    expect(useFrameBlock).not.toContain('new THREE.InstancedBufferAttribute');
  });

  it('SpectrumWaterfall uses ring buffer (not shift/push)', () => {
    const src = readSrc('visualizers/SpectrumWaterfall.tsx');
    expect(src).toContain('writeIdx');
    expect(src).toContain('ring buffer');
    // Should throttle updates
    expect(src).toContain('frameCount');
    expect(src).toContain('% 2');
  });

  it('Starfield uses pre-allocated buffers', () => {
    const src = readSrc('visualizers/Starfield.tsx');
    expect(src).toContain('Float32Array');
    expect(src).toContain('basePositions');
    expect(src).toContain('phases');
  });

  it('AudioOrbitRing uses pre-allocated position buffers', () => {
    const src = readSrc('visualizers/AudioOrbitRing.tsx');
    expect(src).toContain('outerPositions');
    expect(src).toContain('innerPositions');
    expect(src).toContain('Float32Array');
  });

  it('BeatCameraPulse reads store outside React subscription (useFrame pattern)', () => {
    const src = readSrc('components/BeatCameraPulse.tsx');
    expect(src).toContain('useStore.getState()');
  });

  it('MiniSpectrum uses canvas 2D (not DOM elements for bars)', () => {
    const src = readSrc('components/MiniSpectrum.tsx');
    expect(src).toContain('canvasRef');
    expect(src).toContain('getContext');
    expect(src).toContain('fillRect');
  });

  it('BeatFlash uses ref-based animation (not setState in rAF)', () => {
    const src = readSrc('components/BeatFlash.tsx');
    expect(src).toContain('flashRef');
    expect(src).toContain('divRef');
    expect(src).toContain('.style.opacity');
  });
});

// ─── 14. URL State Round-Trip ──────────────────────────────────────

describe('Black Hat #2 — URL State Integrity', () => {
  it('URL state encodes all 7 modes', () => {
    const src = readSrc('utils/urlState.ts');
    const allModes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
    for (const mode of allModes) {
      expect(src).toContain(`'${mode}'`);
    }
  });

  it('URL state encodes all 6 themes', () => {
    const src = readSrc('utils/urlState.ts');
    const allThemes = ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest'];
    for (const theme of allThemes) {
      expect(src).toContain(`'${theme}'`);
    }
  });

  it('URL state validates sensitivity range', () => {
    const src = readSrc('utils/urlState.ts');
    expect(src).toContain('0.1');
    expect(src).toContain('3.0');
  });
});

// ─── 15. Color Theme Consistency ───────────────────────────────────

describe('Black Hat #2 — Theme Consistency', () => {
  it('every theme has exactly 4 colors in the colors array', async () => {
    const { themeMap } = await import('../themes/colorThemes');
    for (const [name, theme] of Object.entries(themeMap)) {
      expect(theme.colors.length).toBe(4);
      for (const color of theme.colors) {
        expect(color.length).toBe(3);
        for (const channel of color) {
          expect(channel).toBeGreaterThanOrEqual(0);
          expect(channel).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('every theme has valid hex colors for CSS properties', async () => {
    const { themeMap } = await import('../themes/colorThemes');
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    for (const theme of Object.values(themeMap)) {
      expect(theme.primary).toMatch(hexRegex);
      expect(theme.secondary).toMatch(hexRegex);
      expect(theme.tertiary).toMatch(hexRegex);
      expect(theme.accent).toMatch(hexRegex);
      expect(theme.background).toMatch(hexRegex);
    }
  });
});

// ─── 16. Cinematic Mode ────────────────────────────────────────────

describe('Black Hat #2 — Cinematic Mode', () => {
  it('CinematicBadge has all 7 mode descriptions', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    const allModes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
    for (const mode of allModes) {
      expect(src).toContain(`${mode}:`);
    }
  });

  it('CinematicBadge BPM interval has sane bounds', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('MIN_CINEMATIC_INTERVAL');
    expect(src).toContain('MAX_CINEMATIC_INTERVAL');
    expect(src).toContain('6000');
    expect(src).toContain('20000');
  });

  it('CinematicBadge cleans up timers on unmount', () => {
    const src = readSrc('components/CinematicBadge.tsx');
    expect(src).toContain('clearTimeout(timerRef.current)');
    expect(src).toContain('cancelAnimationFrame(rafRef.current)');
  });
});

// ─── 17. Reduced Motion ────────────────────────────────────────────

describe('Black Hat #2 — Reduced Motion Compliance', () => {
  it('App detects prefers-reduced-motion', () => {
    const src = readSrc('App.tsx');
    expect(src).toContain('prefers-reduced-motion');
    expect(src).toContain('reduced-motion');
  });

  it('VisualizerScene accepts reducedMotion prop', () => {
    const src = readSrc('visualizers/VisualizerScene.tsx');
    expect(src).toContain('reducedMotion');
  });

  it('PostProcessing accepts reducedMotion prop', () => {
    const src = readSrc('visualizers/PostProcessing.tsx');
    expect(src).toContain('reducedMotion');
  });

  it('BeatFlash is hidden in reduced motion', () => {
    const src = readSrc('App.tsx');
    expect(src).toContain('!prefersReducedMotion && <BeatFlash');
  });

  it('OrbitControls auto-rotate disabled in reduced motion', () => {
    const src = readSrc('visualizers/VisualizerScene.tsx');
    expect(src).toContain('autoRotate={!reducedMotion}');
  });
});

// ─── 18. File Structure Integrity ──────────────────────────────────

describe('Black Hat #2 — File Structure', () => {
  const sourceFiles = [
    'App.tsx', 'main.tsx',
    'audio/AudioEngine.ts', 'audio/BPMDetector.ts', 'audio/SmoothAudio.ts',
    'audio/AutoGain.ts', 'audio/IdleBreathing.ts', 'audio/DemoAudio.ts',
    'audio/audioData.ts',
    'store/useStore.ts',
    'themes/colorThemes.ts',
    'utils/gpuDetect.ts', 'utils/urlState.ts',
    'visualizers/VisualizerScene.tsx', 'visualizers/WaveformRibbon.tsx',
    'visualizers/FrequencyBars.tsx', 'visualizers/ParticleField.tsx',
    'visualizers/Kaleidoscope.tsx', 'visualizers/Tunnel.tsx',
    'visualizers/SpectrumWaterfall.tsx', 'visualizers/AudioFlame.tsx',
    'visualizers/AudioOrbitRing.tsx', 'visualizers/Starfield.tsx',
    'visualizers/PostProcessing.tsx',
    'components/ControlPanel.tsx', 'components/LandingScreen.tsx',
    'components/KeyboardHandler.tsx', 'components/TouchHandler.tsx',
    'components/AudioTransport.tsx', 'components/BeatFlash.tsx',
    'components/BeatShockwave.tsx', 'components/BeatCameraPulse.tsx',
    'components/BpmDisplay.tsx', 'components/FpsCounter.tsx',
    'components/FullscreenBtn.tsx', 'components/HelpOverlay.tsx',
    'components/ErrorBoundary.tsx', 'components/A11yAnnouncer.tsx',
    'components/MiniSpectrum.tsx', 'components/ShareButton.tsx',
    'components/RecordButton.tsx', 'components/ControlPanel.tsx',
    'components/MoodText.tsx', 'components/EntranceOverlay.tsx',
    'components/AudioReactiveUI.tsx', 'components/CinematicBadge.tsx',
  ];

  it('all expected source files exist', () => {
    for (const file of sourceFiles) {
      expect(fileExists(file)).toBe(true);
    }
  });

  it('no source file exceeds 500 LOC (maintainability guard)', () => {
    for (const file of sourceFiles) {
      const content = readSrc(file);
      const lines = content.split('\n').length;
      // ControlPanel is the largest at ~423 LOC — allow up to 500
      expect(lines).toBeLessThanOrEqual(500);
    }
  });
});

// ─── 19. Pass 8 Re-Audit Fixes ────────────────────────────────────

describe('Black Hat #2 — Pass 8 Re-Audit Fixes', () => {
  it('DemoAudio.stop() disconnects analyser from destination (prevents mic feedback)', () => {
    const src = readSrc('audio/DemoAudio.ts');
    // stop() must disconnect analyser from destination to prevent
    // mic → analyser → speakers feedback when switching from demo to mic
    expect(src).toContain('analyser.disconnect(this.ctx.destination)');
  });

  it('DemoAudio.stop() nulls ctx reference to prevent stale usage', () => {
    const src = readSrc('audio/DemoAudio.ts');
    // After stop(), ctx should be nulled to prevent stale reference
    expect(src).toContain('this.ctx = null');
  });

  it('HelpOverlay has no duplicate keyboard shortcuts', () => {
    const src = readSrc('components/HelpOverlay.tsx');
    // Extract all { key: '...', action: '...' } entries
    const keyMatches = src.match(/key:\s*'([^']+)'/g) || [];
    const keys = keyMatches.map(m => m.match(/'([^']+)'/)?.[1]);
    // Check for duplicates
    const seen = new Set<string>();
    for (const key of keys) {
      if (key === undefined) continue;
      // Mouse drag and Scroll are informational, skip
      if (key === 'Mouse drag' || key === 'Scroll') continue;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('DemoAudio.start() connects analyser to destination for audible output', () => {
    const src = readSrc('audio/DemoAudio.ts');
    expect(src).toContain('analyser.connect(this.ctx.destination)');
  });

  it('DemoAudio double-stop is safe (no errors on second stop)', () => {
    const src = readSrc('audio/DemoAudio.ts');
    // stop() checks this.active first — double-stop is safe
    const stopMethod = src.slice(src.indexOf('stop(): void'));
    expect(stopMethod).toContain('if (!this.active) return');
  });
});

// ─── 20. Behavioral: IdleBreathing time-domain data ────────────────

describe('Black Hat #2 — IdleBreathing TimeDomain Behavioral', () => {
  it('IdleBreathing time-domain data centers around 128', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();
    ib.start();

    const buffer = new Uint8Array(256);
    ib.getTimeDomainData(buffer);

    // Time-domain data should oscillate around 128 (silence center)
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i];
    const avg = sum / buffer.length;
    expect(avg).toBeGreaterThan(120);
    expect(avg).toBeLessThan(136);

    // Should have some variation (not all 128)
    let minVal = 255, maxVal = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] < minVal) minVal = buffer[i];
      if (buffer[i] > maxVal) maxVal = buffer[i];
    }
    expect(maxVal - minVal).toBeGreaterThan(2);

    ib.stop();
  });

  it('IdleBreathing does not modify time-domain buffer when inactive', async () => {
    const { IdleBreathing } = await import('../audio/IdleBreathing');
    const ib = new IdleBreathing();

    const buffer = new Uint8Array(64);
    buffer.fill(42);
    ib.getTimeDomainData(buffer);

    // Buffer should be unchanged
    for (let i = 0; i < buffer.length; i++) {
      expect(buffer[i]).toBe(42);
    }
  });
});

// ─── 21. Behavioral: SmoothAudio sensitivity edge cases ────────────

describe('Black Hat #2 — SmoothAudio Sensitivity Edge Cases', () => {
  it('SmoothAudio handles very high sensitivity without NaN/Infinity', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    smoothAudio.reset();

    const input = new Uint8Array(128);
    input.fill(200);
    const result = smoothAudio.update(input, 10.0); // extreme sensitivity

    expect(isFinite(result.rms)).toBe(true);
    expect(isFinite(result.flux)).toBe(true);
    expect(isFinite(result.level)).toBe(true);
    expect(isNaN(result.rms)).toBe(false);

    smoothAudio.reset();
  });

  it('SmoothAudio handles zero sensitivity', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    smoothAudio.reset();

    const input = new Uint8Array(128);
    input.fill(200);
    const result = smoothAudio.update(input, 0);

    expect(result.rms).toBe(0);
    expect(result.level).toBe(0);
    expect(isFinite(result.flux)).toBe(true);

    smoothAudio.reset();
  });

  it('SmoothAudio flux stays in 0-1 range', async () => {
    const { smoothAudio } = await import('../audio/SmoothAudio');
    smoothAudio.reset();

    // Silence then loud — max flux scenario
    smoothAudio.update(new Uint8Array(128), 1.0);
    const loud = new Uint8Array(128);
    loud.fill(255);
    const result = smoothAudio.update(loud, 1.0);

    expect(result.flux).toBeGreaterThanOrEqual(0);
    expect(result.flux).toBeLessThanOrEqual(1);

    smoothAudio.reset();
  });
});
