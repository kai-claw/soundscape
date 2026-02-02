import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * FpsCounter — Optional performance stats overlay.
 *
 * Shows live FPS count so users can verify their machine handles
 * SoundScape smoothly. Hidden by default, toggled with the 'F' key.
 *
 * Yellow Hat Pass 4: Builds confidence that the app runs well and
 * gives power users a diagnostic tool.
 */

export function FpsCounter({ visible }: { visible: boolean }) {
  const [fps, setFps] = useState(60);
  const framesRef = useRef(0);
  const lastRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    framesRef.current++;
    const now = performance.now();
    const delta = now - lastRef.current;
    if (delta >= 1000) {
      setFps(Math.round((framesRef.current * 1000) / delta));
      framesRef.current = 0;
      lastRef.current = now;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (visible) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, tick]);

  if (!visible) return null;

  const color = fps >= 55 ? '#4ade80' : fps >= 30 ? '#fbbf24' : '#ef4444';

  return (
    <div
      className="fps-counter"
      role="status"
      aria-label={`Performance: ${fps} frames per second`}
    >
      <span className="fps-value" style={{ color }}>{fps}</span>
      <span className="fps-label">FPS</span>
    </div>
  );
}
