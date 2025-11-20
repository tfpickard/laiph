/**
 * Main Application Entry Point
 * 3D/4D Game of Life with WebGPU
 */

import { GPUEngine } from './engine/GPUEngine';
import { GameOfLife3D } from './engine/GameOfLife3D';
import { GameOfLife4D } from './engine/GameOfLife4D';
import { VoxelRenderer, RenderMode } from './renderer/VoxelRenderer';
import { Controls } from './ui/Controls';
import { PerformanceMonitor } from './utils/performance';
import { StateSerializer } from './utils/serialization';
import { PATTERNS_3D, createPatternGrid } from './patterns/patterns-3d';
import { PATTERNS_4D, createPatternGrid4D } from './patterns/patterns-4d';

class GameOfLifeApp {
  private gpuEngine: GPUEngine;
  private game3D: GameOfLife3D | null = null;
  private game4D: GameOfLife4D | null = null;
  private renderer: VoxelRenderer | null = null;
  private controls: Controls | null = null;
  private performanceMonitor: PerformanceMonitor;

  private currentDimension: '3D' | '4D' = '3D';
  private isPlaying = false;
  private stepsPerSecond = 5;
  private lastStepTime = 0;
  private generation = 0;

  private gridSize3D: [number, number, number] = [64, 64, 64];
  private gridSize4D: [number, number, number, number] = [32, 32, 32, 32];

  private animationFrameId: number | null = null;

  constructor() {
    this.gpuEngine = new GPUEngine();
    this.performanceMonitor = new PerformanceMonitor();
  }

  async init(): Promise<void> {
    // Check WebGPU support
    const supported = await this.gpuEngine.init();
    if (!supported) {
      this.showError('WebGPU is not supported in your browser. Please use Chrome 120+, Edge 120+, or Firefox 130+.');
      return;
    }

    // Initialize 3D game first
    await this.initGame3D();

    // Setup renderer
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    this.renderer = new VoxelRenderer(canvas, {
      gridSize: this.gridSize3D,
      renderMode: 'cubes',
    });

    // Setup controls
    this.controls = new Controls('controls', {
      onPlay: () => this.play(),
      onPause: () => this.pause(),
      onReset: () => this.reset(),
      onStep: () => this.step(),
      onSpeedChange: (speed) => this.setSpeed(speed),
      onDimensionChange: (dimension) => this.switchDimension(dimension),
      onPatternChange: (pattern) => this.loadPattern(pattern),
      onRenderModeChange: (mode) => this.setRenderMode(mode),
      onRulesChange: (sMin, sMax, bMin, bMax) => this.updateRules(sMin, sMax, bMin, bMax),
      onWSliceChange: (w) => this.setWSlice(w),
      onExport: () => this.exportState(),
      onImport: (file) => this.importState(file),
    });

    // Start render loop
    this.startRenderLoop();

    // Initial render
    await this.updateVisualization();

    console.log('Game of Life initialized successfully!');
  }

  private async initGame3D(): Promise<void> {
    this.game3D = new GameOfLife3D(this.gpuEngine, {
      gridSize: this.gridSize3D,
      surviveMin: 4,
      surviveMax: 5,
      birthMin: 5,
      birthMax: 5,
    });
    await this.game3D.init();
    this.generation = 0;
  }

  private async initGame4D(): Promise<void> {
    this.game4D = new GameOfLife4D(this.gpuEngine, {
      gridSize: this.gridSize4D,
      surviveMin: 7,
      surviveMax: 10,
      birthMin: 6,
      birthMax: 9,
    });
    await this.game4D.init();
    this.generation = 0;

    if (this.controls) {
      this.controls.setWSliderMax(this.gridSize4D[3]);
    }
  }

  private async switchDimension(dimension: '3D' | '4D'): Promise<void> {
    this.pause();
    this.currentDimension = dimension;
    this.generation = 0;

    if (dimension === '3D') {
      if (!this.game3D) {
        await this.initGame3D();
      }
      if (this.renderer) {
        this.renderer.destroy();
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.renderer = new VoxelRenderer(canvas, {
          gridSize: this.gridSize3D,
        });
      }
    } else {
      if (!this.game4D) {
        await this.initGame4D();
      }
      if (this.renderer) {
        this.renderer.destroy();
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.renderer = new VoxelRenderer(canvas, {
          gridSize: [this.gridSize4D[0], this.gridSize4D[1], this.gridSize4D[2]],
        });
      }
    }

    await this.updateVisualization();
  }

  private play(): void {
    this.isPlaying = true;
    this.lastStepTime = performance.now();
  }

  private pause(): void {
    this.isPlaying = false;
  }

  private reset(): void {
    this.pause();
    this.generation = 0;

    if (this.currentDimension === '3D' && this.game3D) {
      this.game3D.reset();
    } else if (this.currentDimension === '4D' && this.game4D) {
      this.game4D.reset();
    }

    this.updateVisualization();
  }

  private step(): void {
    if (this.currentDimension === '3D' && this.game3D) {
      this.game3D.step();
      this.generation++;
    } else if (this.currentDimension === '4D' && this.game4D) {
      this.game4D.step();
      this.generation++;
    }

    this.updateVisualization();
  }

  private setSpeed(stepsPerSecond: number): void {
    this.stepsPerSecond = stepsPerSecond;
  }

  private setRenderMode(mode: RenderMode): void {
    if (this.renderer) {
      this.renderer.setRenderMode(mode);
      this.updateVisualization();
    }
  }

