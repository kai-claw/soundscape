import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';

const RINGS = 30;
const RING_SEGMENTS = 32;

export function Tunnel({ freqData, opacity }: { freqData: Uint8Array; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);
  const bassLevel = useStore((s) => s.bassLevel);

  const rings = useMemo(() => {
    const items: { mat: THREE.MeshStandardMaterial }[] = [];
    for (let i = 0; i < RINGS; i++) {
      items.push({
        mat: new THREE.MeshStandardMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          wireframe: true,
          metalness: 0.5,
          roughness: 0.5,
        }),
      });
    }
    return items;
  }, []);

  const ringGeo = useMemo(() => new THREE.TorusGeometry(1, 0.02, 4, RING_SEGMENTS), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const children = groupRef.current.children;

    for (let i = 0; i < RINGS; i++) {
      const mesh = children[i] as THREE.Mesh;
      if (!mesh) continue;

      const depth = ((i / RINGS) * 20 - t * 3) % 20 - 10;
      mesh.position.z = depth;

      const freqIdx = Math.floor((i / RINGS) * freqData.length * 0.5);
      const freq = (freqData[freqIdx] / 255) * sensitivity;
      const bassPulse = 1 + bassLevel * 1.5 * sensitivity;

      const radius = (1.5 + freq * 2.0) * bassPulse;
      mesh.scale.set(radius, radius, 1);

      mesh.rotation.z = t * 0.2 + i * 0.1 + freq * 0.5;

      const c = getThemeColor(theme, i % 4);
      const glow = 0.3 + freq * 0.7;
      rings[i].mat.color.setRGB(c[0] * glow, c[1] * glow, c[2] * glow);
      rings[i].mat.emissive.setRGB(c[0] * freq * 0.5, c[1] * freq * 0.5, c[2] * freq * 0.5);
      rings[i].mat.emissiveIntensity = freq * 2;
      rings[i].mat.opacity = opacity * (0.3 + freq * 0.7) * (1 - Math.abs(depth) / 12);
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <mesh key={i} geometry={ringGeo} material={r.mat} />
      ))}
    </group>
  );
}
