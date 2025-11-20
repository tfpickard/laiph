/**
 * GPUEngine - WebGPU initialization and management
 */

export class GPUEngine {
  device: GPUDevice | null = null;
  context: GPUCanvasContext | null = null;
  canvas: HTMLCanvasElement;
  adapter: GPUAdapter | null = null;
  preferredFormat: GPUTextureFormat = 'bgra8unorm';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize(): Promise<boolean> {
    // Check WebGPU support
    if (!navigator.gpu) {
      console.error('WebGPU not supported in this browser');
      return false;
    }

    try {
      // Request adapter
      this.adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
      });

      if (!this.adapter) {
        console.error('Failed to get GPU adapter');
        return false;
      }

      // Request device
      this.device = await this.adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {
          maxStorageBufferBindingSize: this.adapter.limits.maxStorageBufferBindingSize,
          maxBufferSize: this.adapter.limits.maxBufferSize,
          maxComputeWorkgroupSizeX: 256,
          maxComputeWorkgroupSizeY: 256,
          maxComputeWorkgroupSizeZ: 64,
        },
      });

      // Configure canvas context
      this.context = this.canvas.getContext('webgpu');
      if (!this.context) {
        console.error('Failed to get WebGPU context');
        return false;
      }

      this.preferredFormat = navigator.gpu.getPreferredCanvasFormat();
      
      this.context.configure({
        device: this.device,
        format: this.preferredFormat,
        alphaMode: 'opaque',
      });

      console.log('WebGPU initialized successfully');
      console.log('Adapter:', this.adapter);
      console.log('Device limits:', this.device.limits);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize WebGPU:', error);
      return false;
    }
  }

  createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
    if (!this.device) {
      throw new Error('Device not initialized');
    }
    
    return this.device.createBuffer({
      size,
      usage,
      mappedAtCreation: false,
    });
  }

  createUniformBuffer(data: ArrayBuffer): GPUBuffer {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    const buffer = this.device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data));
    buffer.unmap();

    return buffer;
  }

  writeBuffer(buffer: GPUBuffer, data: ArrayBuffer, offset = 0): void {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    this.device.queue.writeBuffer(buffer, offset, data);
  }

  async readBuffer(buffer: GPUBuffer, size: number): Promise<ArrayBuffer> {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    const readBuffer = this.device.createBuffer({
      size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size);
    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = readBuffer.getMappedRange().slice(0);
    readBuffer.unmap();
    readBuffer.destroy();

    return arrayBuffer;
  }

  destroy(): void {
    if (this.device) {
      this.device.destroy();
      this.device = null;
    }
  }
}
