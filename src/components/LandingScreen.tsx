import { useState, useCallback, useRef, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useStore } from '../store/useStore';

/** Rotating taglines — each visit feels slightly different */
const taglines = [
  'See what sound looks like',
  'Where music becomes light',
  'Audio-Reactive 3D Visualizer',
  'Turn up. Tune in. See everything.',
  'Your music, reimagined in 3D',
];

export function LandingScreen({ onStart }: { onStart: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setAudioSource = useStore((s) => s.setAudioSource);
  const setFileName = useStore((s) => s.setFileName);

  // Pick a random tagline on mount
  const [tagline] = useState(() => taglines[Math.floor(Math.random() * taglines.length)]);

  // Typewriter effect for tagline
  const [displayedTagline, setDisplayedTagline] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedTagline(tagline.slice(0, i));
      if (i >= tagline.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [tagline]);

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
      {/* Atmospheric background — layered rings + floating dust */}
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
      <div className="landing-dust" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="dust-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient gradient wash */}
      <div className="landing-gradient" aria-hidden="true" />

      <div className="landing-content">
        <div className="landing-icon" aria-hidden="true">
          <span className="landing-icon-inner">🎵</span>
        </div>
        <h1 className="landing-title">
          Sound<span>Scape</span>
        </h1>
        <p className="landing-subtitle landing-typewriter">
          {displayedTagline}
          <span className="typewriter-cursor" aria-hidden="true">|</span>
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

        {loading && (
          <div className="landing-loading" aria-live="polite">
            <div className="loading-wave">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="loading-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <span>Connecting...</span>
          </div>
        )}

        {error && <p className="landing-error" role="alert">{error}</p>}

        <div className="landing-features">
          <span>🌊 Waveform</span>
          <span>📊 Frequency</span>
          <span>✨ Particles</span>
          <span>🔮 Kaleidoscope</span>
          <span>🕳️ Tunnel</span>
          <span>🏔️ Waterfall</span>
          <span>🔥 Flame</span>
        </div>

        <p className="landing-hint" aria-hidden="true">
          7 modes · 6 themes · 8 presets · keyboard shortcuts
        </p>
      </div>
    </div>
  );
}
