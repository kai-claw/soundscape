/**
 * Shared mutable audio data container for R3F render loop.
 *
 * WHY: React-three-fiber visualizers need per-frame audio data but
 * passing Uint8Array via refs-as-props causes ESLint react-hooks/refs
 * violations (refs accessed during render). This module provides a
 * shared mutable container that visualizers import directly and read
 * inside useFrame — the correct R3F pattern.
 *
 * Updated by VisualizerScene's useFrame hook.
 * Consumed by individual visualizer components in their useFrame hooks.
 */
export const audioData: { freq: Uint8Array; time: Uint8Array } = {
  freq: new Uint8Array(1024),
  time: new Uint8Array(2048),
};
