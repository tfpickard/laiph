// 4D Game of Life Compute Shader
// Implements cellular automaton in 4D hypergrid

struct SimParams {
  gridSize: u32,
  survivalMin: u32,
  survivalMax: u32,
  birthMin: u32,
  birthMax: u32,
}

@group(0) @binding(0) var<uniform> params: SimParams;
@group(0) @binding(1) var<storage, read> cellsIn: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellsOut: array<u32>;

// Get cell state at (x, y, z, w)
fn getCell(x: i32, y: i32, z: i32, w: i32) -> u32 {
  let size = i32(params.gridSize);
  
  // Wrap around boundaries (toroidal topology in 4D)
  let wx = (x + size) % size;
  let wy = (y + size) % size;
  let wz = (z + size) % size;
  let ww = (w + size) % size;
  
  let index = u32(wx + wy * size + wz * size * size + ww * size * size * size);
  return cellsIn[index];
}

// Count living neighbors using 4D Moore neighborhood (80 neighbors)
fn countNeighbors(x: i32, y: i32, z: i32, w: i32) -> u32 {
  var count: u32 = 0u;
  
  for (var dx: i32 = -1; dx <= 1; dx++) {
    for (var dy: i32 = -1; dy <= 1; dy++) {
      for (var dz: i32 = -1; dz <= 1; dz++) {
        for (var dw: i32 = -1; dw <= 1; dw++) {
          // Skip the center cell
          if (dx == 0 && dy == 0 && dz == 0 && dw == 0) {
            continue;
          }
          
          count += getCell(x + dx, y + dy, z + dz, w + dw);
        }
      }
    }
  }
  
  return count;
}

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let size = params.gridSize;
  
  // Map 3D workgroup to 4D space
  // We'll process the 4D grid in slices
  let total = size * size * size * size;
  let linear_id = global_id.x + global_id.y * (size * 4u) + global_id.z * (size * 4u) * (size * 4u);
  
  if (linear_id >= total) {
    return;
  }
  
  // Convert linear index to 4D coordinates
  var temp = linear_id;
  let x = i32(temp % size);
  temp = temp / size;
  let y = i32(temp % size);
  temp = temp / size;
  let z = i32(temp % size);
  temp = temp / size;
  let w = i32(temp % size);
  
  let currentState = cellsIn[linear_id];
  let neighbors = countNeighbors(x, y, z, w);
  
  var newState: u32 = 0u;
  
  if (currentState == 1u) {
    // Cell is alive - check survival conditions
    if (neighbors >= params.survivalMin && neighbors <= params.survivalMax) {
      newState = 1u;
    }
  } else {
    // Cell is dead - check birth conditions
    if (neighbors >= params.birthMin && neighbors <= params.birthMax) {
      newState = 1u;
    }
  }
  
  cellsOut[linear_id] = newState;
}
