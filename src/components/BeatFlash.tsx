import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

export function BeatFlash() {
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);
  const theme = useStore((s) => s.theme);
  const [flash, setFlash] = useState(0);
  const prevBassRef = useRef(0);
  const lastFlashRef = useRef(0);
  const colors = themeMap[theme];

  useEffect(() => {
    const now = performance.now();
    const threshold = 0.5 / sensitivity;
    const isOnset =
      bassLevel > threshold &&
      bassLevel > prevBassRef.current * 1.2 &&
      now - lastFlashRef.current > 200;

    if (isOnset) {
      setFlash(Math.min(1, bassLevel * sensitivity * 1.5));
      lastFlashRef.current = now;
    } else if (flash > 0) {
      setFlash((f) => Math.max(0, f - 0.08));
    }
    prevBassRef.current = bassLevel;
  }, [bassLevel, sensitivity, flash]);

  if (flash < 0.01) return null;

  return (
    <div
      className="beat-flash"
      style={{
        opacity: flash * 0.15,
        background: `radial-gradient(ellipse at center, ${colors.primary}60, transparent 70%)`,
      }}
    />
  );
}
