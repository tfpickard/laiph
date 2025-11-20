// 4D Game of Life Compute Shader
// Uses 4D Moore neighborhood (80 neighbors in 4D)

struct Uniforms {
    gridSize: vec4<u32>,
    surviveMin: u32,
    surviveMax: u32,
    birthMin: u32,
    birthMax: u32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> inputGrid: array<u32>;
@group(0) @binding(2) var<storage, read_write> outputGrid: array<u32>;

// Convert 4D coordinates to 1D index
fn coordsToIndex(coords: vec4<u32>) -> u32 {
    return coords.x +
           coords.y * uniforms.gridSize.x +
           coords.z * uniforms.gridSize.x * uniforms.gridSize.y +
           coords.w * uniforms.gridSize.x * uniforms.gridSize.y * uniforms.gridSize.z;
}

// Get cell state with boundary wrapping (4D toroidal topology)
fn getCell(coords: vec4<i32>) -> u32 {
    let size = vec4<i32>(uniforms.gridSize);
    let wrapped = vec4<u32>(
        u32((coords.x + size.x) % size.x),
        u32((coords.y + size.y) % size.y),
        u32((coords.z + size.z) % size.z),
        u32((coords.w + size.w) % size.w)
    );
    return inputGrid[coordsToIndex(wrapped)];
}

// Count living neighbors (80-neighborhood in 4D)
fn countNeighbors(coords: vec4<i32>) -> u32 {
    var count: u32 = 0u;

    for (var dx: i32 = -1; dx <= 1; dx++) {
        for (var dy: i32 = -1; dy <= 1; dy++) {
            for (var dz: i32 = -1; dz <= 1; dz++) {
                for (var dw: i32 = -1; dw <= 1; dw++) {
                    // Skip the center cell
                    if (dx == 0 && dy == 0 && dz == 0 && dw == 0) {
                        continue;
                    }

                    let neighborCoords = coords + vec4<i32>(dx, dy, dz, dw);
                    count += getCell(neighborCoords);
                }
            }
        }
    }

    return count;
}

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    // In 4D, we dispatch multiple compute passes for each W slice
    // The W coordinate is passed via a push constant or uniform
    // For simplicity, we'll handle the full 4D grid by iterating W here

    for (var w: u32 = 0u; w < uniforms.gridSize.w; w++) {
        // Check if we're within bounds (XYZ dimensions)
        if (global_id.x >= uniforms.gridSize.x ||
            global_id.y >= uniforms.gridSize.y ||
            global_id.z >= uniforms.gridSize.z) {
            continue;
        }

        let coords4d = vec4<i32>(i32(global_id.x), i32(global_id.y), i32(global_id.z), i32(w));
        let index = coordsToIndex(vec4<u32>(global_id.x, global_id.y, global_id.z, w));
        let currentState = inputGrid[index];
        let neighbors = countNeighbors(coords4d);

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
}
