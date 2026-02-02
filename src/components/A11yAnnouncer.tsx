import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const modeNames: Record<string, string> = {
  waveform: 'Waveform Ribbon',
  frequency: 'Frequency Bars',
  particles: 'Particle Field',
  kaleidoscope: 'Kaleidoscope',
  tunnel: 'Tunnel',
};

const themeNames: Record<string, string> = {
  neon: 'Neon',
  sunset: 'Sunset',
  ocean: 'Ocean',
  monochrome: 'Monochrome',
};

/**
 * ARIA live region that announces mode/theme changes to screen readers.
 * Uses assertive announcements for user-initiated changes.
 */
export function A11yAnnouncer() {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const isPlaying = useStore((s) => s.isPlaying);
  const announceRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef(true);

  useEffect(() => {
    // Skip initial mount announcement
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (announceRef.current) {
      announceRef.current.textContent = `Visualization mode: ${modeNames[mode] ?? mode}`;
    }
  }, [mode]);

  useEffect(() => {
    if (initialRef.current) return;
    if (announceRef.current) {
      announceRef.current.textContent = `Color theme: ${themeNames[theme] ?? theme}`;
    }
  }, [theme]);

  useEffect(() => {
    if (initialRef.current) return;
    if (announceRef.current) {
      announceRef.current.textContent = isPlaying ? 'Audio resumed' : 'Audio paused';
    }
  }, [isPlaying]);

  return (
    <div
      ref={announceRef}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
