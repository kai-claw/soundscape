import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

/**
 * SpectrumWaterfall — 3D scrolling spectrogram terrain.
 *
 * Each frame's frequency data becomes a row of heights, scrolling
 * forward to create a living landscape of sound history.
 * Rows glow brighter at the front (newest data) and fade as they recede.
 */

const FREQ_BINS = 64;   // frequency resolution per row
const HISTORY = 80;      // rows of history
const TERRAIN_WIDTH = 10;
const TERRAIN_DEPTH = 12;
const MAX_HEIGHT = 4.0;

export function SpectrumWaterfall({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  // Row write index (ring buffer)
  const writeIdx = useRef(0);
  // Pre-allocated history buffer: each row has FREQ_BINS height values
  const historyBuf = useRef(new Float32Array(HISTORY * FREQ_BINS));

  // Geometry: FREQ_BINS × HISTORY grid
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_WIDTH,
      TERRAIN_DEPTH,
      FREQ_BINS - 1,
      HISTORY - 1,
    );
    // Rotate to lay flat on XZ plane
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Custom shader for terrain coloring
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
        uniforms: {
          uOpacity: { value: 1.0 },
          uColor0: { value: new THREE.Color() },
          uColor1: { value: new THREE.Color() },
          uColor2: { value: new THREE.Color() },
          uColor3: { value: new THREE.Color() },
          uMaxHeight: { value: MAX_HEIGHT },
        },
        vertexShader: /* glsl */ `
        varying float vHeight;
        varying float vDepth;
        varying vec2 vUv;
        uniform float uMaxHeight;
        void main() {
          vUv = uv;
          vHeight = position.y / uMaxHeight;
          // depth = how far back (0 = front/newest, 1 = back/oldest)
          vDepth = uv.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uColor0;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying float vHeight;
        varying float vDepth;
        varying vec2 vUv;
        void main() {
          // Color by height (frequency energy)
          float h = clamp(vHeight, 0.0, 1.0);
          vec3 col;
          if (h < 0.33) {
            col = mix(uColor0, uColor1, h * 3.0);
          } else if (h < 0.66) {
            col = mix(uColor1, uColor2, (h - 0.33) * 3.0);
          } else {
            col = mix(uColor2, uColor3, (h - 0.66) * 3.0);
          }
          // Fade older rows: newest (vDepth≈0) bright, oldest (vDepth≈1) dim
          float ageFade = 1.0 - vDepth * 0.7;
          // Emissive-like glow on high peaks
          float glow = smoothstep(0.4, 1.0, h) * 0.5;
          gl_FragColor = vec4(col * (ageFade + glow), uOpacity * ageFade);
        }
      `,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Throttle counter — push new row every 2 frames for smoother scroll
  const frameCount = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    const freqData = audioData.freq;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const hist = historyBuf.current;

    frameCount.current++;

    // Push a new row of frequency data every 2 frames
    if (frameCount.current % 2 === 0) {
      const row = writeIdx.current;
      for (let x = 0; x < FREQ_BINS; x++) {
        // Map frequency bins with slight log-ish emphasis on lower freqs
        const freqIdx = Math.floor(
          Math.pow(x / FREQ_BINS, 1.3) * freqData.length * 0.8,
        );
        const val = (freqData[freqIdx] / 255) * sensitivity;
        hist[row * FREQ_BINS + x] = val * MAX_HEIGHT;
      }
      writeIdx.current = (row + 1) % HISTORY;
    }

    // Update geometry vertices from ring buffer
    // The ring buffer write pointer points to the OLDEST row (about to be overwritten)
    // We want row 0 of the grid = oldest, row HISTORY-1 = newest
    const startRow = writeIdx.current; // oldest
    for (let z = 0; z < HISTORY; z++) {
      const histRow = (startRow + z) % HISTORY;
      for (let x = 0; x < FREQ_BINS; x++) {
        const vertIdx = z * FREQ_BINS + x;
        const h = hist[histRow * FREQ_BINS + x];
        pos.setY(vertIdx, h);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // Update uniforms
    material.uniforms.uOpacity.value = opacity;
    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);
    const c2 = getThemeColor(theme, 2);
    const c3 = getThemeColor(theme, 3);
    material.uniforms.uColor0.value.setRGB(c0[0], c0[1], c0[2]);
    material.uniforms.uColor1.value.setRGB(c1[0], c1[1], c1[2]);
    material.uniforms.uColor2.value.setRGB(c2[0], c2[1], c2[2]);
    material.uniforms.uColor3.value.setRGB(c3[0], c3[1], c3[2]);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, -1.5, 2]}
      visible={opacity > 0.01}
    />
  );
}
