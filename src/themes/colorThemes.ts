import type { ColorTheme } from '../store/useStore';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  background: string;
  colors: [number, number, number][];
}

export const themeMap: Record<ColorTheme, ThemeColors> = {
  neon: {
    primary: '#ff00ff',
    secondary: '#00ffff',
    tertiary: '#ffff00',
    accent: '#ff3366',
    background: '#0a0014',
    colors: [
      [1.0, 0.0, 1.0],
      [0.0, 1.0, 1.0],
      [1.0, 1.0, 0.0],
      [1.0, 0.2, 0.4],
    ],
  },
  sunset: {
    primary: '#ff6b35',
    secondary: '#ff1654',
    tertiary: '#ffd166',
    accent: '#9b2335',
    background: '#1a0a05',
    colors: [
      [1.0, 0.42, 0.21],
      [1.0, 0.09, 0.33],
      [1.0, 0.82, 0.4],
      [0.61, 0.14, 0.21],
    ],
  },
  ocean: {
    primary: '#0077b6',
    secondary: '#00b4d8',
    tertiary: '#90e0ef',
    accent: '#48cae4',
    background: '#030a14',
    colors: [
      [0.0, 0.47, 0.71],
      [0.0, 0.71, 0.85],
      [0.56, 0.88, 0.94],
      [0.28, 0.79, 0.89],
    ],
  },
  monochrome: {
    primary: '#ffffff',
    secondary: '#bbbbbb',
    tertiary: '#888888',
    accent: '#dddddd',
    background: '#0a0a0a',
    colors: [
      [1.0, 1.0, 1.0],
      [0.73, 0.73, 0.73],
      [0.53, 0.53, 0.53],
      [0.87, 0.87, 0.87],
    ],
  },
  arctic: {
    primary: '#88ccff',
    secondary: '#44aaee',
    tertiary: '#ffffff',
    accent: '#aaeeff',
    background: '#040810',
    colors: [
      [0.53, 0.8, 1.0],
      [0.27, 0.67, 0.93],
      [1.0, 1.0, 1.0],
      [0.67, 0.93, 1.0],
    ],
  },
  forest: {
    primary: '#22cc66',
    secondary: '#66ff99',
    tertiary: '#88ddaa',
    accent: '#33ff88',
    background: '#040d08',
    colors: [
      [0.13, 0.8, 0.4],
      [0.4, 1.0, 0.6],
      [0.53, 0.87, 0.67],
      [0.2, 1.0, 0.53],
    ],
  },
};

export function getThemeColor(theme: ColorTheme, index: number): [number, number, number] {
  const t = themeMap[theme];
  return t.colors[index % t.colors.length];
}

export function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
