/**
 * Yellow Hat Pass 4/10 — Value & Strengths Tests
 *
 * Tests for features that amplify SoundScape's existing strengths:
 * - AudioFlame + BeatShockwave integration (built in Pass 3, now wired in)
 * - Experience Presets (curated one-click combos)
 * - Panel collapse (immersive mode)
 * - Screenshot capture
 * - Extended keyboard shortcuts
 * - 7 visualization modes (up from 5)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..');

function readSrc(path: string): string {
  return readFileSync(join(SRC, path), 'utf8');
}

function srcExists(path: string): boolean {
  return existsSync(join(SRC, path));
}

describe('Yellow Hat — Value & Strengths', () => {
  // ——— AudioFlame Integration ———
  describe('AudioFlame visualizer integration', () => {
    it('should have AudioFlame component', () => {
      expect(srcExists('visualizers/AudioFlame.tsx')).toBe(true);
    });

    it('should include flame in VisualizationMode type', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain("'flame'");
    });

    it('should render AudioFlame in VisualizerScene', () => {
      const scene = readSrc('visualizers/VisualizerScene.tsx');
      expect(scene).toContain('AudioFlame');
      expect(scene).toContain("mode === 'flame'");
    });

    it('should include flame in ControlPanel mode grid', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain("'flame'");
      expect(panel).toContain('🔥 Flame');
    });

    it('should have key 7 mapped to flame mode', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain("'7': 'flame'");
    });

    it('should include flame in cinematic mode rotation', () => {
      const badge = readSrc('components/CinematicBadge.tsx');
      expect(badge).toContain("flame:");
      expect(badge).toContain('Procedural GLSL aurora fire');
    });

    it('should show flame in landing screen features', () => {
      const landing = readSrc('components/LandingScreen.tsx');
      expect(landing).toContain('🔥 Flame');
    });

    it('should use custom GLSL shaders for flame', () => {
      const flame = readSrc('visualizers/AudioFlame.tsx');
      expect(flame).toContain('fragmentShader');
      expect(flame).toContain('vertexShader');
      expect(flame).toContain('snoise');
      expect(flame).toContain('fbm');
    });

    it('should respond to bass, mid, and high audio levels', () => {
      const flame = readSrc('visualizers/AudioFlame.tsx');
      expect(flame).toContain('uBass');
      expect(flame).toContain('uMid');
      expect(flame).toContain('uHigh');
    });
  });

  // ——— BeatShockwave Integration ———
  describe('BeatShockwave integration', () => {
    it('should have BeatShockwave component', () => {
      expect(srcExists('components/BeatShockwave.tsx')).toBe(true);
    });

    it('should have shockwave state in store', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain('shockwave: boolean');
      expect(store).toContain('toggleShockwave');
    });

    it('should render BeatShockwave in VisualizerScene', () => {
      const scene = readSrc('visualizers/VisualizerScene.tsx');
      expect(scene).toContain('BeatShockwave');
    });

    it('should have shockwave toggle in ControlPanel', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('toggleShockwave');
      expect(panel).toContain('💥 Shockwave');
    });

    it('should map W key to shockwave toggle', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain('toggleShockwave');
      expect(kb).toContain("'w'");
    });

    it('should use expanding torus geometry', () => {
      const shock = readSrc('components/BeatShockwave.tsx');
      expect(shock).toContain('TorusGeometry');
      expect(shock).toContain('EXPAND_SPEED');
    });

    it('should have bass threshold trigger', () => {
      const shock = readSrc('components/BeatShockwave.tsx');
      expect(shock).toContain('BASS_THRESHOLD');
      expect(shock).toContain('COOLDOWN_MS');
    });
  });

  // ——— Experience Presets ———
  describe('Experience Presets', () => {
    it('should export EXPERIENCE_PRESETS array', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain('EXPERIENCE_PRESETS');
      expect(store).toContain('ExperiencePreset');
    });

    it('should have at least 6 presets', () => {
      const store = readSrc('store/useStore.ts');
      const presetMatches = store.match(/id:\s*'/g);
      expect(presetMatches).not.toBeNull();
      expect(presetMatches!.length).toBeGreaterThanOrEqual(6);
    });

    it('should include Zen, Rave, Ambient, Inferno, Cinema, and Minimal presets', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain("id: 'zen'");
      expect(store).toContain("id: 'rave'");
      expect(store).toContain("id: 'ambient'");
      expect(store).toContain("id: 'inferno'");
      expect(store).toContain("id: 'cinema'");
      expect(store).toContain("id: 'minimal'");
    });

    it('should have applyPreset action in store', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain('applyPreset');
    });

    it('should track activePreset in store', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain('activePreset: string | null');
    });

    it('should clear activePreset when toggling individual features', () => {
      const store = readSrc('store/useStore.ts');
      // Each toggle should set activePreset to null
      expect(store).toContain("toggleCinematic: () => set((s) => ({ cinematic: !s.cinematic, activePreset: null }))");
      expect(store).toContain("toggleStarfield: () => set((s) => ({ starfield: !s.starfield, activePreset: null }))");
    });

    it('should render presets in ControlPanel', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('preset-grid');
      expect(panel).toContain('EXPERIENCE_PRESETS');
      expect(panel).toContain('applyPreset');
    });

    it('each preset should define mode, theme, and experience toggles', () => {
      const store = readSrc('store/useStore.ts');
      // ExperiencePreset interface should have all fields
      expect(store).toContain('mode: VisualizationMode');
      expect(store).toContain('theme: ColorTheme');
      expect(store).toContain('cinematic: boolean');
      expect(store).toContain('starfield: boolean');
      expect(store).toContain('orbitRing: boolean');
      expect(store).toContain('beatPulse: boolean');
      expect(store).toContain('shockwave: boolean');
      expect(store).toContain('sensitivity: number');
    });

    it('Rave preset should max out effects', () => {
      const store = readSrc('store/useStore.ts');
      // Rave should enable everything
      const raveSection = store.substring(
        store.indexOf("id: 'rave'"),
        store.indexOf("id: 'rave'") + 400,
      );
      expect(raveSection).toContain('cinematic: true');
      expect(raveSection).toContain('starfield: true');
      expect(raveSection).toContain('orbitRing: true');
      expect(raveSection).toContain('beatPulse: true');
      expect(raveSection).toContain('shockwave: true');
    });

    it('Minimal preset should disable all effects', () => {
      const store = readSrc('store/useStore.ts');
      const minSection = store.substring(
        store.indexOf("id: 'minimal'"),
        store.indexOf("id: 'minimal'") + 400,
      );
      expect(minSection).toContain('cinematic: false');
      expect(minSection).toContain('starfield: false');
      expect(minSection).toContain('orbitRing: false');
      expect(minSection).toContain('beatPulse: false');
      expect(minSection).toContain('shockwave: false');
    });
  });

  // ——— Panel Collapse ———
  describe('Panel collapse (immersive mode)', () => {
    it('should have panelCollapsed state', () => {
      const store = readSrc('store/useStore.ts');
      expect(store).toContain('panelCollapsed: boolean');
      expect(store).toContain('togglePanelCollapsed');
    });

    it('should render collapsed panel view', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('control-panel-collapsed');
      expect(panel).toContain('panelCollapsed');
    });

    it('should have P key mapped to panel toggle', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain('togglePanelCollapsed');
      expect(kb).toContain("'p'");
    });

    it('collapsed panel should show level meter and BPM', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('collapsed-bar');
      expect(panel).toContain('level-meter-sm');
    });

    it('should have CSS for collapsed state', () => {
      const css = readSrc('styles.css');
      expect(css).toContain('.control-panel-collapsed');
      expect(css).toContain('.collapsed-bar');
    });
  });

  // ——— Screenshot Capture ———
  describe('Screenshot capture', () => {
    it('should have screenshot button in ControlPanel', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('handleScreenshot');
      expect(panel).toContain('📸');
    });

    it('should use canvas.toDataURL for capture', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain("toDataURL('image/png')");
    });

    it('should create downloadable link with timestamp filename', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      expect(panel).toContain('soundscape-');
      expect(panel).toContain('Date.now()');
      expect(panel).toContain('.png');
    });
  });

  // ——— Extended Mode Support ———
  describe('7 visualization modes', () => {
    it('should define 7 modes in VisualizationMode type', () => {
      const store = readSrc('store/useStore.ts');
      const modeType = store.match(/VisualizationMode\s*=\s*([^;]+)/);
      expect(modeType).not.toBeNull();
      const types = modeType![1];
      expect(types).toContain("'waveform'");
      expect(types).toContain("'frequency'");
      expect(types).toContain("'particles'");
      expect(types).toContain("'kaleidoscope'");
      expect(types).toContain("'tunnel'");
      expect(types).toContain("'waterfall'");
      expect(types).toContain("'flame'");
    });

    it('should have 7 mode buttons in ControlPanel', () => {
      const panel = readSrc('components/ControlPanel.tsx');
      const modeEntries = panel.match(/{ id: '/g);
      expect(modeEntries).not.toBeNull();
      // 7 modes + 4 themes = 11 total, but modes array has exactly 7
      const modesSection = panel.substring(
        panel.indexOf('const modes'),
        panel.indexOf('const themes'),
      );
      const modeIds = modesSection.match(/id: '/g);
      expect(modeIds).not.toBeNull();
      expect(modeIds!.length).toBe(7);
    });

    it('should map keys 1-7 to modes in KeyboardHandler', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain("'1': 'waveform'");
      expect(kb).toContain("'2': 'frequency'");
      expect(kb).toContain("'3': 'particles'");
      expect(kb).toContain("'4': 'kaleidoscope'");
      expect(kb).toContain("'5': 'tunnel'");
      expect(kb).toContain("'6': 'waterfall'");
      expect(kb).toContain("'7': 'flame'");
    });

    it('should have all 7 modes in cinematic rotation', () => {
      const badge = readSrc('components/CinematicBadge.tsx');
      const modesArray = badge.match(/const modes.*?\[([^\]]+)\]/s);
      expect(modesArray).not.toBeNull();
      const arr = modesArray![1];
      expect(arr).toContain("'waveform'");
      expect(arr).toContain("'frequency'");
      expect(arr).toContain("'particles'");
      expect(arr).toContain("'kaleidoscope'");
      expect(arr).toContain("'tunnel'");
      expect(arr).toContain("'waterfall'");
      expect(arr).toContain("'flame'");
    });

    it('should have arrow key cycling through all 7 modes', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      const modesArray = kb.match(/const modes.*?\[([^\]]+)\]/s);
      expect(modesArray).not.toBeNull();
      expect(modesArray![1]).toContain("'flame'");
    });
  });

  // ——— Help Overlay Updated ———
  describe('Updated help overlay', () => {
    it('should list 1-7 for mode shortcuts', () => {
      const help = readSrc('components/HelpOverlay.tsx');
      expect(help).toContain('1-7');
    });

    it('should list all new keyboard shortcuts', () => {
      const help = readSrc('components/HelpOverlay.tsx');
      expect(help).toContain('Toggle orbit ring overlay');
      expect(help).toContain('Toggle beat camera pulse');
      expect(help).toContain('Toggle beat shockwave');
      expect(help).toContain('Toggle panel collapse');
    });
  });

  // ——— Keyboard Shortcut Completeness ———
  describe('Complete keyboard shortcuts', () => {
    it('should have O key for orbit ring', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain("'o'");
      expect(kb).toContain('toggleOrbitRing');
    });

    it('should have B key for beat pulse', () => {
      const kb = readSrc('components/KeyboardHandler.tsx');
      expect(kb).toContain("'b'");
      expect(kb).toContain('toggleBeatPulse');
    });
  });

  // ——— CSS Completeness ———
  describe('CSS for new features', () => {
    it('should have preset grid styles', () => {
      const css = readSrc('styles.css');
      expect(css).toContain('.preset-grid');
      expect(css).toContain('.preset-btn');
      expect(css).toContain('.preset-icon');
      expect(css).toContain('.preset-name');
    });

    it('should have experience button active states for all toggles', () => {
      const css = readSrc('styles.css');
      expect(css).toContain('.shockwave-active');
      expect(css).toContain('.orbitring-active');
      expect(css).toContain('.beatpulse-active');
      expect(css).toContain('.cinematic-active');
      expect(css).toContain('.starfield-active');
    });

    it('should have icon button styles', () => {
      const css = readSrc('styles.css');
      expect(css).toContain('.icon-btn');
      expect(css).toContain('.panel-toggle-btn');
    });
  });
});
