import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';

const SEGMENTS = 128;
const WIDTH = 8;
const RIBBON_DEPTH = 0.8;

export function WaveformRibbon({ timeData, opacity }: { timeData: Uint8Array; opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, RIBBON_DEPTH, SEGMENTS, 20);
    return geo;
  }, []);

  const material = useMemo(() => {
    const c1 = getThemeColor(theme, 0);
    const c2 = getThemeColor(theme, 1);
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uColor1: { value: new THREE.Color(c1[0], c1[1], c1[2]) },
        uColor2: { value: new THREE.Color(c2[0], c2[1], c2[2]) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vY;
        void main() {
          vUv = uv;
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        varying float vY;
        void main() {
          vec3 color = mix(uColor1, uColor2, vUv.x + sin(uTime) * 0.2);
          float glow = smoothstep(0.0, 0.3, abs(vY));
          gl_FragColor = vec4(color, (1.0 - glow * 0.5) * uOpacity);
        }
      `,
    });
  }, [theme, opacity]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const t = clock.getElapsedTime();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const normalizedX = (x + WIDTH / 2) / WIDTH;
      const dataIndex = Math.floor(normalizedX * (timeData.length - 1));
      const sample = (timeData[dataIndex] - 128) / 128;
      const wave = sample * 2.0 * sensitivity;
      const flowOffset = Math.sin(normalizedX * Math.PI * 2 + t * 1.5) * 0.15;
      pos.setY(i, wave + flowOffset + pos.getZ(i) * 0.1);
    }
    pos.needsUpdate = true;

    material.uniforms.uTime.value = t;
    material.uniforms.uOpacity.value = opacity;
    const c1 = getThemeColor(theme, 0);
    const c2 = getThemeColor(theme, 1);
    material.uniforms.uColor1.value.setRGB(c1[0], c1[1], c1[2]);
    material.uniforms.uColor2.value.setRGB(c2[0], c2[1], c2[2]);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} rotation={[0.3, 0, 0]} />
  );
}
