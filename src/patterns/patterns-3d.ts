/**
 * 3D Game of Life patterns
 */

export interface Pattern3D {
  name: string;
  description: string;
  cells: Array<[number, number, number]>;
}

export const patterns3D: Record<string, Pattern3D> = {
  glider: {
    name: '3D Glider',
    description: 'A simple gliding pattern in 3D space',
    cells: [
      [1, 0, 0],
      [2, 1, 0],
      [0, 2, 0],
      [1, 2, 0],
      [2, 2, 0],
      [1, 1, 1],
    ],
  },

  blinker: {
    name: '3D Blinker',
    description: 'Oscillating pattern in 3D',
    cells: [
      [1, 0, 1],
      [1, 1, 1],
      [1, 2, 1],
    ],
  },

  pulsar: {
    name: '3D Pulsar',
    description: 'A larger oscillating structure',
    cells: [
      // Layer z=0
      [2, 0, 0], [3, 0, 0], [4, 0, 0],
      [0, 2, 0], [0, 3, 0], [0, 4, 0],
      [5, 2, 0], [5, 3, 0], [5, 4, 0],
      [2, 5, 0], [3, 5, 0], [4, 5, 0],
      
      // Layer z=1
      [1, 1, 1], [2, 1, 1], [3, 1, 1],
      [1, 2, 1], [1, 3, 1],
      [4, 2, 1], [4, 3, 1],
      [2, 4, 1], [3, 4, 1],
    ],
  },

  cube: {
    name: 'Small Cube',
    description: 'A simple 2x2x2 cube structure',
    cells: [
      [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
      [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
    ],
  },

  cross: {
    name: '3D Cross',
    description: 'A cross pattern in 3D',
    cells: [
      [1, 0, 1], [0, 1, 1], [1, 1, 1], [2, 1, 1], [1, 2, 1],
      [1, 1, 0], [1, 1, 2],
    ],
  },
};

export function placePattern3D(
  pattern: Pattern3D,
  gridSize: number,
  offsetX = 0,
  offsetY = 0,
  offsetZ = 0
): Uint32Array {
  const cells = new Uint32Array(gridSize ** 3);
  
  const centerX = Math.floor(gridSize / 2) + offsetX;
  const centerY = Math.floor(gridSize / 2) + offsetY;
  const centerZ = Math.floor(gridSize / 2) + offsetZ;

  pattern.cells.forEach(([x, y, z]) => {
    const px = (centerX + x) % gridSize;
    const py = (centerY + y) % gridSize;
    const pz = (centerZ + z) % gridSize;
    
    const index = px + py * gridSize + pz * gridSize * gridSize;
    cells[index] = 1;
  });

  return cells;
}
