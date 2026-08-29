import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const listeners = new Set();

export const assetManager = new THREE.LoadingManager();
export const gltfLoader = new GLTFLoader(assetManager);

function report(loaded, total, active = true) {
  const progress = total > 0 ? loaded / total : 0;
  listeners.forEach(listener => listener({ loaded, total, progress, active }));
}

assetManager.onStart = (_url, loaded, total) => report(loaded, total, true);
assetManager.onProgress = (_url, loaded, total) => report(loaded, total, true);
assetManager.onLoad = () => report(1, 1, false);
assetManager.onError = url => console.warn(`Asset failed to load: ${url}`);

export function onAssetProgress(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
