import { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

/**
 * BpmDisplay — Prominent animated BPM counter.
 *
 * Shows the detected BPM with a pulsing ring animation synced to the beat,
 * making the tempo detection feature front-and-center in the UI.
 * Positioned at the bottom-left as an ambient info overlay.
 *
 * Yellow Hat Pass 4: Makes SoundScape's BPM detection — a unique
 * differentiator — more visible and impressive.
 */

export function BpmDisplay() {
  const bpm = useStore((s) => s.bpm);
  const bassLevel = useStore((s) => s.bassLevel);
  const theme = useStore((s) => s.theme);
  const noSignal = useStore((s) => s.noSignal);
  const panelCollapsed = useStore((s) => s.panelCollapsed);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const themeColors = themeMap[theme];

  // Pulse the ring on bass hits
  const lastPulseRef = useRef(0);
  const pulseRing = useCallback(() => {
    if (!ringRef.current) return;
    const now = performance.now();
    // Debounce: only pulse every ~200ms
    if (now - lastPulseRef.current < 200) return;
    lastPulseRef.current = now;
    ringRef.current.style.transform = 'scale(1.15)';
    ringRef.current.style.opacity = '0.9';
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.transform = 'scale(1)';
          ringRef.current.style.opacity = '0.5';
        }
      }, 100);
    });
  }, []);

  // Trigger pulse on bass threshold
  useEffect(() => {
    if (bassLevel > 0.4) {
      pulseRing();
    }
  }, [bassLevel, pulseRing]);

  // Animate the dot orbiting at BPM speed
  useEffect(() => {
    if (!dotRef.current || bpm <= 0) return;
    const msPerBeat = 60000 / bpm;
    dotRef.current.style.animationDuration = `${msPerBeat}ms`;
  }, [bpm]);

  if (bpm <= 0 || noSignal) return null;

  return (
    <div
      className="bpm-display"
      aria-label={`Detected tempo: ${bpm} beats per minute`}
      role="status"
      style={panelCollapsed ? { bottom: '16px', left: '16px' } : undefined}
    >
      {/* Pulsing ring */}
      <div
        ref={ringRef}
        className="bpm-ring"
        style={{
          borderColor: themeColors.primary,
          boxShadow: `0 0 12px ${themeColors.primary}40`,
        }}
      />

      {/* Orbiting beat dot */}
      <div className="bpm-orbit" ref={dotRef}>
        <div
          className="bpm-dot"
          style={{ background: themeColors.accent }}
        />
      </div>

      {/* BPM number */}
      <div className="bpm-value" style={{ color: themeColors.primary }}>
        {bpm}
      </div>
      <div className="bpm-label">BPM</div>
    </div>
  );
}
