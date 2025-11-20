/**
 * 4D Game of Life Pattern Library
 */

export interface Pattern4D {
  name: string;
  description: string;
  size: [number, number, number, number];
  cells: [number, number, number, number][];
  rules?: {
    surviveMin: number;
    surviveMax: number;
    birthMin: number;
    birthMax: number;
  };
}

export const PATTERNS_4D: Record<string, Pattern4D> = {
  // Single cell (dies immediately)
  single: {
    name: 'Single Cell',
    description: 'A single cell in 4D space',
    size: [1, 1, 1, 1],
    cells: [[0, 0, 0, 0]],
  },

  // 4D Hypercube (tesseract)
  tesseract: {
    name: 'Tesseract',
    description: 'A 4D hypercube structure',
    size: [3, 3, 3, 3],
    cells: [
      // W=0 cube vertices
      [0, 0, 0, 0], [2, 0, 0, 0], [0, 2, 0, 0], [2, 2, 0, 0],
      [0, 0, 2, 0], [2, 0, 2, 0], [0, 2, 2, 0], [2, 2, 2, 0],
      // W=2 cube vertices
      [0, 0, 0, 2], [2, 0, 0, 2], [0, 2, 0, 2], [2, 2, 0, 2],
      [0, 0, 2, 2], [2, 0, 2, 2], [0, 2, 2, 2], [2, 2, 2, 2],
    ],
  },

  // 4D Cross
  cross4d: {
    name: '4D Cross',
    description: 'A cross in all 4 dimensions',
    size: [5, 5, 5, 5],
    cells: [
      // X axis
      [0, 2, 2, 2], [1, 2, 2, 2], [2, 2, 2, 2], [3, 2, 2, 2], [4, 2, 2, 2],
      // Y axis
      [2, 0, 2, 2], [2, 1, 2, 2], [2, 3, 2, 2], [2, 4, 2, 2],
      // Z axis
      [2, 2, 0, 2], [2, 2, 1, 2], [2, 2, 3, 2], [2, 2, 4, 2],
      // W axis
      [2, 2, 2, 0], [2, 2, 2, 1], [2, 2, 2, 3], [2, 2, 2, 4],
    ],
  },

  // 4D Blinker
  blinker4d: {
    name: '4D Blinker',
    description: 'A simple 4D oscillator',
    size: [3, 3, 3, 3],
    cells: [
      [1, 0, 1, 1],
      [1, 1, 1, 1],
      [1, 2, 1, 1],
    ],
  },

  // 4D Diagonal
  diagonal4d: {
    name: '4D Diagonal',
    description: 'A diagonal line through 4D space',
    size: [6, 6, 6, 6],
    cells: [
      [0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2],
      [3, 3, 3, 3], [4, 4, 4, 4], [5, 5, 5, 5],
    ],
  },

  // 4D Block (stable)
  block4d: {
    name: '4D Block',
    description: 'A stable 4D configuration',
    size: [2, 2, 2, 2],
    cells: [
      [0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0],
      [0, 0, 1, 0], [1, 0, 1, 0], [0, 1, 1, 0], [1, 1, 1, 0],
      [0, 0, 0, 1], [1, 0, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1],
      [0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1],
    ],
  },

  // 4D Plane
  plane4d: {
    name: '4D Plane',
    description: 'A 2D plane in 4D space (XY plane at Z=2, W=2)',
    size: [5, 5, 5, 5],
    cells: [
      [1, 1, 2, 2], [2, 1, 2, 2], [3, 1, 2, 2],
      [1, 2, 2, 2], [2, 2, 2, 2], [3, 2, 2, 2],
      [1, 3, 2, 2], [2, 3, 2, 2], [3, 3, 2, 2],
    ],
  },

  // 4D Glider (experimental)
  glider4d: {
    name: '4D Glider',
    description: 'An experimental 4D glider pattern',
    size: [5, 5, 5, 5],
    cells: [
      [2, 1, 2, 2], [3, 1, 2, 2],
      [1, 2, 2, 2], [2, 2, 2, 2], [2, 2, 3, 2],
      [2, 3, 1, 2], [2, 3, 2, 2], [3, 3, 2, 2],
      [2, 2, 2, 1], [2, 2, 2, 3],
    ],
  },

  // Random 4D cloud
  randomCloud4d: {
    name: 'Random 4D Cloud',
    description: 'A sparse random cloud in 4D',
    size: [8, 8, 8, 8],
    cells: [], // Will be filled randomly
  },

  // 4D Sphere (hypersphere)
  hypersphere: {
    name: 'Hypersphere',
    description: '4D sphere surface',
    size: [5, 5, 5, 5],
    cells: [
      // Distance 2 from center (2,2,2,2)
      [0, 2, 2, 2], [4, 2, 2, 2],
      [2, 0, 2, 2], [2, 4, 2, 2],
      [2, 2, 0, 2], [2, 2, 4, 2],
      [2, 2, 2, 0], [2, 2, 2, 4],
      // Distance sqrt(2) from center
      [1, 1, 2, 2], [3, 1, 2, 2], [1, 3, 2, 2], [3, 3, 2, 2],
      [1, 2, 1, 2], [3, 2, 1, 2], [1, 2, 3, 2], [3, 2, 3, 2],
      [2, 1, 1, 2], [2, 3, 1, 2], [2, 1, 3, 2], [2, 3, 3, 2],
      [1, 2, 2, 1], [3, 2, 2, 1], [1, 2, 2, 3], [3, 2, 2, 3],
      [2, 1, 2, 1], [2, 3, 2, 1], [2, 1, 2, 3], [2, 3, 2, 3],
      [2, 2, 1, 1], [2, 2, 3, 1], [2, 2, 1, 3], [2, 2, 3, 3],
    ],
  },

  // 4D Octahedron (16-cell)
  hexadecachoron: {
    name: '16-Cell',
    description: '4D octahedron (regular 16-cell)',
    size: [5, 5, 5, 5],
    cells: [
      [2, 2, 2, 0], [2, 2, 2, 4],
      [2, 2, 0, 2], [2, 2, 4, 2],
      [2, 0, 2, 2], [2, 4, 2, 2],
      [0, 2, 2, 2], [4, 2, 2, 2],
    ],
  },

  // 4D Double cross
  doubleCross4d: {
    name: '4D Double Cross',
    description: 'Two perpendicular 4D crosses',
    size: [7, 7, 7, 7],
    cells: [
      // First cross (X-Y plane at Z=3, W=3)
      [1, 3, 3, 3], [2, 3, 3, 3], [3, 3, 3, 3], [4, 3, 3, 3], [5, 3, 3, 3],
      [3, 1, 3, 3], [3, 2, 3, 3], [3, 4, 3, 3], [3, 5, 3, 3],
      // Second cross (Z-W plane at X=3, Y=3)
      [3, 3, 1, 3], [3, 3, 2, 3], [3, 3, 4, 3], [3, 3, 5, 3],
      [3, 3, 3, 1], [3, 3, 3, 2], [3, 3, 3, 4], [3, 3, 3, 5],
    ],
  },

  // 4D Ring
  ring4d: {
    name: '4D Ring',
    description: 'Circular ring in 4D',
    size: [6, 6, 3, 3],
    cells: [
      [1, 1, 1, 1], [2, 0, 1, 1], [3, 0, 1, 1], [4, 1, 1, 1],
      [0, 2, 1, 1], [5, 2, 1, 1],
      [0, 3, 1, 1], [5, 3, 1, 1],
      [1, 4, 1, 1], [2, 5, 1, 1], [3, 5, 1, 1], [4, 4, 1, 1],
    ],
  },

  // 4D Tube
  tube4d: {
    name: '4D Tube',
    description: 'Tubular structure through W dimension',
    size: [5, 5, 3, 8],
    cells: [
      // Ring at each W slice
      [1, 1, 1, 0], [2, 1, 1, 0], [3, 1, 1, 0],
      [1, 3, 1, 0], [2, 3, 1, 0], [3, 3, 1, 0],
      [0, 2, 1, 0], [4, 2, 1, 0],

      [1, 1, 1, 2], [2, 1, 1, 2], [3, 1, 1, 2],
      [1, 3, 1, 2], [2, 3, 1, 2], [3, 3, 1, 2],
      [0, 2, 1, 2], [4, 2, 1, 2],

      [1, 1, 1, 4], [2, 1, 1, 4], [3, 1, 1, 4],
      [1, 3, 1, 4], [2, 3, 1, 4], [3, 3, 1, 4],
      [0, 2, 1, 4], [4, 2, 1, 4],

      [1, 1, 1, 6], [2, 1, 1, 6], [3, 1, 1, 6],
      [1, 3, 1, 6], [2, 3, 1, 6], [3, 3, 1, 6],
      [0, 2, 1, 6], [4, 2, 1, 6],
    ],
  },

  // 4D Spiral
  spiral4d: {
    name: '4D Spiral',
    description: 'Spiral through 4D space',
    size: [6, 6, 6, 6],
    cells: [
      [3, 1, 2, 0], [4, 1, 2, 0],
      [5, 3, 3, 1], [5, 4, 3, 1],
      [3, 5, 4, 2], [4, 5, 4, 2],
      [0, 3, 3, 3], [0, 4, 3, 3],
      [3, 0, 2, 4], [4, 0, 2, 4],
      [5, 3, 1, 5], [5, 4, 1, 5],
    ],
  },

  // 4D Lattice
  lattice4d: {
    name: '4D Lattice',
    description: 'Regular lattice structure',
    size: [7, 7, 7, 7],
    cells: [
      [1, 1, 1, 1], [3, 1, 1, 1], [5, 1, 1, 1],
      [1, 3, 1, 1], [3, 3, 1, 1], [5, 3, 1, 1],
      [1, 5, 1, 1], [3, 5, 1, 1], [5, 5, 1, 1],

      [1, 1, 3, 3], [3, 1, 3, 3], [5, 1, 3, 3],
      [1, 3, 3, 3], [3, 3, 3, 3], [5, 3, 3, 3],
      [1, 5, 3, 3], [3, 5, 3, 3], [5, 5, 3, 3],

      [1, 1, 5, 5], [3, 1, 5, 5], [5, 1, 5, 5],
      [1, 3, 5, 5], [3, 3, 5, 5], [5, 3, 5, 5],
      [1, 5, 5, 5], [3, 5, 5, 5], [5, 5, 5, 5],
    ],
  },

  // 4D Pyramid
  pyramid4d: {
    name: '4D Pyramid',
    description: 'Pyramidal structure in 4D',
    size: [5, 5, 5, 5],
    cells: [
      // Base layer (W=0)
      [1, 1, 1, 0], [2, 1, 1, 0], [3, 1, 1, 0],
      [1, 2, 1, 0], [2, 2, 1, 0], [3, 2, 1, 0],
      [1, 3, 1, 0], [2, 3, 1, 0], [3, 3, 1, 0],
      // Middle layer (W=1)
      [2, 2, 2, 1],
      // Top (W=2)
      [2, 2, 2, 2],
    ],
  },

  // 4D Star
  star4d: {
    name: '4D Star',
    description: 'Star-shaped pattern radiating in 4D',
    size: [7, 7, 7, 7],
    cells: [
      // Center
      [3, 3, 3, 3],
      // Spikes along each axis
      [0, 3, 3, 3], [1, 3, 3, 3], [2, 3, 3, 3], [4, 3, 3, 3], [5, 3, 3, 3], [6, 3, 3, 3],
      [3, 0, 3, 3], [3, 1, 3, 3], [3, 2, 3, 3], [3, 4, 3, 3], [3, 5, 3, 3], [3, 6, 3, 3],
      [3, 3, 0, 3], [3, 3, 1, 3], [3, 3, 2, 3], [3, 3, 4, 3], [3, 3, 5, 3], [3, 3, 6, 3],
      [3, 3, 3, 0], [3, 3, 3, 1], [3, 3, 3, 2], [3, 3, 3, 4], [3, 3, 3, 5], [3, 3, 3, 6],
    ],
  },

  // 4D Torus
  torus4d: {
    name: '4D Torus',
    description: 'Toroidal structure in 4D',
    size: [8, 8, 3, 3],
    cells: [
      // Outer ring
      [2, 1, 1, 1], [3, 0, 1, 1], [4, 0, 1, 1], [5, 1, 1, 1],
      [1, 2, 1, 1], [6, 2, 1, 1],
      [0, 3, 1, 1], [0, 4, 1, 1], [7, 3, 1, 1], [7, 4, 1, 1],
      [1, 5, 1, 1], [6, 5, 1, 1],
      [2, 6, 1, 1], [3, 7, 1, 1], [4, 7, 1, 1], [5, 6, 1, 1],
      // Inner ring
      [3, 3, 1, 1], [4, 3, 1, 1],
      [3, 4, 1, 1], [4, 4, 1, 1],
    ],
  },

  // 4D Helix
  helix4d: {
    name: '4D Helix',
    description: 'Helical structure through 4D',
    size: [5, 5, 5, 10],
    cells: [
      [3, 1, 2, 0], [4, 1, 2, 0],
      [4, 3, 3, 1], [4, 4, 3, 1],
      [3, 4, 4, 2], [2, 4, 4, 2],
      [0, 3, 3, 3], [0, 2, 3, 3],
      [1, 0, 2, 4], [2, 0, 2, 4],
      [4, 1, 1, 5], [4, 2, 1, 5],
      [3, 4, 0, 6], [2, 4, 0, 6],
      [0, 3, 1, 7], [0, 2, 1, 7],
      [1, 0, 2, 8], [2, 0, 2, 8],
    ],
  },

  // 4D Knot
  knot4d: {
    name: '4D Knot',
    description: 'Knot-like structure in 4D',
    size: [6, 6, 6, 6],
    cells: [
      [2, 1, 2, 1], [3, 1, 2, 1],
      [4, 2, 2, 2], [4, 3, 2, 2],
      [3, 4, 2, 3], [2, 4, 2, 3],
      [1, 3, 2, 4], [1, 2, 2, 4],
      [2, 1, 3, 4], [3, 1, 3, 4],
      [4, 2, 3, 3], [4, 3, 3, 3],
      [3, 4, 3, 2], [2, 4, 3, 2],
      [1, 3, 3, 1], [1, 2, 3, 1],
    ],
  },

  // 4D Spinner
  spinner4d: {
    name: '4D Spinner',
    description: 'Rotating pattern in 4D space',
    size: [5, 5, 5, 5],
    cells: [
      [2, 1, 2, 2], [3, 1, 2, 2],
      [1, 2, 2, 2], [2, 2, 2, 2], [3, 2, 2, 2],
      [2, 3, 2, 2], [3, 3, 2, 2],
      [2, 2, 1, 2], [2, 2, 3, 2],
      [2, 2, 2, 1], [2, 2, 2, 3],
    ],
  },

  // 4D Frame
  frame4d: {
    name: '4D Frame',
    description: 'Hollow frame structure in 4D',
    size: [5, 5, 5, 5],
    cells: [
      // Edges of a 4D cube
      [0, 0, 0, 0], [4, 0, 0, 0], [0, 4, 0, 0], [4, 4, 0, 0],
      [0, 0, 4, 0], [4, 0, 4, 0], [0, 4, 4, 0], [4, 4, 4, 0],
      [0, 0, 0, 4], [4, 0, 0, 4], [0, 4, 0, 4], [4, 4, 0, 4],
      [0, 0, 4, 4], [4, 0, 4, 4], [0, 4, 4, 4], [4, 4, 4, 4],
    ],
  },
};

