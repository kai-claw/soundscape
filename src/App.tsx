import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { VisualizerScene } from './visualizers/VisualizerScene';
import { ControlPanel } from './components/ControlPanel';
import { KeyboardHandler } from './components/KeyboardHandler';
import { LandingScreen } from './components/LandingScreen';
import { AudioTransport } from './components/AudioTransport';
import { BeatFlash } from './components/BeatFlash';
import { FullscreenBtn } from './components/FullscreenBtn';
import { HelpOverlay } from './components/HelpOverlay';
import { TouchHandler } from './components/TouchHandler';
import { A11yAnnouncer } from './components/A11yAnnouncer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CinematicBadge } from './components/CinematicBadge';
import { BpmDisplay } from './components/BpmDisplay';
import { FpsCounter } from './components/FpsCounter';
import { Starfield } from './visualizers/Starfield';
import { useStore } from './store/useStore';
import { themeMap } from './themes/colorThemes';
import { audioEngine, AudioEngine } from './audio/AudioEngine';
import { parseUrlConfig } from './utils/urlState';

function App() {
  const theme = useStore((s) => s.theme);
  const showFps = useStore((s) => s.showFps);
  const colors = themeMap[theme];
  const [started, setStarted] = useState(false);
  const [webglLost, setWebglLost] = useState(false);
  const [fileError, setFileError] = useState('');
  const contextListenersRef = useRef<{ lost: EventListener; restored: EventListener } | null>(null);

  // Apply URL config on mount (e.g., shared link)
  useEffect(() => {
    const urlConfig = parseUrlConfig();
    if (urlConfig) {
      const store = useStore.getState();
      if (urlConfig.mode) store.setMode(urlConfig.mode);
      if (urlConfig.theme) store.setTheme(urlConfig.theme);
      if (urlConfig.sensitivity !== undefined) store.setSensitivity(urlConfig.sensitivity);
      if (urlConfig.cinematic !== undefined && urlConfig.cinematic !== store.cinematic) store.toggleCinematic();
      if (urlConfig.starfield !== undefined && urlConfig.starfield !== store.starfield) store.toggleStarfield();
      if (urlConfig.orbitRing !== undefined && urlConfig.orbitRing !== store.orbitRing) store.toggleOrbitRing();
      if (urlConfig.beatPulse !== undefined && urlConfig.beatPulse !== store.beatPulse) store.toggleBeatPulse();
      if (urlConfig.shockwave !== undefined && urlConfig.shockwave !== store.shockwave) store.toggleShockwave();
    }
  }, []);

  const [unsupported] = useState(() => {
    const support = AudioEngine.checkSupport();
    if (!support.webgl) {
      return 'Your browser does not support WebGL, which is required for 3D visualizations.';
    }
    if (!support.audio) {
      return 'Your browser does not support the Web Audio API, which is required for audio analysis.';
    }
    return '';
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Wire up file error callback
  useEffect(() => {
    audioEngine.onFileError = (msg) => {
      setFileError(msg);
    };
    return () => {
      audioEngine.onFileError = null;
    };
  }, []);

  // Auto-dismiss file error after 6 seconds
  useEffect(() => {
    if (!fileError) return;
    const timer = setTimeout(() => setFileError(''), 6000);
    return () => clearTimeout(timer);
  }, [fileError]);

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Resume AudioContext on visibility change (tab comes back to focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        audioEngine.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.destroy();
    };
  }, []);

  // Cleanup WebGL context listeners on unmount
  useEffect(() => {
    return () => {
      // Context listeners are cleaned up when canvas is destroyed
      contextListenersRef.current = null;
    };
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  // Show unsupported message
  if (unsupported) {
    return (
      <div className="landing" role="alert">
        <div className="landing-content">
          <div className="landing-icon" aria-hidden="true">⚠️</div>
          <h1 className="landing-title">Browser Not Supported</h1>
          <p className="landing-subtitle">{unsupported}</p>
          <p className="landing-subtitle" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Please use a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      </div>
    );
  }

  if (!started) {
    return <LandingScreen onStart={handleStart} />;
  }

  return (
    <ErrorBoundary>
      <div
        className={`app${prefersReducedMotion ? ' reduced-motion' : ''}`}
        style={{ background: colors.background }}
        role="application"
        aria-label="SoundScape audio-reactive 3D visualizer"
      >
        {/* Skip link for keyboard users */}
        <a href="#controls" className="skip-link">
          Skip to controls
        </a>

        <KeyboardHandler />
        <TouchHandler />
        <A11yAnnouncer />
        <HelpOverlay />

        {/* WebGL context loss notification */}
        {webglLost && (
          <div className="context-lost-banner" role="alert">
            <span>⚠️ Graphics context lost — attempting to restore...</span>
            <button onClick={() => window.location.reload()} className="context-lost-reload">
              Reload Page
            </button>
          </div>
        )}

        {/* File error notification */}
        {fileError && (
          <div className="file-error-banner" role="alert">
            <span>🔇 {fileError}</span>
            <button onClick={() => setFileError('')} className="file-error-dismiss" aria-label="Dismiss error">
              ✕
            </button>
          </div>
        )}

        <Canvas
          camera={{ position: [0, 2, 7], fov: 60 }}
          dpr={[1, 2]}
          style={{ position: 'absolute', inset: 0 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          aria-hidden="true"
          onCreated={({ gl }) => {
            // Handle WebGL context loss gracefully
            const canvas = gl.domElement;
            const onLost = (e: Event) => {
              e.preventDefault();
              console.warn('[SoundScape] WebGL context lost — will attempt restore');
              setWebglLost(true);
            };
            const onRestored = () => {
              console.info('[SoundScape] WebGL context restored');
              setWebglLost(false);
            };
            canvas.addEventListener('webglcontextlost', onLost);
            canvas.addEventListener('webglcontextrestored', onRestored);
            contextListenersRef.current = { lost: onLost, restored: onRestored };
          }}
        >
          <color attach="background" args={[colors.background]} />
          <fog attach="fog" args={[colors.background, 8, 25]} />
          <Starfield />
          <VisualizerScene reducedMotion={prefersReducedMotion} />
        </Canvas>
        {!prefersReducedMotion && <BeatFlash />}
        <CinematicBadge />
        <BpmDisplay />
        <FpsCounter visible={showFps} />
        <ControlPanel />
        <AudioTransport />
        <FullscreenBtn />
      </div>
    </ErrorBoundary>
  );
}

export default App;
