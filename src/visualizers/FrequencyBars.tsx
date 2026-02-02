import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';

const GRID = 16;
const SPACING = 0.35;
const BAR_SIZE = 0.25;

export function FrequencyBars({ freqData, opacity }: { freqData: Uint8Array; opacity: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const theme = useStore((s) => s.theme);
  const sensitivity = useStore((s) => s.sensitivity);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = GRID * GRID;
  const tempColor = useMemo(() => new THREE.Color(), []);

  const colorArray = useMemo(() => {
    return new Float32Array(count * 3);
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);
    const c2 = getThemeColor(theme, 2);

    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const idx = x * GRID + z;
        const freqIdx = Math.floor((idx / count) * (freqData.length * 0.7));
        const val = (freqData[freqIdx] / 255) * sensitivity;
        const height = Math.max(0.05, val * 5.0);

        dummy.position.set(
          (x - GRID / 2) * SPACING,
          height / 2,
          (z - GRID / 2) * SPACING
        );
        dummy.scale.set(BAR_SIZE, height, BAR_SIZE);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // Color by height
        const t = Math.min(1, val * 1.5);
        const r = c0[0] + (c1[0] - c0[0]) * t + (c2[0] - c1[0]) * Math.max(0, t - 0.5) * 2;
        const g = c0[1] + (c1[1] - c0[1]) * t + (c2[1] - c1[1]) * Math.max(0, t - 0.5) * 2;
        const b = c0[2] + (c1[2] - c0[2]) * t + (c2[2] - c1[2]) * Math.max(0, t - 0.5) * 2;
        tempColor.setRGB(r, g, b);
        colorArray[idx * 3] = tempColor.r;
        colorArray[idx * 3 + 1] = tempColor.g;
        colorArray[idx * 3 + 2] = tempColor.b;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colorArray, 3)
    );
  });

  return (
    <group position={[0, -1.5, 0]} visible={opacity > 0.01}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={opacity}
          emissive={new THREE.Color(0.1, 0.1, 0.1)}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </instancedMesh>
    </group>
  );
}
