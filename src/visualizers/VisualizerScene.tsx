import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { audioEngine } from '../audio/AudioEngine';
import { audioData } from '../audio/audioData';
import { BPMDetector } from '../audio/BPMDetector';
import { smoothAudio } from '../audio/SmoothAudio';
import { autoGain } from '../audio/AutoGain';
import { idleBreathing } from '../audio/IdleBreathing';
import { WaveformRibbon } from './WaveformRibbon';
import { FrequencyBars } from './FrequencyBars';
import { ParticleField } from './ParticleField';
import { Kaleidoscope } from './Kaleidoscope';
import { Tunnel } from './Tunnel';
import { SpectrumWaterfall } from './SpectrumWaterfall';
import { AudioFlame } from './AudioFlame';
import { AudioOrbitRing } from './AudioOrbitRing';
import { PostProcessing } from './PostProcessing';
import { BeatCameraPulse } from '../components/BeatCameraPulse';
import { BeatShockwave } from '../components/BeatShockwave';

const bpmDetector = new BPMDetector();

/** Frames without signal before flagging no-signal (~3 seconds at 60fps) */
const NO_SIGNAL_THRESHOLD = 180;

interface Props {
  reducedMotion?: boolean;
}

export function VisualizerScene({ reducedMotion = false }: Props) {
  const mode = useStore((s) => s.mode);
  const prevMode = useStore((s) => s.prevMode);
  const transitionProgress = useStore((s) => s.transitionProgress);
  const isPlaying = useStore((s) => s.isPlaying);
  const audioSource = useStore((s) => s.audioSource);
  const setTransitionProgress = useStore((s) => s.setTransitionProgress);
  const setBpm = useStore((s) => s.setBpm);
  const setAudioLevels = useStore((s) => s.setAudioLevels);
  const setNoSignal = useStore((s) => s.setNoSignal);
  const autoGainEnabled = useStore((s) => s.autoGain);
  const sensitivity = useStore((s) => s.sensitivity);

  // Track frames without audio signal
  const silentFramesRef = useRef(0);
  const wasSignalRef = useRef(false);

  // Reset BPM detector and smooth audio when audio source changes
  useEffect(() => {
    bpmDetector.reset();
    smoothAudio.reset();
    autoGain.reset();
    silentFramesRef.current = 0;
    wasSignalRef.current = false;
    setNoSignal(false);
  }, [audioSource, setNoSignal]);

  // Clean up BPM detector on unmount
  useEffect(() => {
    return () => {
      bpmDetector.reset();
    };
  }, []);

  useFrame(() => {
    if (!isPlaying) return;

    // Update shared audio data container (consumed by visualizers in their useFrame)
    audioData.freq = audioEngine.getFrequencyData();
    audioData.time = audioEngine.getTimeDomainData();

    const level = audioEngine.getAverageLevel();
    const bands = audioEngine.getBandLevels();

    // No-signal detection: flag after ~3s of silence
    const hasSignal = audioEngine.isReceivingAudio();
    if (hasSignal) {
      silentFramesRef.current = 0;
      if (!wasSignalRef.current) {
        wasSignalRef.current = true;
        setNoSignal(false);
      }
      // Stop idle breathing when real audio returns
      if (idleBreathing.isActive) {
        idleBreathing.stop();
      }
    } else {
      silentFramesRef.current++;
      if (silentFramesRef.current === NO_SIGNAL_THRESHOLD) {
        setNoSignal(true);
        // Start idle breathing so visualizers don't flatline
        idleBreathing.start();
      }
    }

    // Idle breathing: inject gentle pseudo-audio when no signal
    if (idleBreathing.isActive && silentFramesRef.current >= NO_SIGNAL_THRESHOLD) {
      const idle = idleBreathing.getLevels();
      idleBreathing.getFrequencyData(audioData.freq);
      idleBreathing.getTimeDomainData(audioData.time);
      setAudioLevels(idle.level, idle.bass, idle.mid, idle.high);

      // Still update smooth audio with idle data
      smoothAudio.update(audioData.freq, sensitivity);
    } else {
      // Auto-gain: normalize quiet/loud tracks to consistent levels
      autoGain.setEnabled(autoGainEnabled);
      const gain = autoGain.update(level);
      const effectiveSensitivity = sensitivity * gain;

      // Update smooth audio analysis (available to all visualizers)
      smoothAudio.update(audioData.freq, effectiveSensitivity);

      // Single set() call per frame instead of 4 — reduces GC pressure and re-renders
      const gainedLevel = Math.min(1, level * gain);
      const gainedBass = Math.min(1, bands.bass * gain);
      const gainedMid = Math.min(1, bands.mid * gain);
      const gainedHigh = Math.min(1, bands.high * gain);
      setAudioLevels(gainedLevel, gainedBass, gainedMid, gainedHigh);

      const bpm = bpmDetector.detect(bands.bass, performance.now());
      if (bpm > 0) setBpm(bpm);
    }

    // Smooth transition (instant when reduced motion)
    if (transitionProgress < 1) {
      const step = reducedMotion ? 1 : 0.03;
      setTransitionProgress(Math.min(1, transitionProgress + step));
    }
  });

  const getOpacity = (m: string) => {
    if (m === mode) {
      return transitionProgress;
    }
    if (m === prevMode && transitionProgress < 1) {
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
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.5}
        maxDistance={15}
        minDistance={3}
      />

      {(mode === 'waveform' || prevMode === 'waveform') && (
        <WaveformRibbon opacity={getOpacity('waveform')} />
      )}
      {(mode === 'frequency' || prevMode === 'frequency') && (
        <FrequencyBars opacity={getOpacity('frequency')} />
      )}
      {(mode === 'particles' || prevMode === 'particles') && (
        <ParticleField opacity={getOpacity('particles')} />
      )}
      {(mode === 'kaleidoscope' || prevMode === 'kaleidoscope') && (
        <Kaleidoscope opacity={getOpacity('kaleidoscope')} />
      )}
      {(mode === 'tunnel' || prevMode === 'tunnel') && (
        <Tunnel opacity={getOpacity('tunnel')} />
      )}
      {(mode === 'waterfall' || prevMode === 'waterfall') && (
        <SpectrumWaterfall opacity={getOpacity('waterfall')} />
      )}
      {(mode === 'flame' || prevMode === 'flame') && (
        <AudioFlame opacity={getOpacity('flame')} />
      )}

      <AudioOrbitRing />
      <BeatCameraPulse />
      <BeatShockwave />
      <PostProcessing reducedMotion={reducedMotion} />
    </>
  );
}
