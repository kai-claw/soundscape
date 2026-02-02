import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../store/useStore';
import { Vector2 } from 'three';

interface Props {
  reducedMotion?: boolean;
}

/**
 * Helper: updates offset Vector2 inside useFrame (never during render).
 * Reads bass/sensitivity from the store and computes aberration per-frame.
 */
function AberrationUpdater({ offset }: { offset: Vector2 }) {
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);

  useFrame(() => {
    const aberration = Math.min(0.01, bassLevel * sensitivity * 0.003);
    offset.set(aberration, aberration);
  });

  return null;
}

export function PostProcessing({ reducedMotion = false }: Props) {
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);
  const perfSettings = useStore((s) => s.performanceSettings);

  // Performance mode: skip post-processing entirely on low-end GPUs
  if (!perfSettings.enablePostProcessing) {
    return null;
  }

  // In reduced motion: no bass-reactive bloom, no chromatic aberration
  // Clamp bloom to 3.0 max to prevent whiteout at high sensitivity + bass
  const bloomIntensity = reducedMotion ? 0.6 : Math.min(3.0, 0.8 + bassLevel * sensitivity * 2.0);

  // Stable Vector2 — created once via useMemo, mutated per-frame via AberrationUpdater
  const offset = useMemo(() => new Vector2(0, 0), []);

  if (reducedMotion || !perfSettings.enableChromatic) {
    return (
      <EffectComposer multisampling={0}>
        {perfSettings.enableBloom && (
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        )}
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    );
  }

  return (
    <>
      <AberrationUpdater offset={offset} />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={offset}
          radialModulation={true}
          modulationOffset={0.5}
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </>
  );
}
