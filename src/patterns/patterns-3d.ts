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

  // Toad (period-2 oscillator)
  toad: {
    name: 'Toad',
    description: 'Period-2 oscillator (2D pattern in 3D space)',
    size: [4, 4, 3],
    cells: [
      [1, 1, 1], [2, 1, 1], [3, 1, 1],
      [0, 2, 1], [1, 2, 1], [2, 2, 1],
    ],
  },

  // Beacon (period-2 oscillator)
  beacon: {
    name: 'Beacon',
    description: 'Period-2 oscillator',
    size: [4, 4, 3],
    cells: [
      [0, 0, 1], [1, 0, 1],
      [0, 1, 1],
      [3, 2, 1],
      [2, 3, 1], [3, 3, 1],
    ],
  },

  // Puffer train
  pufferTrain: {
    name: 'Puffer Train',
    description: 'Leaves debris as it moves',
    size: [7, 7, 5],
    cells: [
      [3, 1, 2], [4, 1, 2],
      [2, 2, 2], [3, 2, 2], [3, 2, 3],
      [3, 3, 1], [3, 3, 2], [4, 3, 2],
      [1, 4, 2], [2, 4, 2], [3, 4, 2],
    ],
  },

  // Lightweight spaceship
  lwss: {
    name: 'Lightweight Spaceship',
    description: 'Fast moving spaceship',
    size: [5, 4, 3],
    cells: [
      [1, 0, 1], [4, 0, 1],
      [0, 1, 1],
      [0, 2, 1], [4, 2, 1],
      [0, 3, 1], [1, 3, 1], [2, 3, 1], [3, 3, 1],
    ],
  },

  // Octahedron
  octahedron: {
    name: 'Octahedron',
    description: 'Eight-sided polyhedron',
    size: [5, 5, 5],
    cells: [
      [2, 2, 0],
      [1, 2, 1], [2, 1, 1], [2, 2, 1], [2, 3, 1], [3, 2, 1],
      [0, 2, 2], [1, 1, 2], [1, 2, 2], [1, 3, 2],
      [2, 0, 2], [2, 1, 2], [2, 2, 2], [2, 3, 2], [2, 4, 2],
      [3, 1, 2], [3, 2, 2], [3, 3, 2], [4, 2, 2],
      [1, 2, 3], [2, 1, 3], [2, 2, 3], [2, 3, 3], [3, 2, 3],
      [2, 2, 4],
    ],
  },

  // Pyramid
  pyramid: {
    name: 'Pyramid',
    description: 'Four-sided pyramid',
    size: [7, 7, 4],
    cells: [
      // Base layer
      [1, 1, 0], [2, 1, 0], [3, 1, 0], [4, 1, 0], [5, 1, 0],
      [1, 2, 0], [2, 2, 0], [3, 2, 0], [4, 2, 0], [5, 2, 0],
      [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0], [5, 3, 0],
      [1, 4, 0], [2, 4, 0], [3, 4, 0], [4, 4, 0], [5, 4, 0],
      [1, 5, 0], [2, 5, 0], [3, 5, 0], [4, 5, 0], [5, 5, 0],
      // Second layer
      [2, 2, 1], [3, 2, 1], [4, 2, 1],
      [2, 3, 1], [3, 3, 1], [4, 3, 1],
      [2, 4, 1], [3, 4, 1], [4, 4, 1],
      // Third layer
      [3, 3, 2],
    ],
  },

  // Sphere
  sphere: {
    name: 'Sphere',
    description: 'Spherical arrangement of cells',
    size: [7, 7, 7],
    cells: [
      // Z=1
      [3, 2, 1], [2, 3, 1], [3, 3, 1], [4, 3, 1], [3, 4, 1],
      // Z=2
      [2, 2, 2], [3, 2, 2], [4, 2, 2],
      [2, 3, 2], [4, 3, 2],
      [2, 4, 2], [3, 4, 2], [4, 4, 2],
      // Z=3 (equator)
      [1, 2, 3], [2, 2, 3], [3, 2, 3], [4, 2, 3], [5, 2, 3],
      [1, 3, 3], [5, 3, 3],
      [1, 4, 3], [2, 4, 3], [3, 4, 3], [4, 4, 3], [5, 4, 3],
      // Z=4
      [2, 2, 4], [3, 2, 4], [4, 2, 4],
      [2, 3, 4], [4, 3, 4],
      [2, 4, 4], [3, 4, 4], [4, 4, 4],
      // Z=5
      [3, 2, 5], [2, 3, 5], [3, 3, 5], [4, 3, 5], [3, 4, 5],
    ],
  },

  // Helix
  helix: {
    name: 'Helix',
    description: 'Spiral helix structure',
    size: [7, 7, 10],
    cells: [
      [3, 1, 0], [4, 1, 0],
      [5, 3, 1], [5, 4, 1],
      [3, 5, 2], [4, 5, 2],
      [1, 3, 3], [1, 4, 3],
      [3, 1, 4], [4, 1, 4],
      [5, 3, 5], [5, 4, 5],
      [3, 5, 6], [4, 5, 6],
      [1, 3, 7], [1, 4, 7],
      [3, 1, 8], [4, 1, 8],
    ],
  },

  // R-pentomino (methuselah)
  rPentomino: {
    name: 'R-Pentomino',
    description: 'Classic methuselah pattern',
    size: [3, 3, 3],
    cells: [
      [1, 0, 1], [2, 0, 1],
      [0, 1, 1], [1, 1, 1],
      [1, 2, 1],
    ],
  },

  // Diehard
  diehard: {
    name: 'Diehard',
    description: 'Long-lived pattern that eventually dies',
    size: [8, 3, 3],
    cells: [
      [6, 0, 1],
      [0, 1, 1], [1, 1, 1],
      [1, 2, 1], [5, 2, 1], [6, 2, 1], [7, 2, 1],
    ],
  },

  // Acorn
  acorn: {
    name: 'Acorn',
    description: 'Methuselah with complex evolution',
    size: [7, 3, 3],
    cells: [
      [1, 0, 1],
      [3, 1, 1],
      [0, 2, 1], [1, 2, 1], [4, 2, 1], [5, 2, 1], [6, 2, 1],
    ],
  },

  // T-tetromino
  tTetromino: {
    name: 'T-Tetromino',
    description: 'T-shaped pattern',
    size: [3, 3, 3],
    cells: [
      [0, 0, 1], [1, 0, 1], [2, 0, 1],
      [1, 1, 1],
      [1, 2, 1],
    ],
  },

  // Plus sign
  plus: {
    name: 'Plus Sign',
    description: 'Plus-shaped pattern',
    size: [5, 5, 3],
    cells: [
      [2, 0, 1], [2, 1, 1],
      [0, 2, 1], [1, 2, 1], [2, 2, 1], [3, 2, 1], [4, 2, 1],
      [2, 3, 1], [2, 4, 1],
    ],
  },

  // Ring
  ring: {
    name: 'Ring',
    description: 'Circular ring of cells',
    size: [5, 5, 3],
    cells: [
      [1, 0, 1], [2, 0, 1], [3, 0, 1],
      [0, 1, 1], [4, 1, 1],
      [0, 2, 1], [4, 2, 1],
      [0, 3, 1], [4, 3, 1],
      [1, 4, 1], [2, 4, 1], [3, 4, 1],
    ],
  },

  // Double helix
  doubleHelix: {
    name: 'Double Helix',
    description: 'DNA-like double helix',
    size: [8, 8, 12],
    cells: [
      // First strand
      [2, 2, 0], [3, 2, 0],
      [4, 3, 1], [5, 3, 1],
      [4, 5, 2], [5, 5, 2],
      [2, 6, 3], [3, 6, 3],
      [2, 2, 4], [3, 2, 4],
      [4, 3, 5], [5, 3, 5],
      // Second strand
      [5, 5, 0], [6, 5, 0],
      [2, 4, 1], [3, 4, 1],
      [2, 2, 2], [3, 2, 2],
      [5, 1, 3], [6, 1, 3],
      [5, 5, 4], [6, 5, 4],
      [2, 4, 5], [3, 4, 5],
    ],
  },

  // Galaxy
  galaxy: {
    name: 'Galaxy',
    description: 'Spiral galaxy-like pattern',
    size: [9, 9, 3],
    cells: [
      [0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1],
      [0, 1, 1], [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 1], [5, 1, 1],
      [0, 2, 1],
      [8, 6, 1],
      [3, 7, 1], [4, 7, 1], [5, 7, 1], [6, 7, 1], [7, 7, 1], [8, 7, 1],
      [3, 8, 1], [4, 8, 1], [5, 8, 1], [6, 8, 1], [7, 8, 1], [8, 8, 1],
    ],
  },

  // Twin bees
  twinBees: {
    name: 'Twin Bees',
    description: 'Two interacting beehives',
    size: [8, 5, 3],
    cells: [
      [1, 1, 1], [2, 1, 1], [5, 1, 1], [6, 1, 1],
      [0, 2, 1], [3, 2, 1], [4, 2, 1], [7, 2, 1],
      [0, 3, 1], [3, 3, 1], [4, 3, 1], [7, 3, 1],
      [1, 4, 1], [2, 4, 1], [5, 4, 1], [6, 4, 1],
    ],
  },

  // Bi-block
  biBlock: {
    name: 'Bi-Block',
    description: 'Two blocks connected',
    size: [4, 4, 4],
    cells: [
      [0, 0, 0], [1, 0, 0],
      [0, 1, 0], [1, 1, 0],
      [2, 2, 2], [3, 2, 2],
      [2, 3, 2], [3, 3, 2],
    ],
  },

  // Spacefiller
  spacefiller: {
    name: 'Spacefiller',
    description: 'Pattern that fills space over time',
    size: [5, 5, 5],
    cells: [
      [1, 1, 1], [2, 1, 1], [3, 1, 1],
      [1, 2, 1], [3, 2, 1],
      [1, 3, 1], [2, 3, 1], [3, 3, 1],
      [2, 1, 2], [1, 2, 2], [3, 2, 2], [2, 3, 2],
      [2, 2, 3],
    ],
  },

  // Exploder
  exploder: {
    name: 'Exploder',
    description: 'Rapidly expanding pattern',
    size: [5, 5, 5],
    cells: [
      [0, 0, 2], [1, 0, 2], [2, 0, 2], [3, 0, 2], [4, 0, 2],
      [0, 1, 2], [4, 1, 2],
      [0, 2, 2], [2, 2, 2], [4, 2, 2],
      [0, 3, 2], [4, 3, 2],
      [0, 4, 2], [1, 4, 2], [2, 4, 2], [3, 4, 2], [4, 4, 2],
    ],
  },

  // Pentadecathlon
  pentadecathlon: {
    name: 'Pentadecathlon',
    description: 'Period-15 oscillator',
    size: [10, 3, 3],
    cells: [
      [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 1], [5, 1, 1],
      [6, 1, 1], [7, 1, 1], [8, 1, 1],
    ],
  },

  // Sidecar
  sidecar: {
    name: 'Sidecar',
    description: 'Moving pattern with trailing effect',
    size: [6, 6, 4],
    cells: [
      [2, 1, 1], [3, 1, 1],
      [1, 2, 1], [2, 2, 1], [2, 2, 2],
      [2, 3, 1], [2, 3, 2], [3, 3, 1],
      [2, 4, 2], [3, 4, 2],
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
