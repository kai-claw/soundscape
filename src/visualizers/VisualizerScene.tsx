import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { audioEngine } from '../audio/AudioEngine';
import { BPMDetector } from '../audio/BPMDetector';
import { WaveformRibbon } from './WaveformRibbon';
import { FrequencyBars } from './FrequencyBars';
import { ParticleField } from './ParticleField';
import { Kaleidoscope } from './Kaleidoscope';
import { Tunnel } from './Tunnel';
import { PostProcessing } from './PostProcessing';

const bpmDetector = new BPMDetector();

export function VisualizerScene() {
  const freqRef = useRef<Uint8Array>(new Uint8Array(1024));
  const timeRef = useRef<Uint8Array>(new Uint8Array(2048));
  const mode = useStore((s) => s.mode);
  const prevMode = useStore((s) => s.prevMode);
  const transitionProgress = useStore((s) => s.transitionProgress);
  const isPlaying = useStore((s) => s.isPlaying);
  const setTransitionProgress = useStore((s) => s.setTransitionProgress);
  const setBpm = useStore((s) => s.setBpm);
  const setAudioLevel = useStore((s) => s.setAudioLevel);
  const setBassLevel = useStore((s) => s.setBassLevel);
  const setMidLevel = useStore((s) => s.setMidLevel);
  const setHighLevel = useStore((s) => s.setHighLevel);

  const prevModeRef = useRef(prevMode);
  useEffect(() => {
    prevModeRef.current = prevMode;
  }, [prevMode]);

  useFrame(() => {
    if (!isPlaying) return;

    freqRef.current = audioEngine.getFrequencyData();
    timeRef.current = audioEngine.getTimeDomainData();

    const level = audioEngine.getAverageLevel();
    const bands = audioEngine.getBandLevels();
    setAudioLevel(level);
    setBassLevel(bands.bass);
    setMidLevel(bands.mid);
    setHighLevel(bands.high);

    const bpm = bpmDetector.detect(bands.bass, performance.now());
    if (bpm > 0) setBpm(bpm);

    // Smooth transition
    if (transitionProgress < 1) {
      setTransitionProgress(Math.min(1, transitionProgress + 0.03));
    }
  });

  const getOpacity = (m: string) => {
    if (m === mode) {
      return transitionProgress;
    }
    if (m === prevModeRef.current && transitionProgress < 1) {
      return 1 - transitionProgress;
    }
    return 0;
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8844ff" />
      <Environment preset="night" />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxDistance={15}
        minDistance={3}
      />

      {(mode === 'waveform' || prevModeRef.current === 'waveform') && (
        <WaveformRibbon timeData={timeRef.current} opacity={getOpacity('waveform')} />
      )}
      {(mode === 'frequency' || prevModeRef.current === 'frequency') && (
        <FrequencyBars freqData={freqRef.current} opacity={getOpacity('frequency')} />
      )}
      {(mode === 'particles' || prevModeRef.current === 'particles') && (
        <ParticleField freqData={freqRef.current} opacity={getOpacity('particles')} />
      )}
      {(mode === 'kaleidoscope' || prevModeRef.current === 'kaleidoscope') && (
        <Kaleidoscope freqData={freqRef.current} opacity={getOpacity('kaleidoscope')} />
      )}
      {(mode === 'tunnel' || prevModeRef.current === 'tunnel') && (
        <Tunnel freqData={freqRef.current} opacity={getOpacity('tunnel')} />
      )}

      <PostProcessing />
    </>
  );
}
