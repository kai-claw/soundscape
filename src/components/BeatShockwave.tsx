import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';

/**
 * BeatShockwave — Expanding ring shockwave triggered by strong bass hits.
 *
 * On bass threshold crossing, spawns an expanding torus ring that grows
 * outward and fades. Multiple rings can overlap. Togglable as an
 * "Experience" overlay that works with any visualization mode.
 */

/** Max simultaneous shockwave rings */
const MAX_RINGS = 4;
/** Expansion speed (units per second) */
const EXPAND_SPEED = 6.0;
/** Lifetime in seconds */
const LIFETIME = 1.2;
/** Bass threshold to trigger a new ring (0-1) */
const BASS_THRESHOLD = 0.65;
/** Minimum time between triggers (ms) */
const COOLDOWN_MS = 300;

interface RingState {
  active: boolean;
  age: number;
  scale: number;
}

export function BeatShockwave() {
  const shockwave: boolean = useStore((s) => s.shockwave);
  const theme = useStore((s) => s.theme);
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);

  const groupRef = useRef<THREE.Group>(null);
  const statesRef = useRef<RingState[]>(
    Array.from({ length: MAX_RINGS }, () => ({ active: false, age: 0, scale: 0 })),
  );
  const lastTriggerRef = useRef(0);
  const prevBassRef = useRef(0);

  // Shared torus geometry for all rings
  const torusGeo = useMemo(() => new THREE.TorusGeometry(1, 0.03, 8, 64), []);

  // Materials — one per ring so opacity can differ
  const materials = useMemo(
    () =>
      Array.from({ length: MAX_RINGS }, () =>
        new THREE.MeshBasicMaterial({
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      ),
    [],
  );

  useEffect(() => {
    return () => {
      torusGeo.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [torusGeo, materials]);

  useFrame((_, delta) => {
    if (!shockwave || !groupRef.current) return;

    const now = performance.now();
    const states = statesRef.current;
    const children = groupRef.current.children;
    const adjustedThreshold = BASS_THRESHOLD / Math.max(sensitivity, 0.1);

    // --- Trigger detection: bass crosses threshold upward ---
    const bass = bassLevel;
    if (
      bass > adjustedThreshold &&
      prevBassRef.current <= adjustedThreshold &&
      now - lastTriggerRef.current > COOLDOWN_MS
    ) {
      // Find an inactive ring slot
      const slot = states.findIndex((s) => !s.active);
      if (slot !== -1) {
        states[slot].active = true;
        states[slot].age = 0;
        states[slot].scale = 0.1;
        lastTriggerRef.current = now;
      }
    }
    prevBassRef.current = bass;

    // --- Update rings ---
    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 3); // accent color

    for (let i = 0; i < MAX_RINGS; i++) {
      const mesh = children[i] as THREE.Mesh;
      if (!mesh) continue;
      const state = states[i];

      if (!state.active) {
        mesh.visible = false;
        continue;
      }

      state.age += delta;
      if (state.age >= LIFETIME) {
        state.active = false;
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;

      // Expand
      state.scale += EXPAND_SPEED * delta;
      const s = state.scale;
      mesh.scale.set(s, s, s);

      // Fade out with age
      const lifeT = state.age / LIFETIME;
      const alpha = (1 - lifeT * lifeT) * 0.7; // quadratic fade

      // Color lerps from primary to accent as it expands
      const mat = materials[i];
      mat.color.setRGB(
        c0[0] + (c1[0] - c0[0]) * lifeT,
        c0[1] + (c1[1] - c0[1]) * lifeT,
        c0[2] + (c1[2] - c0[2]) * lifeT,
      );
      mat.opacity = alpha;

      // Slight rotation for visual interest
      mesh.rotation.x = Math.PI / 2 + lifeT * 0.3;
      mesh.rotation.z = state.age * 0.5;
    }
  });

  if (!shockwave) return null;

  return (
    <group ref={groupRef}>
      {materials.map((mat, i) => (
        <mesh key={i} geometry={torusGeo} material={mat} visible={false} />
      ))}
    </group>
  );
}
