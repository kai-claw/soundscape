import { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

/**
 * MiniSpectrum — Compact real-time frequency analyzer in the control panel.
 *
 * Draws 32 bars on a small canvas, giving users immediate visual feedback
 * about their audio input right in the controls. Uses requestAnimationFrame
 * for smooth 60fps rendering independent of the Three.js loop.
 *
 * Yellow Hat Pass 4: Gives users confidence that audio is working and
 * adds visual richness to the control panel.
 */

const BAR_COUNT = 32;
const CANVAS_WIDTH = 220;
const CANVAS_HEIGHT = 40;
const BAR_GAP = 1;
const BAR_WIDTH = (CANVAS_WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

export function MiniSpectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const isPlaying = useStore((s) => s.isPlaying);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);
  const themeColors = themeMap[theme];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqData = audioData.freq;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bars
    for (let i = 0; i < BAR_COUNT; i++) {
      // Map bar index to frequency bin (log-scale for perceptual accuracy)
      const freqT = i / BAR_COUNT;
      const freqIdx = Math.floor(Math.pow(freqT, 1.5) * freqData.length * 0.75);
      const val = (freqData[freqIdx] / 255) * sensitivity;
      const h = Math.max(1, val * CANVAS_HEIGHT);
      const x = i * (BAR_WIDTH + BAR_GAP);
      const y = CANVAS_HEIGHT - h;

      // Gradient from primary to accent based on frequency
      const t = i / BAR_COUNT;
      const r = Math.round(
        parseInt(themeColors.primary.slice(1, 3), 16) * (1 - t) +
        parseInt(themeColors.accent.slice(1, 3), 16) * t,
      );
      const g = Math.round(
        parseInt(themeColors.primary.slice(3, 5), 16) * (1 - t) +
        parseInt(themeColors.accent.slice(3, 5), 16) * t,
      );
      const b = Math.round(
        parseInt(themeColors.primary.slice(5, 7), 16) * (1 - t) +
        parseInt(themeColors.accent.slice(5, 7), 16) * t,
      );

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + val * 0.4})`;
      ctx.fillRect(x, y, BAR_WIDTH, h);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [theme, sensitivity, themeColors]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPlaying, draw]);

  return (
    <div className="mini-spectrum" aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: `${CANVAS_HEIGHT}px`,
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />
    </div>
  );
}
