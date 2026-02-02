import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

const STAR_COUNT = 800;
const FIELD_SIZE = 30;

/** Simple seeded PRNG (mulberry32) — deterministic star layout */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const visible = useStore((s) => s.starfield);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  // Pre-allocate all buffers
  const { positions, basePositions, colors, sizes, phases } = useMemo(() => {
    const rand = mulberry32(7777);
    const p = new Float32Array(STAR_COUNT * 3);
    const bp = new Float32Array(STAR_COUNT * 3);
    const c = new Float32Array(STAR_COUNT * 3);
    const s = new Float32Array(STAR_COUNT);
    const ph = new Float32Array(STAR_COUNT); // twinkle phase offset
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = (rand() - 0.5) * FIELD_SIZE;
      const y = (rand() - 0.5) * FIELD_SIZE;
      const z = (rand() - 0.5) * FIELD_SIZE;
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
      bp[i * 3] = x;
      bp[i * 3 + 1] = y;
      bp[i * 3 + 2] = z;
      s[i] = rand() * 2.0 + 0.5;
      ph[i] = rand() * Math.PI * 2;
    }
    return { positions: p, basePositions: bp, colors: c, sizes: s, phases: ph };
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: 0.6 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio ?? 1, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = -mvPosition.z;
        gl_PointSize = size * uPixelRatio * (200.0 / max(dist, 1.0));
        gl_Position = projectionMatrix * mvPosition;
        // Distance fade
        vAlpha = smoothstep(30.0, 5.0, dist);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uOpacity;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        // Soft glow core
        float core = smoothstep(0.5, 0.0, d);
        float glow = exp(-d * 6.0) * 0.5;
        float alpha = (core + glow) * uOpacity * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useEffect(() => {
    const handleResize = () => {
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio ?? 1, 2);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [material]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !visible) return;
    const freqData = audioData.freq;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const sz = geo.attributes.size.array as Float32Array;
    const t = clock.getElapsedTime();

    // Compute bass energy for drift speed
    let bassEnergy = 0;
    const bassEnd = Math.min(16, freqData.length);
    for (let i = 0; i < bassEnd; i++) bassEnergy += freqData[i];
    bassEnergy = (bassEnergy / (bassEnd * 255)) * sensitivity;

    // Compute high-frequency energy for twinkling
    let highEnergy = 0;
    const highStart = Math.floor(freqData.length * 0.7);
    for (let i = highStart; i < freqData.length; i++) highEnergy += freqData[i];
    highEnergy = (highEnergy / ((freqData.length - highStart) * 255)) * sensitivity;

    // Theme colors for star tinting
    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);

    const driftSpeed = 0.02 + bassEnergy * 0.15;
    const half = FIELD_SIZE / 2;

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      // Gentle drift with bass influence
      pos[i3] = basePositions[i3] + Math.sin(t * 0.1 + phase) * driftSpeed * 8;
      pos[i3 + 1] = basePositions[i3 + 1] + Math.cos(t * 0.08 + phase * 1.3) * driftSpeed * 6;
      pos[i3 + 2] = basePositions[i3 + 2] - t * driftSpeed * 0.5;

      // Wrap Z — slow drift toward camera, wrap to back
      if (pos[i3 + 2] < -half) pos[i3 + 2] += FIELD_SIZE;
      if (pos[i3 + 2] > half) pos[i3 + 2] -= FIELD_SIZE;

      // Twinkle: sinusoidal size modulation driven by high-freq energy
      const twinkle = 0.6 + 0.4 * Math.sin(t * (2.0 + phase * 0.5) + phase);
      const highBoost = 1.0 + highEnergy * 1.5 * Math.sin(t * 3 + i);
      sz[i] = sizes[i] * twinkle * highBoost;

      // Subtle theme color tinting — mostly white/blue with theme accent
      const mix = 0.15 + 0.1 * Math.sin(phase + t * 0.2);
      const baseR = 0.85;
      const baseG = 0.9;
      const baseB = 1.0;
      const ci = i % 2 === 0 ? c0 : c1;
      col[i3] = baseR * (1 - mix) + ci[0] * mix;
      col[i3 + 1] = baseG * (1 - mix) + ci[1] * mix;
      col[i3 + 2] = baseB * (1 - mix) + ci[2] * mix;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef} material={material} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}
