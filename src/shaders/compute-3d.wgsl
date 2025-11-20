// 3D Game of Life Compute Shader
// Implements cellular automaton with configurable rules

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

// Get cell state at (x, y, z)
fn getCell(x: i32, y: i32, z: i32) -> u32 {
  let size = i32(params.gridSize);
  
  // Wrap around boundaries (toroidal topology)
  let wx = (x + size) % size;
  let wy = (y + size) % size;
  let wz = (z + size) % size;
  
  let index = u32(wx + wy * size + wz * size * size);
  return cellsIn[index];
}

// Count living neighbors using Moore neighborhood (26 neighbors in 3D)
fn countNeighbors(x: i32, y: i32, z: i32) -> u32 {
  var count: u32 = 0u;
  
  for (var dx: i32 = -1; dx <= 1; dx++) {
    for (var dy: i32 = -1; dy <= 1; dy++) {
      for (var dz: i32 = -1; dz <= 1; dz++) {
        // Skip the center cell
        if (dx == 0 && dy == 0 && dz == 0) {
          continue;
        }
        
        count += getCell(x + dx, y + dy, z + dz);
      }
    }
  }
  
  return count;
}

@compute @workgroup_size(8, 8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let size = params.gridSize;
  
  // Check bounds
  if (global_id.x >= size || global_id.y >= size || global_id.z >= size) {
    return;
  }
  
  let x = i32(global_id.x);
  let y = i32(global_id.y);
  let z = i32(global_id.z);
  
  let index = global_id.x + global_id.y * size + global_id.z * size * size;
  let currentState = cellsIn[index];
  let neighbors = countNeighbors(x, y, z);
  
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
  
  cellsOut[index] = newState;
}
