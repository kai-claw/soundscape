import { useState, useCallback, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useStore } from '../store/useStore';

export function LandingScreen({ onStart }: { onStart: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setAudioSource = useStore((s) => s.setAudioSource);
  const setFileName = useStore((s) => s.setFileName);

  const handleMic = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await audioEngine.connectMic();
      setAudioSource('mic');
      onStart();
    } catch {
      setError('Microphone access denied. Please allow mic access and try again.');
      setLoading(false);
    }
  }, [onStart, setAudioSource]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      audioEngine.connectFile(file);
      setAudioSource('file');
      setFileName(file.name);
      onStart();
    } catch {
      setError('Could not load audio file.');
      setLoading(false);
    }
  }, [onStart, setAudioSource, setFileName]);

  return (
    <div className="landing" role="main" aria-label="SoundScape - Audio-Reactive 3D Visualizer">
      <div className="landing-bg">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="landing-ring"
            style={{
              animationDelay: `${i * 0.15}s`,
              opacity: 0.03 + (i % 5) * 0.01,
            }}
          />
        ))}
      </div>

      <div className="landing-content">
        <div className="landing-icon">🎵</div>
        <h1 className="landing-title">
          Sound<span>Scape</span>
        </h1>
        <p className="landing-subtitle">
          Audio-Reactive 3D Visualizer
        </p>

        <div className="landing-actions">
          <button
            className="landing-btn primary"
            onClick={handleMic}
            disabled={loading}
            aria-label="Use microphone for live audio visualization"
          >
            <span className="btn-icon">🎤</span>
            <span className="btn-text">
              <strong>Use Microphone</strong>
              <small>Visualize live audio</small>
            </span>
          </button>

          <button
            className="landing-btn secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload audio file for visualization"
          >
            <span className="btn-icon">📁</span>
            <span className="btn-text">
              <strong>Upload Audio</strong>
              <small>MP3, WAV, OGG, FLAC</small>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        {error && <p className="landing-error">{error}</p>}

        <div className="landing-features">
          <span>🌊 Waveform</span>
          <span>📊 Frequency</span>
          <span>✨ Particles</span>
          <span>🔮 Kaleidoscope</span>
          <span>🕳️ Tunnel</span>
        </div>
      </div>
    </div>
  );
}
