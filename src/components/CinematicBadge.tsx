import { useEffect, useRef, useCallback } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

const CINEMATIC_INTERVAL = 12000; // 12 seconds per mode

const modes: VisualizationMode[] = ['waveform', 'frequency', 'particles', 'kaleidoscope', 'tunnel', 'waterfall', 'flame'];

const modeInfo: Record<VisualizationMode, { emoji: string; name: string; desc: string }> = {
  waveform: { emoji: '🌊', name: 'Waveform', desc: 'Audio ribbon flowing through space' },
  frequency: { emoji: '📊', name: 'Frequency', desc: 'Frequency spectrum city grid' },
  particles: { emoji: '✨', name: 'Particles', desc: '3000 audio-reactive particles' },
  kaleidoscope: { emoji: '🔮', name: 'Kaleidoscope', desc: '8-fold mirrored geometry' },
  tunnel: { emoji: '🕳️', name: 'Tunnel', desc: 'Bass-reactive warp tunnel' },
  waterfall: { emoji: '🏔️', name: 'Waterfall', desc: 'Scrolling spectrum heatmap' },
  flame: { emoji: '🔥', name: 'Flame', desc: 'Procedural GLSL aurora fire' },
};

export function CinematicBadge() {
  const cinematic = useStore((s) => s.cinematic);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const theme = useStore((s) => s.theme);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);

  const advanceMode = useCallback(() => {
    const current = useStore.getState().mode;
    const idx = modes.indexOf(current);
    const next = modes[(idx + 1) % modes.length];
    setMode(next);
    startTimeRef.current = performance.now();
  }, [setMode]);

  // Progress bar animation
  useEffect(() => {
    if (!cinematic) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = () => {
      if (progressRef.current) {
        const elapsed = performance.now() - startTimeRef.current;
        const pct = Math.min(100, (elapsed / CINEMATIC_INTERVAL) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [cinematic]);

  // Auto-advance timer
  useEffect(() => {
    if (!cinematic) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = performance.now();
    timerRef.current = setInterval(advanceMode, CINEMATIC_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cinematic, advanceMode]);

  // Reset progress on mode change
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [mode]);

  if (!cinematic) return null;

  const info = modeInfo[mode];
  const colors = themeMap[theme];

  return (
    <div
      className="cinematic-badge"
      role="status"
      aria-label={`Cinematic autoplay: ${info.name}`}
      style={{ borderColor: colors.primary + '60' }}
    >
      <div className="cinematic-indicator" style={{ background: colors.accent }} />
      <div className="cinematic-info">
        <span className="cinematic-mode">
          {info.emoji} {info.name}
        </span>
        <span className="cinematic-desc">{info.desc}</span>
      </div>
      <div className="cinematic-progress-bar">
        <div
          ref={progressRef}
          className="cinematic-progress-fill"
          style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
        />
      </div>
    </div>
  );
}
