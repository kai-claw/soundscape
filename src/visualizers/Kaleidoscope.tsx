import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';
import { audioData } from '../audio/audioData';

const MIRRORS = 8;
const SHAPES_PER_MIRROR = 6;

interface MeshItem {
  geo: THREE.BufferGeometry;
  mat: THREE.MeshStandardMaterial;
  mirror: number;
  idx: number;
}

function createMeshData(): MeshItem[] {
  const items: MeshItem[] = [];
  const geos = [
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.25, 0),
    new THREE.IcosahedronGeometry(0.2, 0),
    new THREE.TorusGeometry(0.2, 0.08, 8, 16),
    new THREE.ConeGeometry(0.15, 0.4, 6),
    new THREE.DodecahedronGeometry(0.2, 0),
  ];

  for (let m = 0; m < MIRRORS; m++) {
    for (let s = 0; s < SHAPES_PER_MIRROR; s++) {
      items.push({
        geo: geos[s % geos.length],
        mat: new THREE.MeshStandardMaterial({
          transparent: true,
          metalness: 0.8,
          roughness: 0.2,
          emissiveIntensity: 0.5,
        }),
        mirror: m,
        idx: s,
      });
    }
  }
  return items;
}

export function Kaleidoscope({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  // useMemo instead of lazy-init ref — eliminates ESLint ref-during-render warnings
  // while maintaining the same "create once" semantics.
  const meshes = useMemo(() => createMeshData(), []);

  // Dispose geometries and materials on unmount to prevent GPU memory leak
  useEffect(() => {
    return () => {
      const seenGeos = new Set<THREE.BufferGeometry>();
      for (const item of meshes) {
        if (!seenGeos.has(item.geo)) {
          item.geo.dispose();
          seenGeos.add(item.geo);
        }
        item.mat.dispose();
      }
    };
  }, [meshes]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const freqData = audioData.freq;
    const t = clock.getElapsedTime();
    const children = groupRef.current.children;

    for (let i = 0; i < meshes.length; i++) {
      const mesh = children[i] as THREE.Mesh;
      if (!mesh) continue;
      const { mirror, idx, mat } = meshes[i];

      const angle = (mirror / MIRRORS) * Math.PI * 2;
      const freqIdx = Math.floor((idx / SHAPES_PER_MIRROR) * freqData.length * 0.5);
      const freq = (freqData[freqIdx] / 255) * sensitivity;
      const radius = 1.5 + freq * 2.5 + idx * 0.4;

      mesh.position.x = Math.cos(angle + t * 0.3) * radius;
      mesh.position.y = Math.sin(angle + t * 0.3) * radius;
      mesh.position.z = Math.sin(t * 0.5 + idx) * freq * 1.5;

      const s = 0.5 + freq * 1.5;
      mesh.scale.set(s, s, s);
      mesh.rotation.x = t * (0.5 + idx * 0.2);
      mesh.rotation.y = t * (0.3 + mirror * 0.1);

      const cIdx = (mirror + idx) % 4;
      const c = getThemeColor(theme, cIdx);
      mat.color.setRGB(c[0], c[1], c[2]);
      mat.emissive.setRGB(c[0] * 0.3, c[1] * 0.3, c[2] * 0.3);
      mat.opacity = opacity; // eslint-disable-line react-hooks/immutability -- R3F: Three.js material mutation in useFrame is correct
    }
  });

  return (
    <group ref={groupRef}>
      {meshes.map((m, i) => (
        <mesh key={i} geometry={m.geo} material={m.mat} />
      ))}
    </group>
  );
}
