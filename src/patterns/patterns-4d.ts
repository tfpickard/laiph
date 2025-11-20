/**
 * 4D Game of Life patterns
 */

export interface Pattern4D {
  name: string;
  description: string;
  cells: Array<[number, number, number, number]>;
}

export const patterns4D: Record<string, Pattern4D> = {
  glider: {
    name: '4D Glider',
    description: 'A gliding pattern in 4D space',
    cells: [
      [1, 0, 0, 0],
      [2, 1, 0, 0],
      [0, 2, 0, 0],
      [1, 2, 0, 0],
      [2, 2, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 0, 1],
    ],
  },

  blinker: {
    name: '4D Blinker',
    description: 'Oscillating pattern in 4D',
    cells: [
      [1, 0, 1, 1],
      [1, 1, 1, 1],
      [1, 2, 1, 1],
    ],
  },

  tesseract: {
    name: 'Mini Tesseract',
    description: 'A small 4D hypercube structure',
    cells: [
      // w=0 cube
      [0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0],
      [0, 0, 1, 0], [1, 0, 1, 0], [0, 1, 1, 0], [1, 1, 1, 0],
      // w=1 cube
      [0, 0, 0, 1], [1, 0, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1],
      [0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1],
    ],
  },

  cross4d: {
    name: '4D Cross',
    description: 'A cross pattern extending in all 4 dimensions',
    cells: [
      [1, 1, 1, 0], [1, 1, 1, 2],
      [1, 1, 0, 1], [1, 1, 2, 1],
      [1, 0, 1, 1], [1, 2, 1, 1],
      [0, 1, 1, 1], [2, 1, 1, 1],
      [1, 1, 1, 1], // center
    ],
  },
};

export function placePattern4D(
  pattern: Pattern4D,
  gridSize: number,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0,
  offsetW = 0
): Uint32Array {
  const cells = new Uint32Array(gridSize ** 4);
  
  const centerX = Math.floor(gridSize / 2) + offsetX;
  const centerY = Math.floor(gridSize / 2) + offsetY;
  const centerZ = Math.floor(gridSize / 2) + offsetZ;
  const centerW = Math.floor(gridSize / 2) + offsetW;

  pattern.cells.forEach(([x, y, z, w]) => {
    const px = (centerX + x) % gridSize;
    const py = (centerY + y) % gridSize;
    const pz = (centerZ + z) % gridSize;
    const pw = (centerW + w) % gridSize;
    
    const index = px + py * gridSize + pz * gridSize * gridSize + pw * gridSize * gridSize * gridSize;
    cells[index] = 1;
  });

  return cells;
}
