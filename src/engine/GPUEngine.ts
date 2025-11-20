/**
 * WebGPU Engine - Handles GPU initialization and detection
 */

export interface GPUEngineConfig {
  powerPreference?: 'low-power' | 'high-performance';
}

export class GPUEngine {
  private adapter: GPUAdapter | null = null;
  private gpuDevice: GPUDevice | null = null;
  private initialized = false;

  async init(config: GPUEngineConfig = {}): Promise<boolean> {
    // Check WebGPU support
    if (!navigator.gpu) {
      console.error('WebGPU is not supported in this browser');
      return false;
    }

    try {
      // Request adapter
      this.adapter = await navigator.gpu.requestAdapter({
        powerPreference: config.powerPreference || 'high-performance',
      });

      if (!this.adapter) {
        console.error('Failed to get GPU adapter');
        return false;
      }

      // Request device
      this.gpuDevice = await this.adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {
          maxStorageBufferBindingSize: this.adapter.limits.maxStorageBufferBindingSize,
          maxComputeWorkgroupSizeX: 256,
          maxComputeWorkgroupSizeY: 256,
          maxComputeWorkgroupSizeZ: 64,
        },
      });

      // Handle device loss
      this.gpuDevice.lost.then((info) => {
        console.error(`WebGPU device lost: ${info.message}`);
        this.initialized = false;
      });

      this.initialized = true;
      console.log('WebGPU initialized successfully');
      console.log('Adapter:', this.adapter);
      console.log('Device limits:', this.gpuDevice.limits);

      return true;
    } catch (error) {
      console.error('Failed to initialize WebGPU:', error);
      return false;
    }
  }

  get device(): GPUDevice {
    if (!this.gpuDevice) {
      throw new Error('GPU device not initialized. Call init() first.');
    }
    return this.gpuDevice;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get adapterInfo(): GPUAdapter | null {
    return this.adapter;
  }

  createBuffer(size: number, usage: GPUBufferUsageFlags, mappedAtCreation = false): GPUBuffer {
    return this.device.createBuffer({
      size,
      usage,
      mappedAtCreation,
    });
  }

  createUniformBuffer(data: ArrayBuffer): GPUBuffer {
    const buffer = this.createBuffer(
      data.byteLength,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      true
    );
    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data));
    buffer.unmap();
    return buffer;
  }

  createStorageBuffer(size: number, initialData?: Uint32Array): GPUBuffer {
    const buffer = this.createBuffer(
      size,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      !!initialData
    );

    if (initialData) {
      new Uint32Array(buffer.getMappedRange()).set(initialData);
      buffer.unmap();
    }

    return buffer;
  }

  async readBuffer(buffer: GPUBuffer, size: number): Promise<Uint32Array> {
    const readBuffer = this.createBuffer(
      size,
      GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    );

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size);
    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const data = new Uint32Array(readBuffer.getMappedRange()).slice();
    readBuffer.unmap();
    readBuffer.destroy();

    return data;
  }

  destroy(): void {
    if (this.gpuDevice) {
      this.gpuDevice.destroy();
      this.gpuDevice = null;
    }
    this.adapter = null;
    this.initialized = false;
  }
}
