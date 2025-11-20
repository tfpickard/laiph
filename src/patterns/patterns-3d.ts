/**
 * 3D Game of Life Pattern Library
 */

export interface Pattern3D {
  name: string;
  description: string;
  size: [number, number, number];
  cells: [number, number, number][];
  rules?: {
    surviveMin: number;
    surviveMax: number;
    birthMin: number;
    birthMax: number;
  };
}

export const PATTERNS_3D: Record<string, Pattern3D> = {
  // Single cell (dies immediately)
  single: {
    name: 'Single Cell',
    description: 'A single cell that dies in the next generation',
    size: [1, 1, 1],
    cells: [[0, 0, 0]],
  },

  // 3D Glider (moves diagonally through space)
  glider: {
    name: '3D Glider',
    description: 'A pattern that moves through 3D space',
    size: [5, 5, 5],
    cells: [
      [2, 0, 2], [3, 0, 2],
      [1, 1, 2], [2, 1, 2], [2, 1, 3],
      [2, 2, 1], [2, 2, 2], [3, 2, 2],
    ],
  },

  // Blinker (oscillator)
  blinker3d: {
    name: '3D Blinker',
    description: 'A simple 3D oscillator',
    size: [3, 3, 3],
    cells: [
      [1, 0, 1],
      [1, 1, 1],
      [1, 2, 1],
    ],
  },

  // Block (still life)
  block: {
    name: 'Block',
    description: 'A stable 3D configuration',
    size: [2, 2, 2],
    cells: [
      [0, 0, 0], [1, 0, 0],
      [0, 1, 0], [1, 1, 0],
      [0, 0, 1], [1, 0, 1],
      [0, 1, 1], [1, 1, 1],
    ],
  },

  // Pulsar (oscillator)
  pulsar: {
    name: 'Pulsar',
    description: 'A large oscillating pattern',
    size: [13, 13, 3],
    cells: [
      // Layer 0
      [2, 0, 1], [3, 0, 1], [4, 0, 1], [8, 0, 1], [9, 0, 1], [10, 0, 1],
      [0, 2, 1], [5, 2, 1], [7, 2, 1], [12, 2, 1],
      [0, 3, 1], [5, 3, 1], [7, 3, 1], [12, 3, 1],
      [0, 4, 1], [5, 4, 1], [7, 4, 1], [12, 4, 1],
      [2, 5, 1], [3, 5, 1], [4, 5, 1], [8, 5, 1], [9, 5, 1], [10, 5, 1],
      [2, 7, 1], [3, 7, 1], [4, 7, 1], [8, 7, 1], [9, 7, 1], [10, 7, 1],
      [0, 8, 1], [5, 8, 1], [7, 8, 1], [12, 8, 1],
      [0, 9, 1], [5, 9, 1], [7, 9, 1], [12, 9, 1],
      [0, 10, 1], [5, 10, 1], [7, 10, 1], [12, 10, 1],
      [2, 12, 1], [3, 12, 1], [4, 12, 1], [8, 12, 1], [9, 12, 1], [10, 12, 1],
    ],
  },

  // Cross (3D specific)
  cross: {
    name: '3D Cross',
    description: 'A 3D cross-shaped pattern',
    size: [5, 5, 5],
    cells: [
      [2, 0, 2], [2, 1, 2], [2, 2, 2], [2, 3, 2], [2, 4, 2],
      [0, 2, 2], [1, 2, 2], [3, 2, 2], [4, 2, 2],
      [2, 2, 0], [2, 2, 1], [2, 2, 3], [2, 2, 4],
    ],
  },

  // Cube
  cube: {
    name: 'Cube',
    description: 'A hollow cube',
    size: [5, 5, 5],
    cells: [
      // Bottom face
      [1, 1, 1], [2, 1, 1], [3, 1, 1],
      [1, 2, 1], [3, 2, 1],
      [1, 3, 1], [2, 3, 1], [3, 3, 1],
      // Middle layer (edges only)
      [1, 1, 2], [3, 1, 2],
      [1, 3, 2], [3, 3, 2],
      // Top face
      [1, 1, 3], [2, 1, 3], [3, 1, 3],
      [1, 2, 3], [3, 2, 3],
      [1, 3, 3], [2, 3, 3], [3, 3, 3],
    ],
  },

  // Random cloud
  randomCloud: {
    name: 'Random Cloud',
    description: 'A dense random cloud of cells',
    size: [10, 10, 10],
    cells: [], // Will be filled randomly
  },

  // Diagonal line
  diagonal: {
    name: 'Diagonal Line',
    description: 'A diagonal line through 3D space',
    size: [8, 8, 8],
    cells: [
      [0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3],
      [4, 4, 4], [5, 5, 5], [6, 6, 6], [7, 7, 7],
    ],
  },
};

// Generate random cloud cells
const cloudCells: [number, number, number][] = [];
for (let x = 2; x < 8; x++) {
  for (let y = 2; y < 8; y++) {
    for (let z = 2; z < 8; z++) {
      if (Math.random() > 0.7) {
        cloudCells.push([x, y, z]);
      }
    }
  }
}
PATTERNS_3D.randomCloud.cells = cloudCells;

export function createPatternGrid(
  pattern: Pattern3D,
  gridSize: [number, number, number],
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0
): Uint32Array {
  const grid = new Uint32Array(gridSize[0] * gridSize[1] * gridSize[2]);

  // Center the pattern if no offset is provided
  if (offsetX === 0 && offsetY === 0 && offsetZ === 0) {
    offsetX = Math.floor((gridSize[0] - pattern.size[0]) / 2);
    offsetY = Math.floor((gridSize[1] - pattern.size[1]) / 2);
    offsetZ = Math.floor((gridSize[2] - pattern.size[2]) / 2);
  }

  for (const [x, y, z] of pattern.cells) {
    const gridX = x + offsetX;
    const gridY = y + offsetY;
    const gridZ = z + offsetZ;

    if (
      gridX >= 0 && gridX < gridSize[0] &&
      gridY >= 0 && gridY < gridSize[1] &&
      gridZ >= 0 && gridZ < gridSize[2]
    ) {
      const index = gridX + gridY * gridSize[0] + gridZ * gridSize[0] * gridSize[1];
      grid[index] = 1;
    }
  }

  return grid;
}
