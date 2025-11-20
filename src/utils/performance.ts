/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private historySize: number = 60;

  private fps: number = 60;
  private avgFps: number = 60;
  private minFps: number = 60;
  private maxFps: number = 60;

  update(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (delta > 0) {
      const currentFps = 1000 / delta;
      this.fps = currentFps;

      this.fpsHistory.push(currentFps);
      if (this.fpsHistory.length > this.historySize) {
        this.fpsHistory.shift();
      }

      // Calculate statistics
      if (this.fpsHistory.length > 0) {
        this.avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        this.minFps = Math.min(...this.fpsHistory);
        this.maxFps = Math.max(...this.fpsHistory);
      }
    }

    this.frameCount++;
  }

  getFPS(): number {
    return Math.round(this.fps);
  }

  getAverageFPS(): number {
    return Math.round(this.avgFps);
  }

  getMinFPS(): number {
    return Math.round(this.minFps);
  }

  getMaxFPS(): number {
    return Math.round(this.maxFps);
  }

  getFrameCount(): number {
    return this.frameCount;
  }

  reset(): void {
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  isPerformanceGood(): boolean {
    return this.avgFps > 50;
  }

  isPerformancePoor(): boolean {
    return this.avgFps < 30;
  }
}

export class MemoryMonitor {
  getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    // @ts-ignore - performance.memory is not in TypeScript types but exists in Chrome
    if (performance.memory) {
      // @ts-ignore
      const used = performance.memory.usedJSHeapSize;
      // @ts-ignore
      const total = performance.memory.jsHeapSizeLimit;
      return {
        used: Math.round(used / 1024 / 1024), // MB
        total: Math.round(total / 1024 / 1024), // MB
        percentage: Math.round((used / total) * 100),
      };
    }
    return null;
  }
}
