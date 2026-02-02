import { useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useStore } from '../store/useStore';
import { themeMap } from '../themes/colorThemes';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function AudioTransport() {
  const audioSource = useStore((s) => s.audioSource);
  const theme = useStore((s) => s.theme);
  const fileName = useStore((s) => s.fileName);
  const colors = themeMap[theme];
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const rafRef = useRef<number>(0);
  const seekingRef = useRef(false);
  const isVisible = audioSource === 'file' && !!fileName;

  // Keep ref in sync with state for rAF loop access
  useEffect(() => {
    seekingRef.current = seeking;
  }, [seeking]);

  // rAF-based time update loop — only runs when transport is visible
  useEffect(() => {
    if (!isVisible) {
      // Cancel any pending frame when transport hides
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    const tick = () => {
      const el = audioEngine.audioElement;
      if (el && !seekingRef.current) {
        setCurrentTime(el.currentTime);
        if (el.duration && isFinite(el.duration)) {
          setDuration(el.duration);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isVisible]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioEngine.audioElement) {
      audioEngine.audioElement.currentTime = val;
    }
  }, []);

  if (!isVisible) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-transport" role="region" aria-label="Audio playback controls">
      <div className="transport-track-name">{fileName}</div>
      <div className="transport-bar">
        <span className="transport-time">{formatTime(currentTime)}</span>
        <div className="transport-slider-wrap">
          <div
            className="transport-progress"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            }}
          />
          <input
            type="range"
            className="transport-slider"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
            onTouchStart={() => setSeeking(true)}
            onTouchEnd={() => setSeeking(false)}
            aria-label={`Seek position: ${formatTime(currentTime)} of ${formatTime(duration)}`}
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          />
        </div>
        <span className="transport-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
