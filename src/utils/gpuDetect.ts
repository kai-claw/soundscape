/**
 * GPU Performance Detection — auto-detect device capability
 * and suggest performance tier.
 *
 * Tiers:
 * - 'high'   — Full effects, 3000 particles, post-processing
 * - 'medium' — Reduced particles (1500), simpler post-processing
 * - 'low'    — Minimal particles (500), no post-processing, no starfield
 */

export type PerformanceTier = 'high' | 'medium' | 'low';

interface GPUInfo {
  renderer: string;
  vendor: string;
  tier: PerformanceTier;
  maxTextureSize: number;
  reason: string;
}

/** Known low-end GPU patterns */
const LOW_END_PATTERNS = [
  /mali-4/i,
  /mali-t[1-6]/i,
  /adreno\s*[1-3]/i,
  /adreno\s*4[0-1]/i,
  /powervr\s*sgx/i,
  /intel\s*hd\s*(graphics\s*)?[2-4]/i,
  /intel.*gen[4-7]/i,
  /swiftshader/i,
  /llvmpipe/i,
  /mesa/i,
  /softpipe/i,
];

/** Known medium-end GPU patterns */
const MEDIUM_END_PATTERNS = [
  /mali-t[7-8]/i,
  /mali-g[1-5][0-2]/i,
  /adreno\s*[4-5]/i,
  /intel\s*hd\s*(graphics\s*)?[5-6]/i,
  /intel\s*uhd/i,
  /intel\s*iris/i,
  /apple\s*gpu/i, // Older Apple GPUs
  /geforce\s*(gt|mx)/i,
  /radeon\s*(r[5-7]|vega\s*[3-8])/i,
];

/**
 * Detect GPU and determine performance tier.
 * Uses WEBGL_debug_renderer_info when available, falls back to heuristics.
 */
export function detectGPU(): GPUInfo {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) {
    return {
      renderer: 'unknown',
      vendor: 'unknown',
      tier: 'low',
      maxTextureSize: 0,
      reason: 'No WebGL support',
    };
  }

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

  // Try to get real renderer info
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  let renderer = 'unknown';
  let vendor = 'unknown';

  if (debugInfo) {
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
    vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string;
  }

  // Clean up
  const loseCtx = gl.getExtension('WEBGL_lose_context');
  loseCtx?.loseContext();

  // Check low-end patterns
  for (const pattern of LOW_END_PATTERNS) {
    if (pattern.test(renderer) || pattern.test(vendor)) {
      return {
        renderer,
        vendor,
        tier: 'low',
        maxTextureSize,
        reason: `Low-end GPU detected: ${renderer}`,
      };
    }
  }

  // Check medium-end patterns
  for (const pattern of MEDIUM_END_PATTERNS) {
    if (pattern.test(renderer) || pattern.test(vendor)) {
      return {
        renderer,
        vendor,
        tier: 'medium',
        maxTextureSize,
        reason: `Mid-range GPU detected: ${renderer}`,
      };
    }
  }

  // Heuristic: small max texture size = weaker GPU
  if (maxTextureSize < 4096) {
    return {
      renderer,
      vendor,
      tier: 'low',
      maxTextureSize,
      reason: `Small max texture size (${maxTextureSize})`,
    };
  }

  if (maxTextureSize < 8192) {
    return {
      renderer,
      vendor,
      tier: 'medium',
      maxTextureSize,
      reason: `Medium max texture size (${maxTextureSize})`,
    };
  }

  // Check mobile via navigator
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    return {
      renderer,
      vendor,
      tier: 'medium',
      maxTextureSize,
      reason: 'Mobile device detected',
    };
  }

  // Default: high-end
  return {
    renderer,
    vendor,
    tier: 'high',
    maxTextureSize,
    reason: `Capable GPU: ${renderer}`,
  };
}

/**
 * Performance presets for each tier.
 */
export interface PerformanceSettings {
  particleCount: number;
  starfieldCount: number;
  waterfallHistory: number;
  enablePostProcessing: boolean;
  enableBloom: boolean;
  enableChromatic: boolean;
  enableStarfield: boolean;
  orbitRingPoints: number;
  dpr: [number, number];
}

export const PERFORMANCE_PRESETS: Record<PerformanceTier, PerformanceSettings> = {
  high: {
    particleCount: 3000,
    starfieldCount: 800,
    waterfallHistory: 64,
    enablePostProcessing: true,
    enableBloom: true,
    enableChromatic: true,
    enableStarfield: true,
    orbitRingPoints: 256,
    dpr: [1, 2],
  },
  medium: {
    particleCount: 1500,
    starfieldCount: 400,
    waterfallHistory: 32,
    enablePostProcessing: true,
    enableBloom: true,
    enableChromatic: false,
    enableStarfield: true,
    orbitRingPoints: 128,
    dpr: [1, 1.5],
  },
  low: {
    particleCount: 500,
    starfieldCount: 0,
    waterfallHistory: 16,
    enablePostProcessing: false,
    enableBloom: false,
    enableChromatic: false,
    enableStarfield: false,
    orbitRingPoints: 64,
    dpr: [1, 1],
  },
};
