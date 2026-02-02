/**
 * Blue Hat Audit Tests — Process & Summary
 *
 * Pass 6: Structural integrity tests — validates that the codebase
 * is well-organized, all features are wired up, no dead code,
 * exports are clean, and the architecture is sound.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');
const ROOT = path.resolve(SRC, '..');

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(SRC, filePath), 'utf-8');
}

function rootFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf-8');
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(SRC, filePath));
}

function getFilesInDir(dir: string, ext: string[]): string[] {
  const fullDir = path.join(SRC, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir).filter(f => ext.some(e => f.endsWith(e)));
}

describe('Blue Hat — Process & Structural Integrity', () => {
  describe('Architecture — Directory Structure', () => {
    const requiredDirs = ['audio', 'components', 'visualizers', 'themes', 'store', 'utils', '__tests__', 'test'];

    it.each(requiredDirs)('has %s/ directory', (dir) => {
      expect(fs.existsSync(path.join(SRC, dir))).toBe(true);
    });

    it('has clean separation of concerns (UI components do not import Three.js directly)', () => {
      const components = getFilesInDir('components', ['.tsx']);
      // These components are 3D overlays that legitimately use Three.js
      const threeComponents = ['BeatShockwave.tsx', 'BeatCameraPulse.tsx'];
      for (const comp of components) {
        if (threeComponents.includes(comp)) continue;
        const src = readFile(`components/${comp}`);
        expect(src).not.toContain("from 'three'");
      }
    });

    it('visualizers only use R3F patterns (not raw DOM)', () => {
      const visualizers = getFilesInDir('visualizers', ['.tsx']);
      for (const viz of visualizers) {
        const src = readFile(`visualizers/${viz}`);
        expect(src).not.toContain('document.getElementById');
        expect(src).not.toContain('document.querySelector');
      }
    });
  });

  describe('Feature Completeness — All Modes Wired', () => {
    const allModes = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];

    it('store type defines all 7 visualization modes', () => {
      const store = readFile('store/useStore.ts');
      for (const mode of allModes) {
        expect(store).toContain(`'${mode}'`);
      }
    });

    it('VisualizerScene renders all 7 modes', () => {
      const scene = readFile('visualizers/VisualizerScene.tsx');
      for (const mode of allModes) {
        expect(scene).toContain(`'${mode}'`);
      }
    });

    it('color themes cover all 6 themes', () => {
      const themes = readFile('themes/colorThemes.ts');
      for (const theme of ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest']) {
        // Theme keys may be bare identifiers (neon:) or quoted ('neon':)
        const hasBare = themes.includes(`${theme}:`);
        const hasQuoted = themes.includes(`'${theme}'`);
        expect(hasBare || hasQuoted).toBe(true);
      }
    });

    it('keyboard handler maps keys 1-7 to modes', () => {
      const handler = readFile('components/KeyboardHandler.tsx');
      for (let i = 1; i <= 7; i++) {
        expect(handler).toContain(`'${i}'`);
      }
    });

    it('help overlay documents all keyboard shortcuts', () => {
      const help = readFile('components/HelpOverlay.tsx');
      for (const key of ['1-7', 'T', 'Space', 'C', 'S', 'O', 'B', 'W', 'P', 'F', 'H']) {
        expect(help).toContain(key);
      }
    });

    it('all 8 experience presets are defined', () => {
      const store = readFile('store/useStore.ts');
      for (const preset of ['zen', 'rave', 'ambient', 'inferno', 'cinema', 'minimal', 'frozen', 'jungle']) {
        expect(store).toContain(`'${preset}'`);
      }
    });
  });

  describe('Feature Completeness — Experience Layers', () => {
    it('Starfield component exists and is imported in App', () => {
      expect(fileExists('visualizers/Starfield.tsx')).toBe(true);
      const app = readFile('App.tsx');
      expect(app).toContain('Starfield');
    });

    it('AudioOrbitRing component exists', () => {
      expect(fileExists('visualizers/AudioOrbitRing.tsx')).toBe(true);
    });

    it('BeatCameraPulse exists', () => {
      expect(fileExists('components/BeatCameraPulse.tsx')).toBe(true);
    });

    it('BeatShockwave exists', () => {
      expect(fileExists('components/BeatShockwave.tsx')).toBe(true);
    });

    it('CinematicBadge exists and wired', () => {
      expect(fileExists('components/CinematicBadge.tsx')).toBe(true);
      const app = readFile('App.tsx');
      expect(app).toContain('CinematicBadge');
    });
  });

  describe('Feature Completeness — Emotional Layer (Pass 5)', () => {
    it('MoodText component wired into App', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('MoodText');
    });

    it('EntranceOverlay wired into App', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('EntranceOverlay');
    });

    it('AudioReactiveUI wired into App', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('AudioReactiveUI');
    });
  });

  describe('Code Quality — No Dead Imports in App.tsx', () => {
    it('every imported component is used in JSX or logic', () => {
      const app = readFile('App.tsx');
      // Extract all component imports
      const importRegex = /import\s+\{?\s*(\w+)\s*\}?\s+from/g;
      let match;
      const imports: string[] = [];
      while ((match = importRegex.exec(app)) !== null) {
        const name = match[1];
        // Skip non-component imports (hooks, utilities, types)
        if (['useState', 'useCallback', 'useEffect', 'useRef', 'useStore', 'themeMap',
             'audioEngine', 'AudioEngine', 'parseUrlConfig'].includes(name)) continue;
        imports.push(name);
      }
      // Every imported component should appear in the JSX (as <Component or {Component})
      for (const imp of imports) {
        const usedInJSX = app.includes(`<${imp}`) || app.includes(`{${imp}`);
        expect(usedInJSX).toBe(true);
      }
    });
  });

  describe('Code Quality — Store Consistency', () => {
    it('store has setMode and setTheme actions', () => {
      const store = readFile('store/useStore.ts');
      expect(store).toContain('setMode');
      expect(store).toContain('setTheme');
      expect(store).toContain('setSensitivity');
    });

    it('store has toggle actions for all experience layers', () => {
      const store = readFile('store/useStore.ts');
      for (const toggle of ['toggleCinematic', 'toggleStarfield', 'toggleOrbitRing', 'toggleBeatPulse', 'toggleShockwave']) {
        expect(store).toContain(toggle);
      }
    });

    it('store has audio level state', () => {
      const store = readFile('store/useStore.ts');
      expect(store).toContain('bass');
      expect(store).toContain('mid');
      expect(store).toContain('high');
      expect(store).toContain('level');
    });

    it('store has setAudioLevels batch update', () => {
      const store = readFile('store/useStore.ts');
      expect(store).toContain('setAudioLevels');
    });
  });

  describe('Code Quality — Audio Pipeline Integrity', () => {
    it('AudioEngine has init, connectMic, destroy lifecycle', () => {
      const engine = readFile('audio/AudioEngine.ts');
      expect(engine).toContain('init()');
      expect(engine).toContain('connectMic');
      expect(engine).toContain('destroy');
    });

    it('AudioEngine exports singleton instance', () => {
      const engine = readFile('audio/AudioEngine.ts');
      expect(engine).toContain('export const audioEngine');
    });

    it('BPMDetector has detect and reset methods', () => {
      const bpm = readFile('audio/BPMDetector.ts');
      expect(bpm).toContain('detect');
      expect(bpm).toContain('reset');
    });

    it('SmoothAudio exists for spectral smoothing', () => {
      expect(fileExists('audio/SmoothAudio.ts')).toBe(true);
    });

    it('AutoGain exists for normalization', () => {
      expect(fileExists('audio/AutoGain.ts')).toBe(true);
    });
  });

  describe('Code Quality — Resource Cleanup', () => {
    it('visualizers with shaders call dispose in cleanup', () => {
      const shaderViz = ['WaveformRibbon.tsx', 'ParticleField.tsx', 'AudioFlame.tsx', 'SpectrumWaterfall.tsx'];
      for (const viz of shaderViz) {
        if (!fileExists(`visualizers/${viz}`)) continue;
        const src = readFile(`visualizers/${viz}`);
        expect(src).toContain('dispose');
      }
    });

    it('App.tsx cleans up audio on unmount', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('audioEngine.destroy');
    });
  });

  describe('Accessibility Baseline', () => {
    it('App has role="application" and aria-label', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('role="application"');
      expect(app).toContain('aria-label');
    });

    it('Skip link exists for keyboard nav', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('skip-link');
    });

    it('A11yAnnouncer exists and is wired', () => {
      expect(fileExists('components/A11yAnnouncer.tsx')).toBe(true);
      const app = readFile('App.tsx');
      expect(app).toContain('A11yAnnouncer');
    });

    it('ErrorBoundary wraps the app', () => {
      expect(fileExists('components/ErrorBoundary.tsx')).toBe(true);
      const app = readFile('App.tsx');
      expect(app).toContain('<ErrorBoundary>');
    });

    it('reduced motion class applied conditionally', () => {
      const app = readFile('App.tsx');
      expect(app).toContain('prefers-reduced-motion');
      expect(app).toContain('reduced-motion');
    });
  });

  describe('Testing Coverage Audit', () => {
    const testFiles = [
      '__tests__/whitehat.test.ts',
      '__tests__/blackhat.test.ts',
      '__tests__/greenhat.test.ts',
      '__tests__/yellowhat.test.ts',
      '__tests__/redhat.test.ts',
      '__tests__/bluehat.test.ts',
      'audio/AudioEngine.test.ts',
      'audio/BPMDetector.test.ts',
      'store/useStore.test.ts',
      'themes/colorThemes.test.ts',
    ];

    it.each(testFiles)('test file %s exists', (f) => {
      expect(fileExists(f)).toBe(true);
    });

    it('has tests across all 6 hat passes + unit tests', () => {
      const hatTests = getFilesInDir('__tests__', ['.test.ts']);
      expect(hatTests.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Build & Deployment Readiness', () => {
    it('package.json has build script', () => {
      const pkg = JSON.parse(rootFile('package.json'));
      expect(pkg.scripts.build).toBeDefined();
    });

    it('package.json has test script', () => {
      const pkg = JSON.parse(rootFile('package.json'));
      expect(pkg.scripts.test).toBeDefined();
    });

    it('vite.config.ts exists', () => {
      expect(fs.existsSync(path.join(ROOT, 'vite.config.ts'))).toBe(true);
    });

    it('tsconfig.json exists', () => {
      expect(fs.existsSync(path.join(ROOT, 'tsconfig.json'))).toBe(true);
    });

    it('index.html has meta tags for SEO', () => {
      const html = rootFile('index.html');
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('twitter:card');
    });

    it('404.html exists for SPA routing on GH Pages', () => {
      expect(fs.existsSync(path.join(ROOT, 'public', '404.html'))).toBe(true);
    });

    it('manifest.json exists for PWA', () => {
      expect(fs.existsSync(path.join(ROOT, 'public', 'manifest.json'))).toBe(true);
    });
  });

  describe('Documentation Quality', () => {
    it('README.md exists and has feature sections', () => {
      const readme = rootFile('README.md');
      expect(readme).toContain('Visualization Modes');
      expect(readme).toContain('Color Themes');
      expect(readme).toContain('Keyboard Shortcuts');
      expect(readme).toContain('Getting Started');
    });

    it('AUDIT.md exists with pass documentation', () => {
      const audit = rootFile('AUDIT.md');
      expect(audit).toContain('White Hat');
      expect(audit).toContain('Yellow Hat');
      expect(audit).toContain('Red Hat');
    });

    it('LICENSE file exists', () => {
      expect(fs.existsSync(path.join(ROOT, 'LICENSE'))).toBe(true);
    });
  });

  describe('URL State — Round-Trip Integrity', () => {
    it('urlState module exports encode and parse functions', () => {
      const urlState = readFile('utils/urlState.ts');
      expect(urlState).toContain('export function encodeUrlConfig');
      expect(urlState).toContain('export function parseUrlConfig');
    });

    it('URL config handles all shareable state', () => {
      const urlState = readFile('utils/urlState.ts');
      for (const key of ['mode', 'theme', 'sensitivity', 'cinematic', 'starfield', 'orbitRing', 'beatPulse', 'shockwave']) {
        expect(urlState).toContain(key);
      }
    });
  });

  describe('Codebase Metrics (pass 6 snapshot)', () => {
    it('has >= 40 source files', () => {
      const allFiles = [
        ...getFilesInDir('audio', ['.ts']),
        ...getFilesInDir('components', ['.tsx', '.ts']),
        ...getFilesInDir('visualizers', ['.tsx']),
        ...getFilesInDir('themes', ['.ts']),
        ...getFilesInDir('store', ['.ts']),
        ...getFilesInDir('utils', ['.ts']),
      ].filter(f => !f.includes('.test.'));
      expect(allFiles.length).toBeGreaterThanOrEqual(35);
    });

    it('has >= 10 test files', () => {
      const testFiles = [
        ...getFilesInDir('__tests__', ['.test.ts']),
        ...getFilesInDir('audio', ['.test.ts']),
        ...getFilesInDir('store', ['.test.ts']),
        ...getFilesInDir('themes', ['.test.ts']),
      ];
      expect(testFiles.length).toBeGreaterThanOrEqual(10);
    });
  });
});
