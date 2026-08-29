import * as THREE from 'three';

export class InteractionSystem {
  constructor({ canvas, camera, player, isEnabled, onTooFar }) {
    this.canvas = canvas;
    this.camera = camera;
    this.player = player;
    this.isEnabled = isEnabled;
    this.onTooFar = onTooFar;
    this.entries = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  register(root, kind, ref, options) {
    const entry = { root, kind, ref, ...options };
    root.userData.interactionEntry = entry;
    this.entries.push(entry);
    return entry;
  }

  find(kind, ref) {
    return this.entries.find(entry => entry.kind === kind && entry.ref === ref) || null;
  }

  pick(clientX, clientY) {
    if (!this.isEnabled()) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      (clientX - rect.left) / rect.width * 2 - 1,
      -(clientY - rect.top) / rect.height * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    for (const hit of this.raycaster.intersectObjects(this.entries.map(entry => entry.root), true)) {
      let object = hit.object;
      while (object && !object.userData.interactionEntry) object = object.parent;
      const entry = object?.userData.interactionEntry;
      if (entry && !entry.isCompleted?.()) return entry;
    }
    return null;
  }

  activate(entry) {
    if (!entry || !this.isEnabled()) return { status: 'disabled' };
    if (entry.isCompleted?.()) return { status: 'completed' };
    const distance = Math.hypot(
      entry.root.position.x - this.player.position.x,
      entry.root.position.z - this.player.position.z,
    );
    if (distance > entry.distance) {
      this.onTooFar(entry, distance);
      return { status: 'too-far', distance };
    }
    entry.activate();
    return { status: 'activated', distance };
  }

  activateByRef(kind, ref) {
    return this.activate(this.find(kind, ref));
  }
}
