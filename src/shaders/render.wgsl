// Vertex shader for instanced voxel rendering

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) instancePos: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) normal: vec3<f32>,
}

struct Uniforms {
  viewProjection: mat4x4<f32>,
  gridSize: f32,
  time: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  // Scale and position the voxel
  let scale = 0.8 / uniforms.gridSize;
  let offset = vec3<f32>(-0.5, -0.5, -0.5);
  
  let scaledPos = input.position * scale;
  let worldPos = scaledPos + (input.instancePos / uniforms.gridSize) + offset;
  
  output.position = uniforms.viewProjection * vec4<f32>(worldPos, 1.0);
  output.worldPos = worldPos;
  output.normal = normalize(input.position);
  
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  // Simple shading with normal-based coloring
  let lightDir = normalize(vec3<f32>(1.0, 1.0, 1.0));
  let diffuse = max(dot(input.normal, lightDir), 0.0);
  
  // Color based on position for visual interest
  let baseColor = vec3<f32>(
    0.3 + input.worldPos.x + 0.5,
    0.3 + input.worldPos.y + 0.5,
    0.6 + input.worldPos.z + 0.5
  );
  
  let ambient = 0.3;
  let finalColor = baseColor * (ambient + diffuse * 0.7);
  
  return vec4<f32>(finalColor, 1.0);
}
