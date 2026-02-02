import { useEffect } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';

const modeKeys: Record<string, VisualizationMode> = {
  '1': 'waveform',
  '2': 'frequency',
  '3': 'particles',
  '4': 'kaleidoscope',
  '5': 'tunnel',
};

const modes: VisualizationMode[] = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel'];

export function KeyboardHandler() {
  const setMode = useStore((s) => s.setMode);
  const cycleTheme = useStore((s) => s.cycleTheme);
  const togglePlay = useStore((s) => s.togglePlay);
  const toggleCinematic = useStore((s) => s.toggleCinematic);
  const toggleStarfield = useStore((s) => s.toggleStarfield);
  const mode = useStore((s) => s.mode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (modeKeys[e.key]) {
        e.preventDefault();
        setMode(modeKeys[e.key]);
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        cycleTheme();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        toggleCinematic();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleStarfield();
      } else if (e.key.toLowerCase() === 'f') {
        // Fullscreen toggle (don't conflict with help overlay which is H)
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const idx = modes.indexOf(mode);
        setMode(modes[(idx + 1) % modes.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = modes.indexOf(mode);
        setMode(modes[(idx - 1 + modes.length) % modes.length]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode, cycleTheme, togglePlay, toggleCinematic, toggleStarfield, mode]);

  return null;
}
