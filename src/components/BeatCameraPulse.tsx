import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';

/**
 * BeatCameraPulse — Subtle FOV pump on bass hits.
 *
 * Creates a visceral "breathing" camera effect synced to the music's bass energy.
 * Uses an impulse-decay model: bass spikes push the FOV wider, which then
 * smoothly springs back. The result is a VJ-grade immersive pump that
 * makes the entire scene feel alive.
 */

const BASE_FOV = 60;
const MAX_FOV_DELTA = 8;       // max FOV increase on strongest hits
const IMPULSE_THRESHOLD = 0.4; // bass level needed to trigger a pulse
const ATTACK_SPEED = 0.3;      // how fast FOV jumps on hit
const DECAY_SPEED = 0.04;      // how fast FOV returns to baseline (spring-like)

export function BeatCameraPulse() {
  const camera = useThree((state) => state.camera);
  const pulseRef = useRef(0); // current pulse amount (0 = no pulse, 1 = max)
  const prevBassRef = useRef(0);

  useFrame(() => {
    const bassLevel = useStore.getState().bassLevel;
    const sensitivity = useStore.getState().sensitivity;

    // Onset detection: trigger pulse on rising bass that exceeds threshold
    const adjustedBass = bassLevel * sensitivity;
    const isOnset =
      adjustedBass > IMPULSE_THRESHOLD &&
      adjustedBass > prevBassRef.current * 1.3; // must be 30% higher than last frame
    prevBassRef.current = adjustedBass;

    if (isOnset) {
      // Push toward max (don't overshoot)
      pulseRef.current = Math.min(
        1,
        pulseRef.current + ATTACK_SPEED * adjustedBass,
      );
    }

    // Spring decay back to zero
    pulseRef.current *= 1 - DECAY_SPEED;
    if (pulseRef.current < 0.001) pulseRef.current = 0;

    // Apply FOV
    const fov = BASE_FOV + pulseRef.current * MAX_FOV_DELTA;
    if ('fov' in camera && Math.abs((camera as { fov: number }).fov - fov) > 0.01) {
      (camera as { fov: number }).fov = fov;
      (camera as { updateProjectionMatrix: () => void }).updateProjectionMatrix();
    }
  });

  return null;
}
