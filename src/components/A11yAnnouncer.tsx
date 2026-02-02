import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const modeNames: Record<string, string> = {
  waveform: 'Waveform Ribbon',
  frequency: 'Frequency Bars',
  particles: 'Particle Field',
  kaleidoscope: 'Kaleidoscope',
  tunnel: 'Tunnel',
  waterfall: 'Spectrum Waterfall',
  flame: 'Audio Flame',
};

const themeNames: Record<string, string> = {
  neon: 'Neon',
  sunset: 'Sunset',
  ocean: 'Ocean',
  monochrome: 'Monochrome',
  arctic: 'Arctic',
  forest: 'Forest',
};

/**
 * ARIA live region that announces mode/theme changes to screen readers.
 * Uses assertive announcements for user-initiated changes.
 */
export function A11yAnnouncer() {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const isPlaying = useStore((s) => s.isPlaying);
  const cinematic = useStore((s) => s.cinematic);
  const starfield = useStore((s) => s.starfield);
  const orbitRing = useStore((s) => s.orbitRing);
  const beatPulse = useStore((s) => s.beatPulse);
  const shockwave = useStore((s) => s.shockwave);
  const announceRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef(true);

  const announce = (text: string) => {
    if (initialRef.current || !announceRef.current) return;
    announceRef.current.textContent = text;
  };

  useEffect(() => {
    // Skip initial mount announcement
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    announce(`Visualization mode: ${modeNames[mode] ?? mode}`);
  }, [mode]);

  useEffect(() => {
    announce(`Color theme: ${themeNames[theme] ?? theme}`);
  }, [theme]);

  useEffect(() => {
    announce(isPlaying ? 'Audio resumed' : 'Audio paused');
  }, [isPlaying]);

  useEffect(() => {
    announce(`Cinematic autoplay ${cinematic ? 'on' : 'off'}`);
  }, [cinematic]);

  useEffect(() => {
    announce(`Starfield ${starfield ? 'on' : 'off'}`);
  }, [starfield]);

  useEffect(() => {
    announce(`Orbit ring ${orbitRing ? 'on' : 'off'}`);
  }, [orbitRing]);

  useEffect(() => {
    announce(`Beat pulse ${beatPulse ? 'on' : 'off'}`);
  }, [beatPulse]);

  useEffect(() => {
    announce(`Shockwave ${shockwave ? 'on' : 'off'}`);
  }, [shockwave]);

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
