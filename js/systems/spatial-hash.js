export class SpatialHash {
  constructor(cellSize = 12) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  key(x, z) { return `${x},${z}`; }
  cell(value) { return Math.floor(value / this.cellSize); }

  insert(item) {
    const minX = this.cell(item.minX), maxX = this.cell(item.maxX);
    const minZ = this.cell(item.minZ), maxZ = this.cell(item.maxZ);
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const key = this.key(x, z);
        if (!this.cells.has(key)) this.cells.set(key, new Set());
        this.cells.get(key).add(item);
      }
    }
    return item;
  }

  rebuild(items) {
    this.cells.clear();
    items.forEach(item => this.insert(item));
    return this;
  }

  queryPoint(x, z, radius = 0) {
    const results = new Set();
    const minX = this.cell(x - radius), maxX = this.cell(x + radius);
    const minZ = this.cell(z - radius), maxZ = this.cell(z + radius);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        this.cells.get(this.key(cx, cz))?.forEach(item => results.add(item));
      }
    }
    return results;
  }
}
