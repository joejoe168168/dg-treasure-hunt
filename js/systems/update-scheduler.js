export class UpdateScheduler {
  constructor(names = []) {
    this.systems = new Map(names.map(name => [name, new Set()]));
    this.running = false;
  }

  add(name, update) {
    if (!this.systems.has(name)) this.systems.set(name, new Set());
    this.systems.get(name).add(update);
    return () => this.systems.get(name)?.delete(update);
  }

  start() { this.running = true; }

  update(dt, elapsed) {
    if (!this.running) return;
    for (const callbacks of this.systems.values()) {
      for (const callback of callbacks) callback(dt, elapsed);
    }
  }

  reset() { this.running = false; }

  dispose() {
    this.running = false;
    for (const callbacks of this.systems.values()) callbacks.clear();
  }

  counts() {
    return Object.fromEntries([...this.systems].map(([name, callbacks]) => [name, callbacks.size]));
  }
}
