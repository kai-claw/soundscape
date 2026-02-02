import { useRef, useCallback } from 'react';
import { useStore, type VisualizationMode, type ColorTheme } from '../store/useStore';
import { audioEngine } from '../audio/AudioEngine';
import { themeMap } from '../themes/colorThemes';

const modes: { id: VisualizationMode; label: string; key: string }[] = [
  { id: 'waveform', label: '🌊 Waveform', key: '1' },
  { id: 'frequency', label: '📊 Frequency', key: '2' },
  { id: 'particles', label: '✨ Particles', key: '3' },
  { id: 'kaleidoscope', label: '🔮 Kaleidoscope', key: '4' },
  { id: 'tunnel', label: '🕳️ Tunnel', key: '5' },
];

const themes: { id: ColorTheme; label: string }[] = [
  { id: 'neon', label: '💜 Neon' },
  { id: 'sunset', label: '🌅 Sunset' },
  { id: 'ocean', label: '🌊 Ocean' },
  { id: 'monochrome', label: '⚪ Mono' },
];

export function ControlPanel() {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);
  const audioSource = useStore((s) => s.audioSource);
  const isPlaying = useStore((s) => s.isPlaying);
  const bpm = useStore((s) => s.bpm);
  const audioLevel = useStore((s) => s.audioLevel);
  const fileName = useStore((s) => s.fileName);
  const setMode = useStore((s) => s.setMode);
  const setTheme = useStore((s) => s.setTheme);
  const setSensitivity = useStore((s) => s.setSensitivity);
  const setAudioSource = useStore((s) => s.setAudioSource);
  const togglePlay = useStore((s) => s.togglePlay);
  const setFileName = useStore((s) => s.setFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeColors = themeMap[theme];

  const handleMicConnect = useCallback(async () => {
    setAudioSource('mic');
    setFileName(null);
    try {
      await audioEngine.connectMic();
    } catch {
      alert('Could not access microphone. Please allow mic access.');
    }
  }, [setAudioSource, setFileName]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioSource('file');
    setFileName(file.name);
    audioEngine.connectFile(file);
  }, [setAudioSource, setFileName]);

  return (
    <div className="control-panel" style={{ borderColor: themeColors.primary + '40' }}>
      <div className="panel-header">
        <h2 style={{ color: themeColors.primary }}>SoundScape</h2>
        <div className="status-bar">
          <div className="level-meter">
            <div
              className="level-fill"
              style={{
                width: `${audioLevel * 100}%`,
                background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            />
          </div>
          {bpm > 0 && (
            <span className="bpm" style={{ color: themeColors.accent }}>
              {bpm} BPM
            </span>
          )}
        </div>
      </div>

      <div className="control-section">
        <label>Audio Source</label>
        <div className="source-toggle">
          <button
            className={audioSource === 'mic' ? 'active' : ''}
            onClick={handleMicConnect}
            style={audioSource === 'mic' ? { background: themeColors.primary + '30', borderColor: themeColors.primary } : {}}
          >
            🎤 Mic
          </button>
          <button
            className={audioSource === 'file' ? 'active' : ''}
            onClick={() => fileInputRef.current?.click()}
            style={audioSource === 'file' ? { background: themeColors.primary + '30', borderColor: themeColors.primary } : {}}
          >
            📁 File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
        {fileName && <span className="file-name">{fileName}</span>}
      </div>

      <div className="control-section">
        <label>Mode <span className="hint">(1-5)</span></label>
        <div className="mode-grid">
          {modes.map((m) => (
            <button
              key={m.id}
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              style={mode === m.id ? { background: themeColors.primary + '30', borderColor: themeColors.primary } : {}}
            >
              {m.label}
              <span className="key-hint">{m.key}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <label>Theme <span className="hint">(T)</span></label>
        <div className="theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              className={theme === t.id ? 'active' : ''}
              onClick={() => setTheme(t.id)}
              style={theme === t.id ? { background: themeMap[t.id].primary + '30', borderColor: themeMap[t.id].primary } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <label>Sensitivity: {sensitivity.toFixed(1)}x</label>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={sensitivity}
          onChange={(e) => setSensitivity(parseFloat(e.target.value))}
          style={{ accentColor: themeColors.primary }}
        />
      </div>

      <div className="control-section">
        <button
          className="play-btn"
          onClick={togglePlay}
          style={{ background: themeColors.primary + '20', borderColor: themeColors.primary }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'} <span className="hint">(Space)</span>
        </button>
      </div>

      <div className="shortcuts-hint">
        <span>1-5: Modes</span>
        <span>T: Theme</span>
        <span>Space: Pause</span>
      </div>
    </div>
  );
}
