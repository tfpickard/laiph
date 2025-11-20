/**
 * 3D Game of Life Engine using WebGPU compute shaders
 */

import { GPUEngine } from './GPUEngine';
import computeShader from '../shaders/compute-3d.wgsl?raw';

export interface GameOfLife3DConfig {
  gridSize: [number, number, number];
  surviveMin?: number;
  surviveMax?: number;
  birthMin?: number;
  birthMax?: number;
}

export class GameOfLife3D {
  private engine: GPUEngine;
  private gridSize: [number, number, number];
  private surviveMin: number;
  private surviveMax: number;
  private birthMin: number;
  private birthMax: number;

  private bufferA: GPUBuffer | null = null;
  private bufferB: GPUBuffer | null = null;
  private uniformBuffer: GPUBuffer | null = null;

  private computePipeline: GPUComputePipeline | null = null;
  private bindGroupA: GPUBindGroup | null = null;
  private bindGroupB: GPUBindGroup | null = null;

  private currentBuffer: 'A' | 'B' = 'A';
  private gridDataSize: number;

  constructor(engine: GPUEngine, config: GameOfLife3DConfig) {
    this.engine = engine;
    this.gridSize = config.gridSize;
    this.surviveMin = config.surviveMin ?? 4;
    this.surviveMax = config.surviveMax ?? 5;
    this.birthMin = config.birthMin ?? 5;
    this.birthMax = config.birthMax ?? 5;

    this.gridDataSize = this.gridSize[0] * this.gridSize[1] * this.gridSize[2];
  }

  async init(initialState?: Uint32Array): Promise<void> {
    const device = this.engine.device;

    // Create uniform buffer
    const uniformData = new ArrayBuffer(32); // 8 * 4 bytes
    const uniformView = new Uint32Array(uniformData);
    uniformView[0] = this.gridSize[0];
    uniformView[1] = this.gridSize[1];
    uniformView[2] = this.gridSize[2];
    uniformView[3] = 0; // padding
    uniformView[4] = this.surviveMin;
    uniformView[5] = this.surviveMax;
    uniformView[6] = this.birthMin;
    uniformView[7] = this.birthMax;

    this.uniformBuffer = this.engine.createUniformBuffer(uniformData);

    // Create storage buffers (double buffering)
    const bufferSize = this.gridDataSize * 4; // 4 bytes per u32

    let initData: Uint32Array;
    if (initialState) {
      initData = initialState;
    } else {
      // Random initialization (sparse - ~5% density)
      initData = new Uint32Array(this.gridDataSize);
      for (let i = 0; i < this.gridDataSize; i++) {
        initData[i] = Math.random() > 0.95 ? 1 : 0;
      }
    }

    this.bufferA = this.engine.createStorageBuffer(bufferSize, initData);
    this.bufferB = this.engine.createStorageBuffer(bufferSize);

    // Create compute pipeline
    const shaderModule = device.createShaderModule({
      code: computeShader,
    });

    this.computePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    // Create bind groups for ping-pong buffers
    const bindGroupLayout = this.computePipeline.getBindGroupLayout(0);

    this.bindGroupA = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.bufferA } },
        { binding: 2, resource: { buffer: this.bufferB } },
      ],
    });

    this.bindGroupB = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.bufferB } },
        { binding: 2, resource: { buffer: this.bufferA } },
      ],
    });
  }

  step(): void {
    if (!this.computePipeline || !this.bindGroupA || !this.bindGroupB) {
      throw new Error('GameOfLife3D not initialized');
    }

    const device = this.engine.device;
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();

    passEncoder.setPipeline(this.computePipeline);

    // Use the appropriate bind group based on current buffer
    const bindGroup = this.currentBuffer === 'A' ? this.bindGroupA : this.bindGroupB;
    passEncoder.setBindGroup(0, bindGroup);

    // Dispatch workgroups (8x8x8 workgroup size)
    const workgroupsX = Math.ceil(this.gridSize[0] / 8);
    const workgroupsY = Math.ceil(this.gridSize[1] / 8);
    const workgroupsZ = Math.ceil(this.gridSize[2] / 8);
    passEncoder.dispatchWorkgroups(workgroupsX, workgroupsY, workgroupsZ);

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    // Swap buffers
    this.currentBuffer = this.currentBuffer === 'A' ? 'B' : 'A';
  }

  async getState(): Promise<Uint32Array> {
    const outputBuffer = this.currentBuffer === 'A' ? this.bufferB : this.bufferA;
    if (!outputBuffer) {
      throw new Error('Buffers not initialized');
    }
    return this.engine.readBuffer(outputBuffer, this.gridDataSize * 4);
  }

  getCurrentBuffer(): GPUBuffer {
    const buffer = this.currentBuffer === 'A' ? this.bufferB : this.bufferA;
    if (!buffer) {
      throw new Error('Buffers not initialized');
    }
    return buffer;
  }

  getGridSize(): [number, number, number] {
    return this.gridSize;
  }

  updateRules(surviveMin: number, surviveMax: number, birthMin: number, birthMax: number): void {
    this.surviveMin = surviveMin;
    this.surviveMax = surviveMax;
    this.birthMin = birthMin;
    this.birthMax = birthMax;

    // Update uniform buffer
    const uniformData = new ArrayBuffer(32);
    const uniformView = new Uint32Array(uniformData);
    uniformView[0] = this.gridSize[0];
    uniformView[1] = this.gridSize[1];
    uniformView[2] = this.gridSize[2];
    uniformView[3] = 0;
    uniformView[4] = this.surviveMin;
    uniformView[5] = this.surviveMax;
    uniformView[6] = this.birthMin;
    uniformView[7] = this.birthMax;

    if (this.uniformBuffer) {
      this.engine.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }
  }

  reset(initialState?: Uint32Array): void {
    let initData: Uint32Array;
    if (initialState) {
      initData = initialState;
    } else {
      // Random initialization (sparse - ~5% density)
      initData = new Uint32Array(this.gridDataSize);
      for (let i = 0; i < this.gridDataSize; i++) {
        initData[i] = Math.random() > 0.95 ? 1 : 0;
      }
    }

    if (this.bufferA && this.bufferB) {
      // Ensure we have a proper ArrayBuffer (not SharedArrayBuffer)
      const bufferData = new Uint32Array(initData);
      this.engine.device.queue.writeBuffer(this.bufferA, 0, bufferData);
      // Clear buffer B
      const emptyData = new Uint32Array(this.gridDataSize);
      this.engine.device.queue.writeBuffer(this.bufferB, 0, emptyData);
      this.currentBuffer = 'A';
    }
  }

  destroy(): void {
    this.bufferA?.destroy();
    this.bufferB?.destroy();
    this.uniformBuffer?.destroy();
  }
}
