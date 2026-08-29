// ============================================================
// Device quality detection.
// Mobile GPUs have tight shader-uniform limits: with dozens of
// PointLights the lit-material shaders fail to compile and all
// objects disappear (only the sky renders). On touch devices we
// therefore skip decorative lights, shadows and antialiasing.
// ============================================================
import * as THREE from 'three';

export const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
export const QUALITY_PRESETS = Object.freeze({
  low: Object.freeze({ name: 'low', pixelRatio: 1.25, shadows: false, bloom: false, density: .55 }),
  medium: Object.freeze({ name: 'medium', pixelRatio: 1.5, shadows: true, bloom: false, density: .78 }),
  high: Object.freeze({ name: 'high', pixelRatio: 2, shadows: true, bloom: true, density: 1 }),
});
let preferredQuality = 'auto';
try {
  preferredQuality = JSON.parse(localStorage.getItem('dg-treasure-hunt-settings-v1') || '{}').quality || 'auto';
} catch { /* automatic quality remains the safe default */ }
export const QUALITY_PREFERENCE = preferredQuality;
export const INITIAL_PRESET = preferredQuality === 'low' ? QUALITY_PRESETS.low
  : preferredQuality === 'high' ? QUALITY_PRESETS.high
    : IS_TOUCH ? QUALITY_PRESETS.low : QUALITY_PRESETS.high;
export const LOW_FX = INITIAL_PRESET.name === 'low';

export function rendererCapabilities(renderer) {
  const caps = renderer.capabilities;
  return {
    isWebGL2: caps.isWebGL2,
    maxTextureSize: caps.maxTextureSize,
    maxTextures: caps.maxTextures,
    maxVertexTextures: caps.maxVertexTextures,
    maxVaryings: caps.maxVaryings,
    precision: caps.precision,
  };
}

export function chooseQualityPreset(renderer, preference = QUALITY_PREFERENCE) {
  if (preference !== 'auto') return QUALITY_PRESETS[preference] || INITIAL_PRESET;
  const caps = rendererCapabilities(renderer);
  if (!caps.isWebGL2 || caps.maxTextureSize < 4096 || caps.maxVaryings < 16) return QUALITY_PRESETS.low;
  if (IS_TOUCH) return QUALITY_PRESETS.low;
  return QUALITY_PRESETS.high;
}

/**
 * Decorative point light — real light on desktop, a cheap empty
 * node on mobile (the emissive/basic glow meshes still show).
 */
export function pointLight(color, intensity, distance, decay) {
  if (LOW_FX) return new THREE.Object3D();
  return new THREE.PointLight(color, intensity, distance, decay);
}
