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

  const updateTime = useCallback(() => {
    const el = audioEngine.audioElement;
    if (el && !seeking) {
      setCurrentTime(el.currentTime);
      if (el.duration && isFinite(el.duration)) {
        setDuration(el.duration);
      }
    }
    rafRef.current = requestAnimationFrame(updateTime);
  }, [seeking]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateTime]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioEngine.audioElement) {
      audioEngine.audioElement.currentTime = val;
    }
  }, []);

  if (audioSource !== 'file' || !fileName) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-transport">
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
          />
        </div>
        <span className="transport-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
