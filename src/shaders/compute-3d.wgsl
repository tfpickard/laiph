// 3D Game of Life Compute Shader
// Uses Moore neighborhood (26 neighbors in 3D)

struct Uniforms {
    gridSize: vec3<u32>,
    _padding1: u32,
    surviveMin: u32,
    surviveMax: u32,
    birthMin: u32,
    birthMax: u32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> inputGrid: array<u32>;
@group(0) @binding(2) var<storage, read_write> outputGrid: array<u32>;

// Convert 3D coordinates to 1D index
fn coordsToIndex(coords: vec3<u32>) -> u32 {
    return coords.x + coords.y * uniforms.gridSize.x + coords.z * uniforms.gridSize.x * uniforms.gridSize.y;
}

// Get cell state with boundary wrapping (toroidal topology)
fn getCell(coords: vec3<i32>) -> u32 {
    let size = vec3<i32>(uniforms.gridSize);
    let wrapped = vec3<u32>(
        u32((coords.x + size.x) % size.x),
        u32((coords.y + size.y) % size.y),
        u32((coords.z + size.z) % size.z)
    );
    return inputGrid[coordsToIndex(wrapped)];
}

// Count living neighbors (26-neighborhood in 3D)
fn countNeighbors(coords: vec3<i32>) -> u32 {
    var count: u32 = 0u;

    for (var dx: i32 = -1; dx <= 1; dx++) {
        for (var dy: i32 = -1; dy <= 1; dy++) {
            for (var dz: i32 = -1; dz <= 1; dz++) {
                // Skip the center cell
                if (dx == 0 && dy == 0 && dz == 0) {
                    continue;
                }

                let neighborCoords = coords + vec3<i32>(dx, dy, dz);
                count += getCell(neighborCoords);
            }
        }
    }

    return count;
}

@compute @workgroup_size(8, 8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    // Check if we're within bounds
    if (global_id.x >= uniforms.gridSize.x ||
        global_id.y >= uniforms.gridSize.y ||
        global_id.z >= uniforms.gridSize.z) {
        return;
    }

    let coords = vec3<i32>(global_id);
    let index = coordsToIndex(global_id);
    let currentState = inputGrid[index];
    let neighbors = countNeighbors(coords);

    // Apply Game of Life rules
    var newState: u32 = 0u;

    if (currentState == 1u) {
        // Cell is alive - check survival conditions
        if (neighbors >= uniforms.surviveMin && neighbors <= uniforms.surviveMax) {
            newState = 1u;
        }
    } else {
        // Cell is dead - check birth conditions
        if (neighbors >= uniforms.birthMin && neighbors <= uniforms.birthMax) {
            newState = 1u;
        }
    }

    outputGrid[index] = newState;
}
