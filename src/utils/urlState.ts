/**
 * URL State — Encode/decode visualizer configuration in URL hash.
 *
 * Enables one-click sharing: users can copy the URL to share their
 * exact mode + theme + effects + sensitivity setup.
 *
 * Format: #m=waveform&t=neon&s=1.2&fx=csbo (compact flags)
 * fx flags: c=cinematic, s=starfield, o=orbitRing, b=beatPulse, w=shockwave
 *
 * Yellow Hat Pass 4: Makes sharing SoundScape configurations effortless.
 */

import type { VisualizationMode, ColorTheme } from '../store/useStore';

export interface UrlConfig {
  mode?: VisualizationMode;
  theme?: ColorTheme;
  sensitivity?: number;
  cinematic?: boolean;
  starfield?: boolean;
  orbitRing?: boolean;
  beatPulse?: boolean;
  shockwave?: boolean;
}

const VALID_MODES: VisualizationMode[] = [
  'waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame',
];

const VALID_THEMES: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome', 'arctic', 'forest'];

/** Short mode codes for compact URLs */
const MODE_SHORT: Record<string, VisualizationMode> = {
  w: 'waveform', f: 'frequency', p: 'particles', k: 'kaleidoscope',
  t: 'tunnel', wf: 'waterfall', fl: 'flame',
};
const MODE_TO_SHORT: Record<VisualizationMode, string> = {
  waveform: 'w', frequency: 'f', particles: 'p', kaleidoscope: 'k',
  tunnel: 't', waterfall: 'wf', flame: 'fl',
};

const THEME_SHORT: Record<string, ColorTheme> = {
  n: 'neon', s: 'sunset', o: 'ocean', m: 'monochrome', a: 'arctic', fr: 'forest',
};
const THEME_TO_SHORT: Record<ColorTheme, string> = {
  neon: 'n', sunset: 's', ocean: 'o', monochrome: 'm', arctic: 'a', forest: 'fr',
};

/** Parse URL hash into config */
export function parseUrlConfig(): UrlConfig | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const config: UrlConfig = {};
  let hasAny = false;

  // Mode
  const m = params.get('m');
  if (m) {
    const mode = MODE_SHORT[m] || (VALID_MODES.includes(m as VisualizationMode) ? m as VisualizationMode : undefined);
    if (mode) {
      config.mode = mode;
      hasAny = true;
    }
  }

  // Theme
  const t = params.get('t');
  if (t) {
    const theme = THEME_SHORT[t] || (VALID_THEMES.includes(t as ColorTheme) ? t as ColorTheme : undefined);
    if (theme) {
      config.theme = theme;
      hasAny = true;
    }
  }

  // Sensitivity
  const s = params.get('s');
  if (s) {
    const val = parseFloat(s);
    if (!isNaN(val) && val >= 0.1 && val <= 3.0) {
      config.sensitivity = Math.round(val * 10) / 10;
      hasAny = true;
    }
  }

  // Effects flags — only set flags that are explicitly present in the string
  // to avoid overriding user's current settings for unmentioned effects
  const fx = params.get('fx');
  if (fx) {
    if (fx.includes('c')) { config.cinematic = true; hasAny = true; }
    if (fx.includes('s')) { config.starfield = true; hasAny = true; }
    if (fx.includes('o')) { config.orbitRing = true; hasAny = true; }
    if (fx.includes('b')) { config.beatPulse = true; hasAny = true; }
    if (fx.includes('w')) { config.shockwave = true; hasAny = true; }
  }

  return hasAny ? config : null;
}

/** Encode config into URL hash string (without the #) */
export function encodeUrlConfig(config: UrlConfig): string {
  const params = new URLSearchParams();

  if (config.mode) {
    params.set('m', MODE_TO_SHORT[config.mode] || config.mode);
  }
  if (config.theme) {
    params.set('t', THEME_TO_SHORT[config.theme] || config.theme);
  }
  if (config.sensitivity !== undefined && config.sensitivity !== 1.0) {
    params.set('s', config.sensitivity.toFixed(1));
  }

  // Compact effects flags
  let fx = '';
  if (config.cinematic) fx += 'c';
  if (config.starfield) fx += 's';
  if (config.orbitRing) fx += 'o';
  if (config.beatPulse) fx += 'b';
  if (config.shockwave) fx += 'w';
  if (fx) params.set('fx', fx);

  return params.toString();
}

/** Update the URL hash without triggering navigation */
export function updateUrlHash(config: UrlConfig): void {
  const hash = encodeUrlConfig(config);
  if (hash) {
    window.history.replaceState(null, '', '#' + hash);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/** Generate a shareable URL string */
export function getShareUrl(config: UrlConfig): string {
  const hash = encodeUrlConfig(config);
  return `${window.location.origin}${window.location.pathname}${hash ? '#' + hash : ''}`;
}
