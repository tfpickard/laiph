/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private fps = 0;
  private frameCount = 0;
  private lastTime = performance.now();
  private updateInterval = 500; // Update FPS every 500ms

  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;

    if (delta >= this.updateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  reset(): void {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
}

export class FrameTimer {
  private lastFrameTime = performance.now();
  private targetFrameTime: number;
  
  constructor(targetFPS = 60) {
    this.targetFrameTime = 1000 / targetFPS;
  }

  shouldUpdate(): boolean {
    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta >= this.targetFrameTime) {
      this.lastFrameTime = now;
      return true;
    }

    return false;
  }

  setTargetFPS(fps: number): void {
    this.targetFrameTime = 1000 / fps;
  }

  reset(): void {
    this.lastFrameTime = performance.now();
  }
}
