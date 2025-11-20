/**
 * GameOfLife4D - 4D cellular automaton implementation with WebGPU
 */

import { GPUEngine } from './GPUEngine';

export interface GameOfLife4DConfig {
  gridSize: number;
  survivalMin: number;
  survivalMax: number;
  birthMin: number;
  birthMax: number;
}

export class GameOfLife4D {
  private engine: GPUEngine;
  private config: GameOfLife4DConfig;
  private cellBuffers: [GPUBuffer, GPUBuffer];
  private paramsBuffer: GPUBuffer;
  private bindGroups: [GPUBindGroup, GPUBindGroup];
  private computePipeline: GPUComputePipeline;
  private currentBuffer = 0;
  private totalCells: number;
  private generation = 0;

  constructor(engine: GPUEngine, config: GameOfLife4DConfig) {
    this.engine = engine;
    this.config = config;
    this.totalCells = config.gridSize ** 4;

    if (!engine.device) {
      throw new Error('GPU device not initialized');
    }

    // Create storage buffers
    const bufferSize = this.totalCells * Uint32Array.BYTES_PER_ELEMENT;
    this.cellBuffers = [
      engine.createBuffer(
        bufferSize,
        GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
      ),
      engine.createBuffer(
        bufferSize,
        GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
      ),
    ];

    this.paramsBuffer = this.createParamsBuffer();
    this.computePipeline = this.createComputePipeline();
    this.bindGroups = [
      this.createBindGroup(0, 1),
      this.createBindGroup(1, 0),
    ];
  }

  private createParamsBuffer(): GPUBuffer {
    const params = new Uint32Array([
      this.config.gridSize,
      this.config.survivalMin,
      this.config.survivalMax,
      this.config.birthMin,
      this.config.birthMax,
      0, 0, 0,
    ]);

    return this.engine.createUniformBuffer(params.buffer);
  }

  private createComputePipeline(): GPUComputePipeline {
    if (!this.engine.device) {
      throw new Error('Device not initialized');
    }

    const shaderCode = `
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

fn getCell(x: i32, y: i32, z: i32, w: i32) -> u32 {
  let size = i32(params.gridSize);
  let wx = (x + size) % size;
  let wy = (y + size) % size;
  let wz = (z + size) % size;
  let ww = (w + size) % size;
  let index = u32(wx + wy * size + wz * size * size + ww * size * size * size);
  return cellsIn[index];
}

fn countNeighbors(x: i32, y: i32, z: i32, w: i32) -> u32 {
  var count: u32 = 0u;
  for (var dx: i32 = -1; dx <= 1; dx++) {
    for (var dy: i32 = -1; dy <= 1; dy++) {
      for (var dz: i32 = -1; dz <= 1; dz++) {
        for (var dw: i32 = -1; dw <= 1; dw++) {
          if (dx == 0 && dy == 0 && dz == 0 && dw == 0) { continue; }
          count += getCell(x + dx, y + dy, z + dz, w + dw);
        }
      }
    }
  }
  return count;
}

@compute @workgroup_size(8, 8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let size = params.gridSize;
  let linearId = global_id.x + global_id.y * size * 8u + global_id.z * size * size * 64u;
  let total = size * size * size * size;
  
  if (linearId >= total) { return; }
  
  var temp = linearId;
  let x = i32(temp % size);
  temp = temp / size;
  let y = i32(temp % size);
  temp = temp / size;
  let z = i32(temp % size);
  temp = temp / size;
  let w = i32(temp % size);
  
  let currentState = cellsIn[linearId];
  let neighbors = countNeighbors(x, y, z, w);
  
  var newState: u32 = 0u;
  if (currentState == 1u) {
    if (neighbors >= params.survivalMin && neighbors <= params.survivalMax) {
      newState = 1u;
    }
  } else {
    if (neighbors >= params.birthMin && neighbors <= params.birthMax) {
      newState = 1u;
    }
  }
  cellsOut[linearId] = newState;
}
`;

    const shaderModule = this.engine.device.createShaderModule({
      code: shaderCode,
    });

    const bindGroupLayout = this.engine.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'read-only-storage' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' },
        },
      ],
    });

    const pipelineLayout = this.engine.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    return this.engine.device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  private createBindGroup(inputIndex: number, outputIndex: number): GPUBindGroup {
    if (!this.engine.device) {
      throw new Error('Device not initialized');
    }

    return this.engine.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.paramsBuffer } },
        { binding: 1, resource: { buffer: this.cellBuffers[inputIndex] } },
        { binding: 2, resource: { buffer: this.cellBuffers[outputIndex] } },
      ],
    });
  }

  seed(cells: Uint32Array): void {
    if (cells.length !== this.totalCells) {
      throw new Error(`Cell array size mismatch. Expected ${this.totalCells}, got ${cells.length}`);
    }

    this.engine.writeBuffer(this.cellBuffers[this.currentBuffer], cells.buffer as ArrayBuffer);
    this.generation = 0;
  }

  seedRandom(density: number): void {
    const cells = new Uint32Array(this.totalCells);
    for (let i = 0; i < this.totalCells; i++) {
      cells[i] = Math.random() < density ? 1 : 0;
    }
    this.seed(cells);
  }

  step(): void {
    if (!this.engine.device) {
      throw new Error('Device not initialized');
    }

    const commandEncoder = this.engine.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();

    passEncoder.setPipeline(this.computePipeline);
    passEncoder.setBindGroup(0, this.bindGroups[this.currentBuffer]);

    // Calculate workgroups for 4D grid
    const size = this.config.gridSize;
    const workgroupSize = 8;
    const totalWorkgroups = Math.ceil((size ** 4) / (workgroupSize ** 3));
    const workgroupsPerDim = Math.ceil(Math.cbrt(totalWorkgroups));
    
    passEncoder.dispatchWorkgroups(workgroupsPerDim, workgroupsPerDim, workgroupsPerDim);
    passEncoder.end();

    this.engine.device.queue.submit([commandEncoder.finish()]);

    this.currentBuffer = 1 - this.currentBuffer;
    this.generation++;
  }

  async getCells(): Promise<Uint32Array> {
    const buffer = await this.engine.readBuffer(
      this.cellBuffers[this.currentBuffer],
      this.totalCells * Uint32Array.BYTES_PER_ELEMENT
    );
    return new Uint32Array(buffer);
  }

  // Get a 3D slice of the 4D grid at position w
  async getSlice(wPosition: number): Promise<Uint32Array> {
    const cells = await this.getCells();
    const size = this.config.gridSize;
    const sliceSize = size * size * size;
    const slice = new Uint32Array(sliceSize);

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const index4d = x + y * size + z * size * size + wPosition * size * size * size;
          const index3d = x + y * size + z * size * size;
          slice[index3d] = cells[index4d];
        }
      }
    }

    return slice;
  }

  getCurrentBuffer(): GPUBuffer {
    return this.cellBuffers[this.currentBuffer];
  }

  getGeneration(): number {
    return this.generation;
  }

  updateRules(rules: Partial<GameOfLife4DConfig>): void {
    this.config = { ...this.config, ...rules };
    const params = new Uint32Array([
      this.config.gridSize,
      this.config.survivalMin,
      this.config.survivalMax,
      this.config.birthMin,
      this.config.birthMax,
      0, 0, 0,
    ]);
    this.engine.writeBuffer(this.paramsBuffer, params.buffer);
  }

  destroy(): void {
    this.cellBuffers[0].destroy();
    this.cellBuffers[1].destroy();
    this.paramsBuffer.destroy();
  }
}
