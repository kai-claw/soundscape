/**
 * Black Hat Pass 2/10 — Risks & Problems
 *
 * Tests focused on:
 * - Error boundaries & recovery
 * - Accessibility (ARIA, keyboard, screen reader)
 * - Performance (per-frame allocations, memory leaks)
 * - Edge cases (empty data, boundary values, invalid input)
 * - Touch handling
 * - Reduced motion support
 * - WebGL context loss
 * - Audio error handling
 * - No-signal detection
 * - Browser compatibility checks
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..');

function readSrc(relPath: string): string {
  return readFileSync(join(SRC, relPath), 'utf-8');
}

function srcExists(relPath: string): boolean {
  return existsSync(join(SRC, relPath));
}

// ========== Error Handling & Recovery ==========
describe('Black Hat: Error Handling', () => {
  it('should have an ErrorBoundary component', () => {
    expect(srcExists('components/ErrorBoundary.tsx')).toBe(true);
    const src = readSrc('components/ErrorBoundary.tsx');
    expect(src).toContain('getDerivedStateFromError');
    expect(src).toContain('componentDidCatch');
    expect(src).toContain('handleRetry');
    expect(src).toContain('handleReload');
  });

  it('ErrorBoundary should wrap the app', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('ErrorBoundary');
    expect(app).toContain('<ErrorBoundary>');
  });

  it('ErrorBoundary should show recovery UI with retry + reload', () => {
    const src = readSrc('components/ErrorBoundary.tsx');
    expect(src).toContain('Try Again');
    expect(src).toContain('Reload Page');
    expect(src).toContain('role="alert"');
  });

  it('ErrorBoundary should detect WebGL-specific errors', () => {
    const src = readSrc('components/ErrorBoundary.tsx');
    expect(src).toContain("includes('webgl')");
    expect(src).toContain("includes('context')");
    expect(src).toContain("includes('gpu')");
    expect(src).toContain('Graphics Error');
  });

  it('should handle WebGL context loss events on canvas', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('webglcontextlost');
    expect(app).toContain('webglcontextrestored');
    expect(app).toContain('e.preventDefault()');
  });

  it('should show context loss notification banner', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('webglLost');
    expect(app).toContain('context-lost-banner');
    expect(app).toContain('Graphics context lost');
  });

  it('should handle audio file errors', () => {
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('onFileError');
    expect(engine).toContain("'error'");
    // Should have specific error messages for each error code
    expect(engine).toContain('Playback was aborted');
    expect(engine).toContain('network error');
    expect(engine).toContain('decode');
    expect(engine).toContain('not supported');
  });

  it('should show file error banner with auto-dismiss', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('fileError');
    expect(app).toContain('file-error-banner');
    expect(app).toContain('6000'); // auto-dismiss timeout
  });

  it('should check browser support before starting', () => {
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('checkSupport');
    expect(engine).toContain('webgl');
    expect(engine).toContain('audio');
    const app = readSrc('App.tsx');
    expect(app).toContain('unsupported');
    expect(app).toContain('Browser Not Supported');
  });

  it('should handle mic disconnection (Bluetooth etc.)', () => {
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('onMicDisconnect');
    expect(engine).toContain("'ended'");
    expect(engine).toContain('device disconnected');
  });

  it('should revoke blob URLs to prevent memory leaks', () => {
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('URL.revokeObjectURL');
    expect(engine).toContain('objectUrl');
  });
});

// ========== Accessibility ==========
describe('Black Hat: Accessibility', () => {
  it('should have ARIA live announcer for mode/theme changes', () => {
    expect(srcExists('components/A11yAnnouncer.tsx')).toBe(true);
    const src = readSrc('components/A11yAnnouncer.tsx');
    expect(src).toContain('aria-live="assertive"');
    expect(src).toContain('aria-atomic="true"');
    expect(src).toContain('role="status"');
    expect(src).toContain('Visualization mode:');
    expect(src).toContain('Color theme:');
  });

  it('A11yAnnouncer should skip initial mount announcement', () => {
    const src = readSrc('components/A11yAnnouncer.tsx');
    expect(src).toContain('initialRef');
    expect(src).toContain('initialRef.current = false');
  });

  it('should have skip-to-content link', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('skip-link');
    expect(app).toContain('Skip to controls');
  });

  it('should have application role and label on main container', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('role="application"');
    expect(app).toContain('aria-label="SoundScape audio-reactive 3D visualizer"');
  });

  it('canvas should be aria-hidden (decorative)', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('aria-hidden="true"');
  });

  it('control panel should have region role and label', () => {
    const panel = readSrc('components/ControlPanel.tsx');
    expect(panel).toContain('role="region"');
    expect(panel).toContain('aria-label="Visualizer Controls"');
  });

  it('mode buttons should have aria-pressed and aria-label', () => {
    const panel = readSrc('components/ControlPanel.tsx');
    expect(panel).toContain('aria-pressed=');
    expect(panel).toContain('aria-label=');
  });

  it('should have screen-reader-only CSS class', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.sr-only');
    expect(css).toContain('clip: rect');
  });

  it('control groups should have aria-labelledby', () => {
    const panel = readSrc('components/ControlPanel.tsx');
    expect(panel).toContain('aria-labelledby="source-label"');
    expect(panel).toContain('aria-labelledby="mode-label"');
    expect(panel).toContain('aria-labelledby="theme-label"');
  });

  it('help overlay should be a proper dialog', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('role="dialog"');
    expect(help).toContain('aria-modal="true"');
    expect(help).toContain('aria-label="Keyboard shortcuts"');
  });

  it('help overlay should have focus trap', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('FOCUSABLE_SELECTOR');
    expect(help).toContain('e.preventDefault()');
    expect(help).toContain('first.focus()');
    expect(help).toContain('last.focus()');
  });

  it('help overlay should restore focus on close', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('previousFocusRef');
    expect(help).toContain('previousFocusRef.current.focus()');
  });
});

// ========== Reduced Motion ==========
describe('Black Hat: Reduced Motion', () => {
  it('should detect prefers-reduced-motion', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('prefers-reduced-motion');
    expect(app).toContain('prefersReducedMotion');
  });

  it('should listen for reduced motion changes', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(app).toContain("addEventListener('change'");
  });

  it('should pass reducedMotion to visualizer scene', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('reducedMotion={prefersReducedMotion}');
  });

  it('should disable beat flash in reduced motion', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('{!prefersReducedMotion && <BeatFlash />}');
  });

  it('should disable auto-rotate in reduced motion', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('autoRotate={!reducedMotion}');
  });

  it('PostProcessing should disable effects in reduced motion', () => {
    const pp = readSrc('visualizers/PostProcessing.tsx');
    expect(pp).toContain('reducedMotion ? 0.6');
    // Should branch on reducedMotion to skip ChromaticAberration
    expect(pp).toContain('reducedMotion');
    expect(pp).toContain('ChromaticAberration');
  });

  it('transitions should be instant in reduced motion', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('reducedMotion ? 1 : 0.03');
  });

  it('CSS should have reduced-motion styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.reduced-motion');
  });
});

// ========== Performance ==========
describe('Black Hat: Performance', () => {
  it('FrequencyBars should reuse color attribute (no per-frame allocation)', () => {
    const bars = readSrc('visualizers/FrequencyBars.tsx');
    // Should use pre-allocated color array ref
    expect(bars).toContain('colorArrayRef');
    expect(bars).toContain('colorAttrRef');
    // Should reuse and flag needsUpdate instead of creating new attribute
    expect(bars).toContain('colorAttrRef.current.needsUpdate = true');
    // The attribute should be created in useEffect (once), not per-frame
    // Extract useFrame body and ensure no InstancedBufferAttribute there
    const useFrameMatch = bars.match(/useFrame\(\(\)\s*=>\s*\{([\s\S]*?)\n {2}\}\)/);
    if (useFrameMatch) {
      expect(useFrameMatch[1]).not.toContain('new THREE.InstancedBufferAttribute');
    }
  });

  it('PostProcessing should not create Vector2 every render', () => {
    const pp = readSrc('visualizers/PostProcessing.tsx');
    // Should use useMemo for stable allocation
    expect(pp).toContain('useMemo(() => new Vector2');
    // Should NOT have new Vector2 in component body outside useMemo
    const lines = pp.split('\n');
    const vector2Lines = lines.filter(
      (l) => l.includes('new Vector2') && !l.includes('useMemo')
    );
    expect(vector2Lines.length).toBe(0);
  });

  it('PostProcessing should update offset in useFrame, not during render', () => {
    const pp = readSrc('visualizers/PostProcessing.tsx');
    // Should have AberrationUpdater that uses useFrame
    expect(pp).toContain('AberrationUpdater');
    expect(pp).toContain('useFrame');
    expect(pp).toContain('offset.set(');
  });

  it('should use shared audioData module (no prop-drilling refs)', () => {
    expect(srcExists('audio/audioData.ts')).toBe(true);
    const audioData = readSrc('audio/audioData.ts');
    expect(audioData).toContain('export const audioData');
    // Visualizers should import audioData
    const bars = readSrc('visualizers/FrequencyBars.tsx');
    expect(bars).toContain("from '../audio/audioData'");
    const ribbon = readSrc('visualizers/WaveformRibbon.tsx');
    expect(ribbon).toContain("from '../audio/audioData'");
  });

  it('should batch audio level updates (single store set per frame)', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain('setAudioLevels');
    expect(store).toContain('audioLevel, bassLevel, midLevel, highLevel');
    // Scene should use batch setter
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('setAudioLevels(gainedLevel, gainedBass, gainedMid, gainedHigh)');
  });

  it('WaveformRibbon should dispose geometry/material on unmount', () => {
    const ribbon = readSrc('visualizers/WaveformRibbon.tsx');
    expect(ribbon).toContain('geometry.dispose()');
    expect(ribbon).toContain('material.dispose()');
  });

  it('should resume AudioContext on tab visibility change', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('visibilitychange');
    expect(app).toContain('audioEngine.resume()');
  });

  it('AudioEngine should properly destroy on unmount', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('audioEngine.destroy()');
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('destroy()');
    expect(engine).toContain('this.ctx.close()');
  });
});

// ========== Touch Support ==========
describe('Black Hat: Touch Support', () => {
  it('should have a TouchHandler component', () => {
    expect(srcExists('components/TouchHandler.tsx')).toBe(true);
  });

  it('TouchHandler should detect horizontal swipes for mode switching', () => {
    const touch = readSrc('components/TouchHandler.tsx');
    expect(touch).toContain('SWIPE_THRESHOLD');
    expect(touch).toContain('Swipe left');
    expect(touch).toContain('Swipe right');
    expect(touch).toContain('setMode');
  });

  it('TouchHandler should detect double-tap for play toggle', () => {
    const touch = readSrc('components/TouchHandler.tsx');
    expect(touch).toContain('Double tap');
    expect(touch).toContain('togglePlay');
    expect(touch).toContain('lastTapTime');
  });

  it('TouchHandler should not intercept controls or canvas', () => {
    const touch = readSrc('components/TouchHandler.tsx');
    expect(touch).toContain("target.closest('.control-panel')");
    expect(touch).toContain("target.tagName === 'CANVAS'");
  });

  it('TouchHandler should be included in App', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('<TouchHandler />');
  });
});

// ========== Help Overlay ==========
describe('Black Hat: Help Overlay', () => {
  it('should have a HelpOverlay component', () => {
    expect(srcExists('components/HelpOverlay.tsx')).toBe(true);
  });

  it('should list all keyboard shortcuts', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('1-7');
    expect(help).toContain('Space');
    expect(help).toContain('Esc');
    expect(help).toContain('H / ?');
    expect(help).toContain('F');
  });

  it('should use <kbd> elements for shortcut keys', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('<kbd>');
  });

  it('should be toggleable via H key', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain("e.key.toLowerCase() === 'h'");
    expect(help).toContain("e.key === '?'");
  });

  it('should close on Escape', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain("e.key === 'Escape'");
    expect(help).toContain('close()');
  });

  it('should close on backdrop click', () => {
    const help = readSrc('components/HelpOverlay.tsx');
    expect(help).toContain('onClick={close}');
    expect(help).toContain('e.stopPropagation()');
  });
});

// ========== No-Signal Detection ==========
describe('Black Hat: No-Signal Detection', () => {
  it('should detect no-signal after threshold frames', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('NO_SIGNAL_THRESHOLD');
    expect(scene).toContain('silentFramesRef');
    expect(scene).toContain('setNoSignal');
  });

  it('store should have noSignal state', () => {
    const store = readSrc('store/useStore.ts');
    expect(store).toContain('noSignal: boolean');
    expect(store).toContain('setNoSignal');
  });

  it('control panel should show no-signal indicator', () => {
    const panel = readSrc('components/ControlPanel.tsx');
    expect(panel).toContain('noSignal');
    expect(panel).toContain('No signal');
    expect(panel).toContain('🔇');
  });

  it('should reset no-signal on audio source change', () => {
    const scene = readSrc('visualizers/VisualizerScene.tsx');
    expect(scene).toContain('bpmDetector.reset()');
    expect(scene).toContain('silentFramesRef.current = 0');
    expect(scene).toContain('setNoSignal(false)');
  });

  it('AudioEngine should check for signal presence', () => {
    const engine = readSrc('audio/AudioEngine.ts');
    expect(engine).toContain('isReceivingAudio');
    expect(engine).toContain('> 2'); // noise floor threshold
  });
});

// ========== ESLint Compliance ==========
describe('Black Hat: Code Quality', () => {
  it('should have no eslint-disable for react-hooks/refs (render-time ref access)', () => {
    // react-hooks/immutability disables in useFrame are the accepted R3F pattern
    // react-hooks/refs disables would indicate improper render-time ref access (the real bug)
    const files = [
      'visualizers/FrequencyBars.tsx',
      'visualizers/ParticleField.tsx',
      'visualizers/Kaleidoscope.tsx',
      'visualizers/Tunnel.tsx',
      'visualizers/PostProcessing.tsx',
      'visualizers/VisualizerScene.tsx',
      'visualizers/WaveformRibbon.tsx',
    ];
    for (const file of files) {
      const src = readSrc(file);
      const refsDisables = (src.match(/eslint-disable.*react-hooks\/refs/g) || []).length;
      expect(refsDisables).toBe(0);
    }
  });

  it('WaveformRibbon should use useMemo for shader material (not useRef)', () => {
    const ribbon = readSrc('visualizers/WaveformRibbon.tsx');
    expect(ribbon).toContain('useMemo(() => new THREE.ShaderMaterial');
    // Uniform mutations in useFrame are the accepted R3F pattern
    expect(ribbon).toContain('material.uniforms.uTime.value');
  });

  it('FrequencyBars should pre-allocate color array in ref', () => {
    const bars = readSrc('visualizers/FrequencyBars.tsx');
    expect(bars).toContain('useRef(new Float32Array(');
    expect(bars).toContain('InstancedBufferAttribute');
    // The attribute creation should be in useEffect, not useFrame
    expect(bars).toContain('useEffect');
  });
});

// ========== CSS ==========
describe('Black Hat: CSS Robustness', () => {
  it('should have error boundary styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.error-boundary');
    expect(css).toContain('.error-content');
  });

  it('should have context lost banner styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.context-lost-banner');
  });

  it('should have file error banner styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.file-error-banner');
  });

  it('should have help overlay styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.help-overlay');
    expect(css).toContain('.help-content');
    expect(css).toContain('.help-table');
  });

  it('should have skip-link styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.skip-link');
  });

  it('should have no-signal indicator styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain('.no-signal');
  });

  it('should have focus-visible styles', () => {
    const css = readSrc('styles.css');
    expect(css).toContain(':focus-visible');
  });
});