// Generate random 4D cloud cells (very sparse)
const cloud4dCells: [number, number, number, number][] = [];
for (let x = 2; x < 6; x++) {
  for (let y = 2; y < 6; y++) {
    for (let z = 2; z < 6; z++) {
      for (let w = 2; w < 6; w++) {
        if (Math.random() > 0.85) {
          cloud4dCells.push([x, y, z, w]);
        }
      }
    }
  }
}
PATTERNS_4D.randomCloud4d.cells = cloud4dCells;

export function createPatternGrid4D(
  pattern: Pattern4D,
  gridSize: [number, number, number, number],
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  offsetW = 0
): Uint32Array {
  const grid = new Uint32Array(gridSize[0] * gridSize[1] * gridSize[2] * gridSize[3]);

  // Center the pattern if no offset is provided
  if (offsetX === 0 && offsetY === 0 && offsetZ === 0 && offsetW === 0) {
    offsetX = Math.floor((gridSize[0] - pattern.size[0]) / 2);
    offsetY = Math.floor((gridSize[1] - pattern.size[1]) / 2);
    offsetZ = Math.floor((gridSize[2] - pattern.size[2]) / 2);
    offsetW = Math.floor((gridSize[3] - pattern.size[3]) / 2);
  }

  for (const [x, y, z, w] of pattern.cells) {
    const gridX = x + offsetX;
    const gridY = y + offsetY;
    const gridZ = z + offsetZ;
    const gridW = w + offsetW;

    if (
      gridX >= 0 && gridX < gridSize[0] &&
      gridY >= 0 && gridY < gridSize[1] &&
      gridZ >= 0 && gridZ < gridSize[2] &&
      gridW >= 0 && gridW < gridSize[3]
    ) {
      const index = gridX +
                    gridY * gridSize[0] +
                    gridZ * gridSize[0] * gridSize[1] +
                    gridW * gridSize[0] * gridSize[1] * gridSize[2];
      grid[index] = 1;
    }
  }

  return grid;
}
