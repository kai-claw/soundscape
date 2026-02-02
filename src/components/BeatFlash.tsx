import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

/**
 * Bass-reactive screen flash. Uses refs + rAF for animation instead of
 * setState loops to avoid unnecessary React re-renders on every frame.
 */
export function BeatFlash() {
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);
  const theme = useStore((s) => s.theme);
  const colors = themeMap[theme];

  const flashRef = useRef(0);
  const prevBassRef = useRef(0);
  const lastFlashRef = useRef(0);
  const divRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // rAF-based flash decay animation (no recursive useCallback needed)
  useEffect(() => {
    let active = true;

    const animate = () => {
      if (!active) return;
      if (flashRef.current > 0.01) {
        flashRef.current = Math.max(0, flashRef.current - 0.08);
        if (divRef.current) {
          divRef.current.style.opacity = String(flashRef.current * 0.15);
        }
        rafRef.current = requestAnimationFrame(animate);
      } else {
        flashRef.current = 0;
        if (divRef.current) {
          divRef.current.style.opacity = '0';
        }
      }
    };

    // Detect beat onset
    const now = performance.now();
    const threshold = 0.5 / sensitivity;
    const isOnset =
      bassLevel > threshold &&
      bassLevel > prevBassRef.current * 1.2 &&
      now - lastFlashRef.current > 200;

    if (isOnset) {
      flashRef.current = Math.min(1, bassLevel * sensitivity * 1.5);
      lastFlashRef.current = now;
      if (divRef.current) {
        divRef.current.style.opacity = String(flashRef.current * 0.15);
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    }
    prevBassRef.current = bassLevel;

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [bassLevel, sensitivity]);

  return (
    <div
      ref={divRef}
      className="beat-flash"
      style={{
        opacity: 0,
        background: `radial-gradient(ellipse at center, ${colors.primary}60, transparent 70%)`,
      }}
    />
  );
}
