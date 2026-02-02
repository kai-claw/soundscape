import { useEffect, useRef } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';

const modes: VisualizationMode[] = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];
const SWIPE_THRESHOLD = 60;
const SWIPE_TIMEOUT_MS = 400;

/**
 * Touch gesture handler for mobile:
 * - Swipe left → next mode
 * - Swipe right → previous mode
 * - Double tap → toggle play
 *
 * Only activates on touch-capable devices.
 * Doesn't intercept OrbitControls (those handle their own touch events on the canvas).
 */
export function TouchHandler() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const togglePlay = useStore((s) => s.togglePlay);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTapTime = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Don't capture if touching controls or the 3D canvas (OrbitControls)
      const target = e.target as HTMLElement;
      if (
        target.closest('.control-panel') ||
        target.closest('.audio-transport') ||
        target.closest('.fullscreen-btn') ||
        target.closest('.help-overlay') ||
        target.tagName === 'CANVAS'
      ) {
        return;
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.control-panel') ||
        target.closest('.audio-transport') ||
        target.closest('.fullscreen-btn') ||
        target.closest('.help-overlay') ||
        target.tagName === 'CANVAS'
      ) {
        return;
      }

      if (e.changedTouches.length === 0) return;

      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const dt = Date.now() - touchStartTime.current;

      // Must be within time limit and more horizontal than vertical
      if (dt > SWIPE_TIMEOUT_MS) return;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > SWIPE_THRESHOLD && absDx > absDy * 1.5) {
        // Horizontal swipe
        const currentIdx = modes.indexOf(mode);
        if (dx < 0) {
          // Swipe left → next mode
          const nextIdx = (currentIdx + 1) % modes.length;
          setMode(modes[nextIdx]);
        } else {
          // Swipe right → previous mode
          const prevIdx = (currentIdx - 1 + modes.length) % modes.length;
          setMode(modes[prevIdx]);
        }
      } else if (absDx < 10 && absDy < 10) {
        // Tap (minimal movement)
        const now = Date.now();
        if (now - lastTapTime.current < 350) {
          // Double tap → toggle play
          togglePlay();
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mode, setMode, togglePlay]);

  return null;
}
