import { useEffect } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';

const modeKeys: Record<string, VisualizationMode> = {
  '1': 'waveform',
  '2': 'frequency',
  '3': 'particles',
  '4': 'kaleidoscope',
  '5': 'tunnel',
};

export function KeyboardHandler() {
  const setMode = useStore((s) => s.setMode);
  const cycleTheme = useStore((s) => s.cycleTheme);
  const togglePlay = useStore((s) => s.togglePlay);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode, cycleTheme, togglePlay]);

  return null;
}
