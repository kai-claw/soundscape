import { useRef, useCallback } from 'react';
import { useStore, type VisualizationMode, type ColorTheme, EXPERIENCE_PRESETS } from '../store/useStore';
import { audioEngine } from '../audio/AudioEngine';
import { themeMap } from '../themes/colorThemes';
import { MiniSpectrum } from './MiniSpectrum';
import { ShareButton } from './ShareButton';

const modes: { id: VisualizationMode; label: string; key: string }[] = [
  { id: 'waveform', label: '🌊 Waveform', key: '1' },
  { id: 'frequency', label: '📊 Frequency', key: '2' },
  { id: 'particles', label: '✨ Particles', key: '3' },
  { id: 'kaleidoscope', label: '🔮 Kaleidoscope', key: '4' },
  { id: 'tunnel', label: '🕳️ Tunnel', key: '5' },
  { id: 'waterfall', label: '🏔️ Waterfall', key: '6' },
  { id: 'flame', label: '🔥 Flame', key: '7' },
];

const themes: { id: ColorTheme; label: string }[] = [
  { id: 'neon', label: '💜 Neon' },
  { id: 'sunset', label: '🌅 Sunset' },
  { id: 'ocean', label: '🌊 Ocean' },
  { id: 'monochrome', label: '⚪ Mono' },
  { id: 'arctic', label: '❄️ Arctic' },
  { id: 'forest', label: '🌲 Forest' },
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
  const noSignal = useStore((s) => s.noSignal);
  const cinematic = useStore((s) => s.cinematic);
  const starfield = useStore((s) => s.starfield);
  const orbitRing = useStore((s) => s.orbitRing);
  const beatPulse = useStore((s) => s.beatPulse);
  const shockwave = useStore((s) => s.shockwave);
  const panelCollapsed = useStore((s) => s.panelCollapsed);
  const activePreset = useStore((s) => s.activePreset);
  const toggleCinematic = useStore((s) => s.toggleCinematic);
  const toggleStarfield = useStore((s) => s.toggleStarfield);
  const toggleOrbitRing = useStore((s) => s.toggleOrbitRing);
  const toggleBeatPulse = useStore((s) => s.toggleBeatPulse);
  const toggleShockwave = useStore((s) => s.toggleShockwave);
  const togglePanelCollapsed = useStore((s) => s.togglePanelCollapsed);
  const autoGainEnabled = useStore((s) => s.autoGain);
  const toggleAutoGain = useStore((s) => s.toggleAutoGain);
  const applyPreset = useStore((s) => s.applyPreset);
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

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `soundscape-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // WebGL preserveDrawingBuffer might not be set — fallback
      alert('Screenshot failed. Try again while the visualization is active.');
    }
  }, []);

  // Collapsed state — just show header bar
  if (panelCollapsed) {
    return (
      <div
        id="controls"
        className="control-panel control-panel-collapsed"
        role="region"
        aria-label="Visualizer Controls (collapsed)"
        tabIndex={-1}
        style={{ borderColor: themeColors.primary + '40' }}
      >
        <div className="collapsed-bar">
          <h2 style={{ color: themeColors.primary }}>SoundScape</h2>
          <div className="collapsed-info">
            <div className="level-meter level-meter-sm">
              <div
                className="level-fill"
                style={{
                  width: `${audioLevel * 100}%`,
                  background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              />
            </div>
            {bpm > 0 && !noSignal && (
              <span className="bpm" style={{ color: themeColors.accent }}>{bpm} BPM</span>
            )}
          </div>
          <button
            className="panel-toggle-btn"
            onClick={togglePanelCollapsed}
            aria-label="Expand control panel (key P)"
            title="Expand (P)"
          >
            ◀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="controls" className="control-panel" role="region" aria-label="Visualizer Controls" tabIndex={-1} style={{ borderColor: themeColors.primary + '40' }}>
      <div className="panel-header">
        <div className="panel-header-row">
          <h2 style={{ color: themeColors.primary }}>SoundScape</h2>
          <div className="panel-header-actions">
            <ShareButton />
            <button
              className="icon-btn"
              onClick={handleScreenshot}
              aria-label="Capture screenshot"
              title="Screenshot"
            >
              📸
            </button>
            <button
              className="icon-btn"
              onClick={togglePanelCollapsed}
              aria-label="Collapse panel (key P)"
              title="Collapse (P)"
            >
              ▶
            </button>
          </div>
        </div>
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
          {noSignal && (
            <span className="no-signal" title="No audio signal detected">
              🔇 No signal
            </span>
          )}
          {bpm > 0 && !noSignal && (
            <span className="bpm" style={{ color: themeColors.accent }}>
              {bpm} BPM
            </span>
          )}
        </div>
      </div>

      {/* Mini spectrum analyzer */}
      <MiniSpectrum />

      {/* Experience Presets */}
      <div className="control-section">
        <label id="preset-label">Presets</label>
        <div className="preset-grid" role="group" aria-labelledby="preset-label">
          {EXPERIENCE_PRESETS.map((p) => (
            <button
              key={p.id}
              className={`preset-btn${activePreset === p.id ? ' active' : ''}`}
              onClick={() => applyPreset(p)}
              aria-pressed={activePreset === p.id}
              aria-label={`${p.name} preset: ${p.description}`}
              title={p.description}
              style={activePreset === p.id ? { background: themeColors.primary + '25', borderColor: themeColors.primary } : {}}
            >
              <span className="preset-icon">{p.icon}</span>
              <span className="preset-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <label id="source-label">Audio Source</label>
        <div className="source-toggle" role="group" aria-labelledby="source-label">
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
        <label id="mode-label">Mode <span className="hint">(1-7)</span></label>
        <div className="mode-grid" role="group" aria-labelledby="mode-label">
          {modes.map((m) => (
            <button
              key={m.id}
              className={mode === m.id ? 'active' : ''}
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              aria-label={`${m.label} mode (key ${m.key})`}
              style={mode === m.id ? { background: themeColors.primary + '30', borderColor: themeColors.primary } : {}}
            >
              {m.label}
              <span className="key-hint" aria-hidden="true">{m.key}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <label id="theme-label">Theme <span className="hint">(T)</span></label>
        <div className="theme-grid" role="group" aria-labelledby="theme-label">
          {themes.map((t) => (
            <button
              key={t.id}
              className={theme === t.id ? 'active' : ''}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              aria-label={`${t.label} theme`}
              style={theme === t.id ? { background: themeMap[t.id].primary + '30', borderColor: themeMap[t.id].primary } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <div className="sensitivity-header">
          <label id="sensitivity-label">Sensitivity: {sensitivity.toFixed(1)}x</label>
          <button
            className={`auto-gain-btn${autoGainEnabled ? ' active' : ''}`}
            onClick={toggleAutoGain}
            aria-pressed={autoGainEnabled}
            aria-label={`Auto-gain ${autoGainEnabled ? 'on' : 'off'} (key G)`}
            title={`Auto-gain: ${autoGainEnabled ? 'ON' : 'OFF'} (G)`}
            style={autoGainEnabled ? { color: themeColors.accent, borderColor: themeColors.accent + '60' } : {}}
          >
            {autoGainEnabled ? '🎚️ Auto' : '🔇 Manual'}
          </button>
        </div>
        <input
          type="range"
          aria-labelledby="sensitivity-label"
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
          aria-label={isPlaying ? 'Pause audio (Space)' : 'Play audio (Space)'}
          style={{ background: themeColors.primary + '20', borderColor: themeColors.primary }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'} <span className="hint" aria-hidden="true">(Space)</span>
        </button>
      </div>

      <div className="control-section">
        <label>Experience</label>
        <div className="experience-grid">
          <button
            className={`experience-btn${cinematic ? ' active cinematic-active' : ''}`}
            onClick={toggleCinematic}
            aria-pressed={cinematic}
            aria-label="Toggle cinematic autoplay (key C)"
          >
            🎬 Cinematic <span className="key-hint" aria-hidden="true">C</span>
          </button>
          <button
            className={`experience-btn${starfield ? ' active starfield-active' : ''}`}
            onClick={toggleStarfield}
            aria-pressed={starfield}
            aria-label="Toggle starfield background (key S)"
          >
            ✦ Starfield <span className="key-hint" aria-hidden="true">S</span>
          </button>
          <button
            className={`experience-btn${orbitRing ? ' active orbitring-active' : ''}`}
            onClick={toggleOrbitRing}
            aria-pressed={orbitRing}
            aria-label="Toggle orbit ring overlay (key O)"
          >
            ◎ Orbit Ring <span className="key-hint" aria-hidden="true">O</span>
          </button>
          <button
            className={`experience-btn${beatPulse ? ' active beatpulse-active' : ''}`}
            onClick={toggleBeatPulse}
            aria-pressed={beatPulse}
            aria-label="Toggle beat camera pulse (key B)"
          >
            💓 Beat Pulse <span className="key-hint" aria-hidden="true">B</span>
          </button>
          <button
            className={`experience-btn${shockwave ? ' active shockwave-active' : ''}`}
            onClick={toggleShockwave}
            aria-pressed={shockwave}
            aria-label="Toggle beat shockwave (key W)"
          >
            💥 Shockwave <span className="key-hint" aria-hidden="true">W</span>
          </button>
        </div>
      </div>

      <div className="shortcuts-hint" aria-hidden="true">
        <span>1-7: Modes</span>
        <span>T: Theme</span>
        <span>C: Cinema</span>
        <span>W: Wave</span>
        <span>P: Panel</span>
        <span>H: Help</span>
      </div>
    </div>
  );
}
