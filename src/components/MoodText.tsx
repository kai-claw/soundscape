import { useEffect, useState, useRef } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

/**
 * MoodText — evocative phrases that bloom during mode transitions.
 * Red Hat pass: the visualizer should tell you how to *feel*, not just what you're seeing.
 */

const moodPhrases: Record<VisualizationMode, string[]> = {
  waveform: [
    'riding the current',
    'let it flow through you',
    'every wave tells a story',
    'breathe with the rhythm',
  ],
  frequency: [
    'feel the architecture',
    'the city never sleeps',
    'every bar a heartbeat',
    'sound made visible',
  ],
  particles: [
    'dissolve into light',
    'you are stardust',
    'let go',
    'infinite particles, one feeling',
  ],
  kaleidoscope: [
    'find yourself in the pattern',
    'symmetry is everywhere',
    'mirrors within mirrors',
    'beautiful chaos',
  ],
  tunnel: [
    'falling deeper',
    'the bass pulls you forward',
    'no turning back',
    'embrace the void',
  ],
  waterfall: [
    'time flows like sound',
    'the past scrolls away',
    'every moment leaves a trace',
    'spectral memory',
  ],
  flame: [
    'feel the heat',
    'let it burn',
    'fire dances to your song',
    'from noise, beauty',
  ],
};

export function MoodText() {
  const mode = useStore((s) => s.mode);
  const prevMode = useStore((s) => s.prevMode);
  const transitionProgress = useStore((s) => s.transitionProgress);
  const theme = useStore((s) => s.theme);
  const panelCollapsed = useStore((s) => s.panelCollapsed);
  const colors = themeMap[theme];

  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const lastModeRef = useRef(mode);
  const indexRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (mode === lastModeRef.current) return;
    lastModeRef.current = mode;

    // Pick next phrase for this mode (cycle through them)
    const phrases = moodPhrases[mode];
    const idx = indexRef.current[mode] ?? 0;
    setText(phrases[idx % phrases.length]);
    indexRef.current[mode] = idx + 1;

    // Fade in
    setVisible(true);

    // Fade out after 2.5s
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [mode]);

  if (!text) return null;

  return (
    <div
      className={`mood-text${visible ? ' mood-visible' : ''}`}
      aria-hidden="true"
      style={{
        color: colors.primary,
        textShadow: `0 0 30px ${colors.primary}40, 0 0 60px ${colors.primary}20`,
        bottom: panelCollapsed ? '24px' : '80px',
      }}
    >
      {text}
    </div>
  );
}