  private updateRules(surviveMin: number, surviveMax: number, birthMin: number, birthMax: number): void {
    if (this.currentDimension === '3D' && this.game3D) {
      this.game3D.updateRules(surviveMin, surviveMax, birthMin, birthMax);
    } else if (this.currentDimension === '4D' && this.game4D) {
      this.game4D.updateRules(surviveMin, surviveMax, birthMin, birthMax);
    }
  }

  private setWSlice(w: number): void {
    if (this.game4D) {
      this.game4D.setWSlice(w);
      this.updateVisualization();
    }
  }

  private loadPattern(patternName: string): void {
    this.pause();
    this.generation = 0;

    if (patternName === 'random') {
      this.reset();
      return;
    }

    if (this.currentDimension === '3D' && this.game3D) {
      const pattern = PATTERNS_3D[patternName];
      if (pattern) {
        const grid = createPatternGrid(pattern, this.gridSize3D);
        this.game3D.reset(grid);

        // Apply pattern-specific rules if provided
        if (pattern.rules) {
          this.game3D.updateRules(
            pattern.rules.surviveMin,
            pattern.rules.surviveMax,
            pattern.rules.birthMin,
            pattern.rules.birthMax
          );
        }
      }
    } else if (this.currentDimension === '4D' && this.game4D) {
      const pattern = PATTERNS_4D[patternName];
      if (pattern) {
        const grid = createPatternGrid4D(pattern, this.gridSize4D);
        this.game4D.reset(grid);

        // Apply pattern-specific rules if provided
        if (pattern.rules) {
          this.game4D.updateRules(
            pattern.rules.surviveMin,
            pattern.rules.surviveMax,
            pattern.rules.birthMin,
            pattern.rules.birthMax
          );
        }
      }
    }

    this.updateVisualization();
  }

  private async updateVisualization(): Promise<void> {
    if (!this.renderer) return;

    let cellData: Uint32Array;

    if (this.currentDimension === '3D' && this.game3D) {
      cellData = await this.game3D.getState();
    } else if (this.currentDimension === '4D' && this.game4D) {
      cellData = await this.game4D.get3DSlice();
    } else {
      return;
    }

    this.renderer.updateCells(cellData);
  }

  private async exportState(): Promise<void> {
    let state: Uint32Array;
    let dimensions: 3 | 4;
    let gridSize: number[];
    let rules = { surviveMin: 4, surviveMax: 5, birthMin: 5, birthMax: 5 };

    if (this.currentDimension === '3D' && this.game3D) {
      state = await this.game3D.getState();
      dimensions = 3;
      gridSize = [...this.gridSize3D];
    } else if (this.currentDimension === '4D' && this.game4D) {
      state = await this.game4D.getState();
      dimensions = 4;
      gridSize = [...this.gridSize4D];
    } else {
      return;
    }

    StateSerializer.downloadState({
      version: 1,
      dimensions,
      gridSize,
      data: state,
      rules,
      timestamp: Date.now(),
    });
  }

  private async importState(file: File): Promise<void> {
    try {
      const state = await StateSerializer.loadStateFromFile(file);

      if (state.dimensions === 3) {
        this.currentDimension = '3D';
        this.gridSize3D = state.gridSize as [number, number, number];
        if (this.game3D) {
          this.game3D.destroy();
        }
        await this.initGame3D();
        this.game3D!.reset(state.data);
        this.game3D!.updateRules(
          state.rules.surviveMin,
          state.rules.surviveMax,
          state.rules.birthMin,
          state.rules.birthMax
        );
      } else if (state.dimensions === 4) {
        this.currentDimension = '4D';
        this.gridSize4D = state.gridSize as [number, number, number, number];
        if (this.game4D) {
          this.game4D.destroy();
        }
        await this.initGame4D();
        this.game4D!.reset(state.data);
        this.game4D!.updateRules(
          state.rules.surviveMin,
          state.rules.surviveMax,
          state.rules.birthMin,
          state.rules.birthMax
        );
      }

      await this.updateVisualization();
    } catch (error) {
      console.error('Failed to import state:', error);
      alert('Failed to import state file');
    }
  }

  private startRenderLoop(): void {
    const loop = async (timestamp: number) => {
      this.performanceMonitor.update();

      // Update simulation
      if (this.isPlaying) {
        const timeSinceLastStep = timestamp - this.lastStepTime;
        const stepInterval = 1000 / this.stepsPerSecond;

        if (timeSinceLastStep >= stepInterval) {
          this.step();
          this.lastStepTime = timestamp;
        }
      }

      // Render
      if (this.renderer) {
        this.renderer.render();
      }

      // Update stats
      if (this.controls) {
        let cellCount = 0;
        if (this.currentDimension === '3D' && this.game3D) {
          const state = await this.game3D.getState();
          cellCount = state.reduce((sum, cell) => sum + cell, 0);
        } else if (this.currentDimension === '4D' && this.game4D) {
          const state = await this.game4D.getState();
          cellCount = state.reduce((sum, cell) => sum + cell, 0);
        }

        this.controls.updateStats(
          this.performanceMonitor.getFPS(),
          cellCount,
          this.generation
        );
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private showError(message: string): void {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.game3D?.destroy();
    this.game4D?.destroy();
    this.renderer?.destroy();
    this.gpuEngine.destroy();
  }
}

// Initialize app
const app = new GameOfLifeApp();
app.init().catch(error => {
  console.error('Failed to initialize:', error);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.destroy();
});
