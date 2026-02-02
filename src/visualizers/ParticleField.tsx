import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

const COUNT = 3000;

/** Simple seeded PRNG (mulberry32) — deterministic particle layout */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ParticleField({ opacity }: { opacity: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  const { positions, velocities, colors, sizes } = useMemo(() => {
    const rand = mulberry32(42);
    const p = new Float32Array(COUNT * 3);
    const v = new Float32Array(COUNT * 3);
    const c = new Float32Array(COUNT * 3);
    const s = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      p[i * 3] = (rand() - 0.5) * 10;
      p[i * 3 + 1] = (rand() - 0.5) * 10;
      p[i * 3 + 2] = (rand() - 0.5) * 10;
      v[i * 3] = (rand() - 0.5) * 0.02;
      v[i * 3 + 1] = (rand() - 0.5) * 0.02;
      v[i * 3 + 2] = (rand() - 0.5) * 0.02;
      s[i] = rand() * 3 + 1;
    }
    return { positions: p, velocities: v, colors: c, sizes: s };
  }, []);

  // useMemo for stable material — avoids ESLint ref-during-render warning
  // while keeping the same "create once" semantics
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio ?? 1, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform float uOpacity;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, d) * uOpacity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), []);

  // Dispose material on unmount
  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // Update pixel ratio if window DPR changes (e.g., moving between displays)
  useEffect(() => {
    const handleResize = () => {
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio ?? 1, 2);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [material]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const freqData = audioData.freq;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    const sz = geo.attributes.size.array as Float32Array;
    const t = clock.getElapsedTime();

    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);
    const c2 = getThemeColor(theme, 2);
    const c3 = getThemeColor(theme, 3);
    const allColors = [c0, c1, c2, c3];

    let energy = 0;
    for (let i = 0; i < freqData.length; i++) energy += freqData[i];
    energy = (energy / freqData.length / 255) * sensitivity;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const freqIdx = i % freqData.length;
      const freq = (freqData[freqIdx] / 255) * sensitivity;

      // Move particles
      pos[i3] += velocities[i3] + Math.sin(t + i * 0.01) * freq * 0.05;
      pos[i3 + 1] += velocities[i3 + 1] + Math.cos(t + i * 0.02) * freq * 0.05;
      pos[i3 + 2] += velocities[i3 + 2] + Math.sin(t * 0.5 + i) * freq * 0.03;

      // Wrap around
      for (let j = 0; j < 3; j++) {
        if (pos[i3 + j] > 5) pos[i3 + j] = -5;
        if (pos[i3 + j] < -5) pos[i3 + j] = 5;
      }

      // Color based on frequency band
      const cIdx = Math.floor((freqIdx / freqData.length) * 4);
      const clr = allColors[Math.min(cIdx, 3)];
      col[i3] = clr[0];
      col[i3 + 1] = clr[1];
      col[i3 + 2] = clr[2];

      // Size reacts to audio
      sz[i] = (sizes[i] + freq * 4) * (0.5 + energy * 2);
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    material.uniforms.uOpacity.value = opacity; // eslint-disable-line react-hooks/immutability -- R3F: shader uniform mutation in useFrame is correct
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}
