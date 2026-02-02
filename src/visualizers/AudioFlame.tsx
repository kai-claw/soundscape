import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getThemeColor } from '../themes/colorThemes';

/**
 * AudioFlame — Procedural GLSL fire/aurora visualization.
 *
 * A billboard plane with a fragment shader that generates flowing flame
 * curtains using layered simplex noise. Audio drives intensity (bass),
 * turbulence speed (mids), and color temperature shift (highs).
 */

const FLAME_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FLAME_FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uOpacity;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// ---- Simplex 2D noise (Ashima Arts) ----
vec3 mod289_3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289_2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289_3(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,   // (3.0-sqrt(3.0))/6.0
    0.366025403784439,   // 0.5*(sqrt(3.0)-1.0)
   -0.577350269189626,   // -1.0+2.0*C.x
    0.024390243902439    // 1.0/41.0
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x_  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h   = abs(x_) - 0.5;
  vec3 ox  = floor(x_ + 0.5);
  vec3 a0  = x_ - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion — layered noise for richer detail
float fbm(vec2 p) {
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    f += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return f;
}

void main() {
  vec2 uv = vUv;

  // --- Flame shaping ---
  // Vertical flame: strongest at bottom, fades toward top
  float yFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.35, uv.y);

  // Horizontal: multiple flame columns (3-5 aurora curtains)
  float curtainCount = 3.0 + uMid * 2.0;
  float curtains = 0.0;
  for (float i = 0.0; i < 5.0; i++) {
    if (i >= curtainCount) break;
    float offset = (i / curtainCount) + 0.1;
    float xPos = uv.x - offset;
    // Each curtain sways with noise
    float sway = snoise(vec2(i * 3.7, uTime * (0.3 + uMid * 0.4))) * 0.15;
    float curtain = exp(-8.0 * (xPos - sway) * (xPos - sway));
    curtains += curtain;
  }
  curtains = clamp(curtains, 0.0, 1.5);

  // --- Noise-driven flame turbulence ---
  float speed = 1.0 + uMid * 1.5;
  float turbulence = fbm(vec2(uv.x * 3.0 + uTime * 0.2, uv.y * 4.0 - uTime * speed));
  float detail = snoise(vec2(uv.x * 8.0 - uTime * 0.5, uv.y * 10.0 - uTime * speed * 1.5));

  // Combine shape + turbulence
  float flame = yFade * curtains;
  flame += turbulence * 0.35 * yFade;
  flame += detail * 0.12 * yFade;

  // Bass drives overall intensity
  flame *= (0.4 + uBass * 2.0);

  // Clamp to [0, 1]
  flame = clamp(flame, 0.0, 1.0);

  // --- Color gradient through theme colors ---
  // Bottom = color0 (warm core), middle = color1/2, top = color3 (cool tips)
  float colorT = clamp(uv.y + uHigh * 0.3, 0.0, 1.0);
  vec3 col;
  if (colorT < 0.33) {
    col = mix(uColor0, uColor1, colorT * 3.0);
  } else if (colorT < 0.66) {
    col = mix(uColor1, uColor2, (colorT - 0.33) * 3.0);
  } else {
    col = mix(uColor2, uColor3, (colorT - 0.66) * 3.03);
  }

  // High frequencies add shimmer/sparkle
  float sparkle = snoise(vec2(uv.x * 20.0, uv.y * 20.0 + uTime * 3.0));
  sparkle = max(0.0, sparkle) * uHigh * 0.4;
  col += vec3(sparkle);

  // Emissive glow on bright spots
  float glow = smoothstep(0.4, 0.9, flame) * 0.6;
  col *= (1.0 + glow);

  float alpha = smoothstep(0.05, 0.3, flame) * uOpacity;

  gl_FragColor = vec4(col, alpha);
}
`;

export function AudioFlame({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useStore((s) => s.theme);
  const bassLevel = useStore((s) => s.bassLevel);
  const midLevel = useStore((s) => s.midLevel);
  const highLevel = useStore((s) => s.highLevel);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uBass: { value: 0 },
          uMid: { value: 0 },
          uHigh: { value: 0 },
          uOpacity: { value: 1 },
          uColor0: { value: new THREE.Color() },
          uColor1: { value: new THREE.Color() },
          uColor2: { value: new THREE.Color() },
          uColor3: { value: new THREE.Color() },
        },
        vertexShader: FLAME_VERT,
        fragmentShader: FLAME_FRAG,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    const u = material.uniforms;

    u.uTime.value = t;
    u.uBass.value = bassLevel;
    u.uMid.value = midLevel;
    u.uHigh.value = highLevel;
    u.uOpacity.value = opacity;

    // Update theme colors
    const c0 = getThemeColor(theme, 0);
    const c1 = getThemeColor(theme, 1);
    const c2 = getThemeColor(theme, 2);
    const c3 = getThemeColor(theme, 3);
    u.uColor0.value.setRGB(c0[0], c0[1], c0[2]);
    u.uColor1.value.setRGB(c1[0], c1[1], c1[2]);
    u.uColor2.value.setRGB(c2[0], c2[1], c2[2]);
    u.uColor3.value.setRGB(c3[0], c3[1], c3[2]);
  });

  return (
    <mesh ref={meshRef} material={material} position={[0, 1, 0]} visible={opacity > 0.01}>
      <planeGeometry args={[12, 8]} />
    </mesh>
  );
}
