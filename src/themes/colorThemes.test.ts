import { describe, it, expect } from 'vitest';
import { themeMap, getThemeColor, lerpColor } from './colorThemes';
import type { ColorTheme } from '../store/useStore';

describe('colorThemes', () => {
  describe('themeMap', () => {
    const themes: ColorTheme[] = ['neon', 'sunset', 'ocean', 'monochrome'];

    it('defines all 4 themes', () => {
      expect(Object.keys(themeMap)).toHaveLength(4);
      for (const t of themes) {
        expect(themeMap[t]).toBeDefined();
      }
    });

    it.each(themes)('%s has required properties', (theme) => {
      const t = themeMap[theme];
      expect(t.primary).toBeTruthy();
      expect(t.secondary).toBeTruthy();
      expect(t.tertiary).toBeTruthy();
      expect(t.accent).toBeTruthy();
      expect(t.background).toBeTruthy();
      expect(t.colors).toBeInstanceOf(Array);
      expect(t.colors.length).toBeGreaterThanOrEqual(3);
    });

    it.each(themes)('%s has valid hex colors', (theme) => {
      const t = themeMap[theme];
      const hexRe = /^#[0-9a-fA-F]{6}$/;
      expect(t.primary).toMatch(hexRe);
      expect(t.secondary).toMatch(hexRe);
      expect(t.tertiary).toMatch(hexRe);
      expect(t.accent).toMatch(hexRe);
      expect(t.background).toMatch(hexRe);
    });

    it.each(themes)('%s colors are normalized RGB [0,1]', (theme) => {
      const t = themeMap[theme];
      for (const [r, g, b] of t.colors) {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(1);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(g).toBeLessThanOrEqual(1);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(1);
      }
    });

    it('neon has characteristic magenta primary', () => {
      expect(themeMap.neon.primary).toBe('#ff00ff');
    });

    it('sunset has warm orange primary', () => {
      expect(themeMap.sunset.primary).toBe('#ff6b35');
    });

    it('ocean has blue primary', () => {
      expect(themeMap.ocean.primary).toBe('#0077b6');
    });

    it('monochrome has white primary', () => {
      expect(themeMap.monochrome.primary).toBe('#ffffff');
    });
  });

  describe('getThemeColor', () => {
    it('returns first color at index 0', () => {
      const c = getThemeColor('neon', 0);
      expect(c).toEqual([1.0, 0.0, 1.0]);
    });

    it('returns second color at index 1', () => {
      const c = getThemeColor('neon', 1);
      expect(c).toEqual([0.0, 1.0, 1.0]);
    });

    it('wraps around when index exceeds color count', () => {
      const c = getThemeColor('neon', 4); // wraps to index 0
      expect(c).toEqual([1.0, 0.0, 1.0]);
    });

    it('wraps correctly for large index', () => {
      const c = getThemeColor('neon', 7); // 7 % 4 = 3
      expect(c).toEqual([1.0, 0.2, 0.4]);
    });

    it('returns array of 3 numbers', () => {
      const c = getThemeColor('ocean', 2);
      expect(c).toHaveLength(3);
      expect(typeof c[0]).toBe('number');
      expect(typeof c[1]).toBe('number');
      expect(typeof c[2]).toBe('number');
    });
  });

  describe('lerpColor', () => {
    it('returns first color at t=0', () => {
      const a: [number, number, number] = [1, 0, 0];
      const b: [number, number, number] = [0, 1, 0];
      expect(lerpColor(a, b, 0)).toEqual([1, 0, 0]);
    });

    it('returns second color at t=1', () => {
      const a: [number, number, number] = [1, 0, 0];
      const b: [number, number, number] = [0, 1, 0];
      expect(lerpColor(a, b, 1)).toEqual([0, 1, 0]);
    });

    it('returns midpoint at t=0.5', () => {
      const a: [number, number, number] = [0, 0, 0];
      const b: [number, number, number] = [1, 1, 1];
      const result = lerpColor(a, b, 0.5);
      expect(result[0]).toBeCloseTo(0.5);
      expect(result[1]).toBeCloseTo(0.5);
      expect(result[2]).toBeCloseTo(0.5);
    });

    it('handles same colors', () => {
      const c: [number, number, number] = [0.5, 0.5, 0.5];
      expect(lerpColor(c, c, 0.5)).toEqual([0.5, 0.5, 0.5]);
    });

    it('interpolates each channel independently', () => {
      const a: [number, number, number] = [1, 0, 0.5];
      const b: [number, number, number] = [0, 1, 0.5];
      const result = lerpColor(a, b, 0.25);
      expect(result[0]).toBeCloseTo(0.75);
      expect(result[1]).toBeCloseTo(0.25);
      expect(result[2]).toBeCloseTo(0.5);
    });
  });
});
