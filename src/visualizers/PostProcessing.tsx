import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../store/useStore';
import { Vector2 } from 'three';

export function PostProcessing() {
  const bassLevel = useStore((s) => s.bassLevel);
  const sensitivity = useStore((s) => s.sensitivity);

  const bloomIntensity = 0.8 + bassLevel * sensitivity * 2.0;
  const aberration = bassLevel * sensitivity * 0.003;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(aberration, aberration)}
        radialModulation={true}
        modulationOffset={0.5}
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
