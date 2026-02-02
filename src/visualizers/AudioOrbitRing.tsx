import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor, lerpColor } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

/**
 * AudioOrbitRing — Circular frequency mandala overlay.
 *
 * A ring of points where each point's distance from center = frequency amplitude.
 * Creates a pulsing, rotating mandala-like shape that visualizes the full
 * frequency spectrum as a radial form. Always visible as an ambient overlay
 * (like the starfield), adding a signature SoundScape element to every mode.
 *
 * The ring slowly rotates and subtly tilts, with bass energy controlling
 * the overall scale pulse and high frequencies creating fine detail spikes.
 */

const BASE_RADIUS = 3.5;
const MAX_SPIKE = 2.0;
const INNER_RING_SCALE = 0.6;

export function AudioOrbitRing() {
  const outerRef = useRef<THREE.Line>(null);
  const innerRef = useRef<THREE.Line>(null);
  const groupRef = useRef<THREE.Group>(null);
  const visible = useStore((s) => s.orbitRing);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);
  const ringPoints = useStore((s) => s.performanceSettings.orbitRingPoints);

  // Pre-allocate position buffers (ring + closing point = ringPoints + 1)
  const outerPositions = useMemo(() => new Float32Array((ringPoints + 1) * 3), [ringPoints]);
  const outerColors = useMemo(() => new Float32Array((ringPoints + 1) * 3), [ringPoints]);
  const innerPositions = useMemo(() => new Float32Array((ringPoints + 1) * 3), [ringPoints]);
  const innerColors = useMemo(() => new Float32Array((ringPoints + 1) * 3), [ringPoints]);

  // Pre-create Line objects (avoid JSX <line> which conflicts with SVG intrinsic)
  const outerLine = useMemo(() => new THREE.Line(), []);
  const innerLine = useMemo(() => new THREE.Line(), []);

  const outerGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(outerColors, 3));
    return geo;
  }, [outerPositions, outerColors]);

  const innerGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(innerPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(innerColors, 3));
    return geo;
  }, [innerPositions, innerColors]);

  const outerMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        linewidth: 1,
      }),
    [],
  );

  const innerMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        linewidth: 1,
      }),
    [],
  );

  // Assign geometry + material to line objects
  useEffect(() => {
    outerLine.geometry = outerGeometry;
    outerLine.material = outerMaterial;
    innerLine.geometry = innerGeometry;
    innerLine.material = innerMaterial;
    outerRef.current = outerLine;
    innerRef.current = innerLine;
  }, [outerLine, innerLine, outerGeometry, innerGeometry, outerMaterial, innerMaterial]);

  useEffect(() => {
    return () => {
      outerGeometry.dispose();
      innerGeometry.dispose();
      outerMaterial.dispose();
      innerMaterial.dispose();
    };
  }, [outerGeometry, innerGeometry, outerMaterial, innerMaterial]);

  // Smooth bass for scale pulse (avoids jitter)
  const smoothBass = useRef(0);

  useFrame(({ clock }) => {
    if (!visible || !groupRef.current) return;
    const freqData = audioData.freq;
    const t = clock.getElapsedTime();

    // Compute bass energy for overall pulse
    let bassEnergy = 0;
    const bassEnd = Math.min(16, freqData.length);
    for (let i = 0; i < bassEnd; i++) bassEnergy += freqData[i];
    bassEnergy = (bassEnergy / (bassEnd * 255)) * sensitivity;
    // Smooth with exponential decay
    smoothBass.current += (bassEnergy - smoothBass.current) * 0.15;

    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);
    const c2 = getThemeColor(theme, 2);
    const c3 = getThemeColor(theme, 3);

    // Scale pulse: bass makes the ring breathe
    const scalePulse = 1.0 + smoothBass.current * 0.3;

    for (let i = 0; i <= ringPoints; i++) {
      const idx = i % ringPoints;
      const angle = (idx / ringPoints) * Math.PI * 2;

      // Map ring position to frequency bin (log scale for better distribution)
      const freqT = idx / ringPoints;
      const freqIdx = Math.floor(Math.pow(freqT, 1.4) * freqData.length * 0.85);
      const val = (freqData[freqIdx] / 255) * sensitivity;

      // Outer ring: frequency-modulated radius
      const outerR = (BASE_RADIUS + val * MAX_SPIKE) * scalePulse;
      const i3 = i * 3;
      outerPositions[i3] = Math.cos(angle) * outerR;
      outerPositions[i3 + 1] = Math.sin(angle) * outerR;
      outerPositions[i3 + 2] = 0;

      // Inner ring: mirror at smaller scale, slightly delayed feel
      const innerR = (BASE_RADIUS * INNER_RING_SCALE + val * MAX_SPIKE * 0.5) * scalePulse;
      innerPositions[i3] = Math.cos(angle) * innerR;
      innerPositions[i3 + 1] = Math.sin(angle) * innerR;
      innerPositions[i3 + 2] = 0;

      // Color: gradient around the ring (low freq = primary, high freq = tertiary)
      const cT = freqT;
      let col: [number, number, number];
      if (cT < 0.33) {
        col = lerpColor(c0, c1, cT * 3);
      } else if (cT < 0.66) {
        col = lerpColor(c1, c2, (cT - 0.33) * 3);
      } else {
        col = lerpColor(c2, c3, (cT - 0.66) * 3);
      }

      // Brightness boost on peaks
      const brightness = 1.0 + val * 1.5;
      outerColors[i3] = Math.min(1, col[0] * brightness);
      outerColors[i3 + 1] = Math.min(1, col[1] * brightness);
      outerColors[i3 + 2] = Math.min(1, col[2] * brightness);

      innerColors[i3] = col[0] * 0.6;
      innerColors[i3 + 1] = col[1] * 0.6;
      innerColors[i3 + 2] = col[2] * 0.6;
    }

    outerGeometry.attributes.position.needsUpdate = true;
    outerGeometry.attributes.color.needsUpdate = true;
    innerGeometry.attributes.position.needsUpdate = true;
    innerGeometry.attributes.color.needsUpdate = true;

    // Slow rotation + gentle tilt
    groupRef.current.rotation.z = t * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    groupRef.current.rotation.y = Math.cos(t * 0.2) * 0.1;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0.5, 0]} renderOrder={-1}>
      <primitive object={outerLine} />
      <primitive object={innerLine} />
    </group>
  );
}
