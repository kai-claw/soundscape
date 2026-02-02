import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

/**
 * AudioReactiveUI — makes the UI chrome subtly breathe with the music.
 * Red Hat pass: the UI should feel alive, not bolted on top of the experience.
 *
 * This component applies subtle CSS custom properties to the root element
 * based on audio levels, which the control panel and other UI elements
 * reference for their styling.
 */
export function AudioReactiveUI() {
  const bassLevel = useStore((s) => s.bassLevel);
  const audioLevel = useStore((s) => s.audioLevel);
  const highLevel = useStore((s) => s.highLevel);
  const theme = useStore((s) => s.theme);
  const colors = themeMap[theme];
  const smoothBassRef = useRef(0);
  const smoothLevelRef = useRef(0);
  const smoothHighRef = useRef(0);

  useEffect(() => {
    // Smooth the values to avoid jitter
    const attack = 0.3;
    const release = 0.05;

    smoothBassRef.current += (bassLevel - smoothBassRef.current) * (bassLevel > smoothBassRef.current ? attack : release);
    smoothLevelRef.current += (audioLevel - smoothLevelRef.current) * (audioLevel > smoothLevelRef.current ? attack : release);
    smoothHighRef.current += (highLevel - smoothHighRef.current) * (highLevel > smoothHighRef.current ? attack : release);

    const root = document.documentElement;
    const bass = smoothBassRef.current;
    const level = smoothLevelRef.current;
    const high = smoothHighRef.current;

    // Panel glow intensity (subtle bass pulse on border)
    root.style.setProperty('--audio-glow', `${Math.min(0.35, bass * 0.5)}`);

    // Panel background opacity shift (breathe with overall level)
    root.style.setProperty('--audio-bg-alpha', `${0.85 + level * 0.08}`);

    // Border brightness pulse
    root.style.setProperty('--audio-border-alpha', `${0.1 + bass * 0.2}`);

    // Subtle UI scale pulse (very gentle — 0.1% max)
    root.style.setProperty('--audio-scale', `${1 + bass * 0.003}`);

    // High-frequency sparkle for text accents
    root.style.setProperty('--audio-sparkle', `${high * 0.3}`);

    // Theme color for CSS access
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
  }, [bassLevel, audioLevel, highLevel, colors]);

  return null; // Pure side-effect component
}
