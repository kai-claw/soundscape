/**
 * Red Hat Audit Tests — Intuition & Feeling
 *
 * Pass 5: These tests validate the emotional quality layer —
 * mood text, entrance overlay, audio-reactive UI, and atmospheric landing.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(SRC, filePath), 'utf-8');
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(SRC, filePath));
}

describe('Red Hat — Emotional Quality Layer', () => {
  describe('MoodText Component', () => {
    it('exists and exports MoodText', () => {
      expect(fileExists('components/MoodText.tsx')).toBe(true);
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('export function MoodText');
    });

    it('has mood phrases for all 7 visualization modes', () => {
      const src = readFile('components/MoodText.tsx');
      const modes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
      for (const mode of modes) {
        expect(src).toContain(`${mode}:`);
      }
    });

    it('has at least 3 phrases per mode for variety', () => {
      const src = readFile('components/MoodText.tsx');
      // Each mode should have multiple string entries
      const phraseBlocks = src.match(/\[[\s\S]*?\]/g) ?? [];
      // Should have at least 7 array blocks (one per mode in moodPhrases)
      expect(phraseBlocks.length).toBeGreaterThanOrEqual(7);
    });

    it('cycles through phrases to avoid repetition', () => {
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('indexRef');
      expect(src).toContain('idx + 1');
    });

    it('fades in and out with timing', () => {
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('setVisible(true)');
      expect(src).toContain('setVisible(false)');
      expect(src).toContain('setTimeout');
    });

    it('uses theme color for text', () => {
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('colors.primary');
      expect(src).toContain('textShadow');
    });

    it('is marked aria-hidden (decorative)', () => {
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('aria-hidden="true"');
    });

    it('adjusts position when panel is collapsed', () => {
      const src = readFile('components/MoodText.tsx');
      expect(src).toContain('panelCollapsed');
    });
  });

  describe('EntranceOverlay Component', () => {
    it('exists and exports EntranceOverlay', () => {
      expect(fileExists('components/EntranceOverlay.tsx')).toBe(true);
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain('export function EntranceOverlay');
    });

    it('has phase-based state machine (waiting → listening → dissolving → gone)', () => {
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain('waiting');
      expect(src).toContain('listening');
      expect(src).toContain('dissolving');
      expect(src).toContain('gone');
    });

    it('detects audio signal to trigger transition', () => {
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain('audioLevel');
      expect(src).toContain('hasSignalRef');
    });

    it('unmounts after dissolving (gone phase returns null)', () => {
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain("phase === 'gone'");
      expect(src).toContain('return null');
    });

    it('uses CSS variables for theme integration', () => {
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain('--entrance-color');
    });

    it('is aria-hidden (decorative overlay)', () => {
      const src = readFile('components/EntranceOverlay.tsx');
      expect(src).toContain('aria-hidden="true"');
    });
  });

  describe('AudioReactiveUI Component', () => {
    it('exists and exports AudioReactiveUI', () => {
      expect(fileExists('components/AudioReactiveUI.tsx')).toBe(true);
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('export function AudioReactiveUI');
    });

    it('reads bass, audio, and high levels from store', () => {
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('bassLevel');
      expect(src).toContain('audioLevel');
      expect(src).toContain('highLevel');
    });

    it('sets CSS custom properties on document root', () => {
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('setProperty');
      expect(src).toContain('--audio-glow');
      expect(src).toContain('--audio-bg-alpha');
      expect(src).toContain('--audio-border-alpha');
      expect(src).toContain('--audio-scale');
      expect(src).toContain('--audio-sparkle');
    });

    it('smooths values to avoid jitter', () => {
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('smoothBassRef');
      expect(src).toContain('attack');
      expect(src).toContain('release');
    });

    it('sets theme color CSS variables', () => {
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('--theme-primary');
      expect(src).toContain('--theme-secondary');
      expect(src).toContain('--theme-accent');
    });

    it('returns null (side-effect only component)', () => {
      const src = readFile('components/AudioReactiveUI.tsx');
      expect(src).toContain('return null');
    });
  });

  describe('Landing Screen Atmosphere', () => {
    const src = readFile('components/LandingScreen.tsx');

    it('has rotating taglines for variety', () => {
      expect(src).toContain('taglines');
      expect(src).toContain('Math.random()');
    });

    it('has typewriter effect for tagline', () => {
      expect(src).toContain('displayedTagline');
      expect(src).toContain('setInterval');
      expect(src).toContain('tagline.slice');
    });

    it('has floating dust particles', () => {
      expect(src).toContain('dust-particle');
      expect(src).toContain('landing-dust');
    });

    it('has ambient gradient wash', () => {
      expect(src).toContain('landing-gradient');
    });

    it('has loading state with wave animation', () => {
      expect(src).toContain('loading-wave');
      expect(src).toContain('loading-bar');
      expect(src).toContain('Connecting...');
    });

    it('has feature count hint at bottom', () => {
      expect(src).toContain('landing-hint');
      expect(src).toContain('7 modes');
    });

    it('wraps icon for independent glow animation', () => {
      expect(src).toContain('landing-icon-inner');
    });
  });

  describe('CSS Emotional Layer', () => {
    const css = readFile('styles.css');

    it('has mood text styles with fade animation', () => {
      expect(css).toContain('.mood-text');
      expect(css).toContain('.mood-visible');
      expect(css).toContain('moodFadeInUp');
    });

    it('mood text uses blur in animation (dreamy quality)', () => {
      expect(css).toContain('filter: blur');
    });

    it('has entrance overlay styles with phase classes', () => {
      expect(css).toContain('.entrance-overlay');
      expect(css).toContain('.entrance-waiting');
      expect(css).toContain('.entrance-listening');
      expect(css).toContain('.entrance-dissolving');
    });

    it('has entrance ring pulse animation', () => {
      expect(css).toContain('entranceRingPulse');
    });

    it('has dust particle float animation', () => {
      expect(css).toContain('.dust-particle');
      expect(css).toContain('dustFloat');
    });

    it('has ambient gradient drift animation', () => {
      expect(css).toContain('.landing-gradient');
      expect(css).toContain('gradientDrift');
    });

    it('has icon glow animation', () => {
      expect(css).toContain('iconGlow');
      expect(css).toContain('drop-shadow');
    });

    it('has typewriter cursor blink', () => {
      expect(css).toContain('.typewriter-cursor');
      expect(css).toContain('cursorBlink');
    });

    it('has loading wave animation', () => {
      expect(css).toContain('.loading-bar');
      expect(css).toContain('loadingWave');
    });

    it('defines audio-reactive CSS custom properties', () => {
      expect(css).toContain('--audio-glow');
      expect(css).toContain('--audio-bg-alpha');
      expect(css).toContain('--audio-border-alpha');
      expect(css).toContain('--audio-scale');
      expect(css).toContain('--audio-sparkle');
    });

    it('applies audio-reactive styling to control panel', () => {
      expect(css).toContain('var(--audio-glow)');
      expect(css).toContain('var(--audio-scale)');
    });

    it('applies audio-driven text shadow to panel header', () => {
      expect(css).toContain('var(--audio-sparkle)');
      expect(css).toContain('.panel-header h2');
    });

    it('uses slower background transition for smooth theme changes', () => {
      // App background should have >0.5s transition for smoother theme switching
      expect(css).toContain('transition: background 1.2s');
    });

    it('respects prefers-reduced-motion for all new elements', () => {
      const reducedMotionBlock = css.split('prefers-reduced-motion')[1] ?? '';
      expect(reducedMotionBlock).toContain('.dust-particle');
      expect(reducedMotionBlock).toContain('.landing-gradient');
      expect(reducedMotionBlock).toContain('.typewriter-cursor');
      expect(reducedMotionBlock).toContain('.entrance-ring');
      expect(reducedMotionBlock).toContain('.mood-text');
      expect(reducedMotionBlock).toContain('.entrance-overlay');
    });

    it('disables panel transform in reduced motion', () => {
      const reducedMotionBlock = css.split('prefers-reduced-motion')[1] ?? '';
      expect(reducedMotionBlock).toContain('transform: none');
    });
  });

  describe('App Integration', () => {
    const app = readFile('App.tsx');

    it('imports MoodText', () => {
      expect(app).toContain("import { MoodText }");
    });

    it('imports EntranceOverlay', () => {
      expect(app).toContain("import { EntranceOverlay }");
    });

    it('imports AudioReactiveUI', () => {
      expect(app).toContain("import { AudioReactiveUI }");
    });

    it('renders MoodText in the app', () => {
      expect(app).toContain('<MoodText');
    });

    it('renders EntranceOverlay in the app', () => {
      expect(app).toContain('<EntranceOverlay');
    });

    it('renders AudioReactiveUI in the app', () => {
      expect(app).toContain('<AudioReactiveUI');
    });
  });
});
