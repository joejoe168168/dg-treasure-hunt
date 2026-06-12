// ============================================================
// Device quality detection.
// Mobile GPUs have tight shader-uniform limits: with dozens of
// PointLights the lit-material shaders fail to compile and all
// objects disappear (only the sky renders). On touch devices we
// therefore skip decorative lights, shadows and antialiasing.
// ============================================================
import * as THREE from 'three';

export const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
export const LOW_FX = IS_TOUCH;

/**
 * Decorative point light — real light on desktop, a cheap empty
 * node on mobile (the emissive/basic glow meshes still show).
 */
export function pointLight(color, intensity, distance, decay) {
  if (LOW_FX) return new THREE.Object3D();
  return new THREE.PointLight(color, intensity, distance, decay);
}
