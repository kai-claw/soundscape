import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

/**
 * EntranceOverlay — a brief cinematic moment when audio first connects.
 * Red Hat pass: crossing from silence to sound should feel like a threshold.
 */
export function EntranceOverlay() {
  const audioLevel = useStore((s) => s.audioLevel);
  const theme = useStore((s) => s.theme);
  const colors = themeMap[theme];

  const [phase, setPhase] = useState<'waiting' | 'listening' | 'dissolving' | 'gone'>('waiting');
  const hasSignalRef = useRef(false);

  useEffect(() => {
    if (phase === 'gone') return;

    if (audioLevel > 0.02 && !hasSignalRef.current) {
      hasSignalRef.current = true;
      setPhase('listening');

      // Brief "listening..." moment, then dissolve
      const dissolveTimer = setTimeout(() => setPhase('dissolving'), 1200);
      const goneTimer = setTimeout(() => setPhase('gone'), 2400);
      return () => {
        clearTimeout(dissolveTimer);
        clearTimeout(goneTimer);
      };
    }
  }, [audioLevel, phase]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`entrance-overlay entrance-${phase}`}
      aria-hidden="true"
      style={{
        '--entrance-color': colors.primary,
        '--entrance-glow': colors.secondary,
      } as React.CSSProperties}
    >
      <div className="entrance-content">
        {phase === 'waiting' && (
          <div className="entrance-pulse">
            <div className="entrance-ring" />
            <div className="entrance-ring entrance-ring-2" />
            <span className="entrance-text">listening...</span>
          </div>
        )}
        {phase === 'listening' && (
          <span className="entrance-text entrance-found">♪ sound detected</span>
        )}
      </div>
    </div>
  );
}
