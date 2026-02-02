import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { VisualizerScene } from './visualizers/VisualizerScene';
import { ControlPanel } from './components/ControlPanel';
import { KeyboardHandler } from './components/KeyboardHandler';
import { LandingScreen } from './components/LandingScreen';
import { AudioTransport } from './components/AudioTransport';
import { BeatFlash } from './components/BeatFlash';
import { FullscreenBtn } from './components/FullscreenBtn';
import { useStore } from './store/useStore';
import { themeMap } from './themes/colorThemes';

function App() {
  const theme = useStore((s) => s.theme);
  const colors = themeMap[theme];
  const [started, setStarted] = useState(false);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  if (!started) {
    return <LandingScreen onStart={handleStart} />;
  }

  return (
    <div className="app" style={{ background: colors.background }}>
      <KeyboardHandler />
      <Canvas
        camera={{ position: [0, 2, 7], fov: 60 }}
        dpr={[1, 2]}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[colors.background]} />
        <fog attach="fog" args={[colors.background, 8, 25]} />
        <VisualizerScene />
      </Canvas>
      <BeatFlash />
      <ControlPanel />
      <AudioTransport />
      <FullscreenBtn />
    </div>
  );
}

export default App;
