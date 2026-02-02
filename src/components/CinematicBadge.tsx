import { useEffect, useRef, useCallback } from 'react';
import { useStore, type VisualizationMode } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

const DEFAULT_CINEMATIC_INTERVAL = 12000; // 12 seconds per mode
const MIN_CINEMATIC_INTERVAL = 6000; // Minimum 6 seconds (very fast BPM)
const MAX_CINEMATIC_INTERVAL = 20000; // Maximum 20 seconds (very slow / no BPM)
const BEATS_PER_SWITCH = 16; // Switch mode every 16 beats

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

/**
 * Compute cinematic interval from BPM.
 * When BPM-adaptive is on and we have a detected BPM, switch
 * every BEATS_PER_SWITCH beats. Otherwise use default interval.
 */
function computeInterval(bpm: number, adaptive: boolean): number {
  if (!adaptive || bpm <= 0) return DEFAULT_CINEMATIC_INTERVAL;
  const beatMs = (60 / bpm) * 1000;
  const interval = beatMs * BEATS_PER_SWITCH;
  return Math.max(MIN_CINEMATIC_INTERVAL, Math.min(MAX_CINEMATIC_INTERVAL, interval));
}

export function CinematicBadge() {
  const cinematic = useStore((s) => s.cinematic);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const theme = useStore((s) => s.theme);
  const bpm = useStore((s) => s.bpm);
  const bpmAdaptive = useStore((s) => s.bpmAdaptiveCinematic);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const intervalRef = useRef(DEFAULT_CINEMATIC_INTERVAL);

  // Recompute interval when BPM or adaptive mode changes
  useEffect(() => {
    intervalRef.current = computeInterval(bpm, bpmAdaptive);
  }, [bpm, bpmAdaptive]);

  const advanceMode = useCallback(() => {
    const current = useStore.getState().mode;
    const idx = modes.indexOf(current);
    const next = modes[(idx + 1) % modes.length];
    setMode(next);
    startTimeRef.current = performance.now();
  }, [setMode]);

  // Progress bar animation — reads current interval from ref for accuracy
  useEffect(() => {
    if (!cinematic) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = () => {
      if (progressRef.current) {
        const elapsed = performance.now() - startTimeRef.current;
        const pct = Math.min(100, (elapsed / intervalRef.current) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [cinematic]);

  // Auto-advance timer — uses recursive setTimeout to adapt to BPM changes
  useEffect(() => {
    if (!cinematic) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = performance.now();

    const scheduleNext = () => {
      timerRef.current = setTimeout(() => {
        advanceMode();
        scheduleNext(); // Re-schedule with potentially updated interval
      }, intervalRef.current);
    };
    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cinematic, advanceMode]);

  // Reset progress on mode change
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [mode]);

  if (!cinematic) return null;

  const info = modeInfo[mode];
  const colors = themeMap[theme];
  const currentInterval = computeInterval(bpm, bpmAdaptive);
  const isBpmSynced = bpmAdaptive && bpm > 0;

  return (
    <div
      className="cinematic-badge"
      role="status"
      aria-label={`Cinematic autoplay: ${info.name}${isBpmSynced ? ` (synced to ${Math.round(bpm)} BPM)` : ''}`}
      style={{ borderColor: colors.primary + '60' }}
    >
      <div className="cinematic-indicator" style={{ background: colors.accent }} />
      <div className="cinematic-info">
        <span className="cinematic-mode">
          {info.emoji} {info.name}
        </span>
        <span className="cinematic-desc">
          {info.desc}
          {isBpmSynced && (
            <span className="cinematic-bpm-sync" style={{ color: colors.accent }}>
              {' '}· ♫ {Math.round(currentInterval / 1000)}s
            </span>
          )}
        </span>
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
