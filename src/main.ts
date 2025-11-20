/**
 * Main application entry point
 * 3D/4D Game of Life Browser Application
 */

import { GPUEngine } from './engine/GPUEngine';
import { GameOfLife3D } from './engine/GameOfLife3D';
import { GameOfLife4D } from './engine/GameOfLife4D';
import { VoxelRenderer, VisualizationMode } from './renderer/VoxelRenderer';
import { patterns3D, placePattern3D } from './patterns/patterns-3d';
import { patterns4D, placePattern4D } from './patterns/patterns-4d';
import { PerformanceMonitor, FrameTimer } from './utils/performance';
import { downloadState, uploadState } from './utils/serialization';

type Dimension = '3d' | '4d';

class Application {
  private gpuEngine: GPUEngine;
  private renderer: VoxelRenderer;
  private gameOfLife3D: GameOfLife3D | null = null;
  private gameOfLife4D: GameOfLife4D | null = null;
  private dimension: Dimension = '3d';
  private gridSize = 64;
  private isPlaying = false;
  private performanceMonitor: PerformanceMonitor;
  private simulationTimer: FrameTimer;
  private wSlice = 0;
  
  // UI Elements
  private canvas: HTMLCanvasElement;
  private playPauseBtn: HTMLButtonElement;
  private stepBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private dimensionSelect: HTMLSelectElement;
  private gridSizeSelect: HTMLSelectElement;
  private speedSlider: HTMLInputElement;
  private speedValue: HTMLElement;
  private wSliceControl: HTMLElement;
  private wSliceSlider: HTMLInputElement;
  private wSliceValue: HTMLElement;
  private vizModeSelect: HTMLSelectElement;
  private patternSelect: HTMLSelectElement;
  private loadPatternBtn: HTMLButtonElement;
  private densitySlider: HTMLInputElement;
  private densityValue: HTMLElement;
  private survivalInput: HTMLInputElement;
  private birthInput: HTMLInputElement;
  private applyRulesBtn: HTMLButtonElement;
  private fpsValue: HTMLElement;
  private cellCount: HTMLElement;
  private generationDisplay: HTMLElement;
  private gridInfo: HTMLElement;
  private exportBtn: HTMLButtonElement;
  private importBtn: HTMLButtonElement;

  constructor() {
    // Get canvas
    this.canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas not found');
    }

    // Set canvas size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    // Initialize engines
    this.gpuEngine = new GPUEngine(this.canvas);
    this.renderer = new VoxelRenderer(this.canvas);
    this.performanceMonitor = new PerformanceMonitor();
    this.simulationTimer = new FrameTimer(5);

    // Get UI elements
    this.playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
    this.stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    this.dimensionSelect = document.getElementById('dimension-select') as HTMLSelectElement;
    this.gridSizeSelect = document.getElementById('grid-size-select') as HTMLSelectElement;
    this.speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    this.speedValue = document.getElementById('speed-value') as HTMLElement;
    this.wSliceControl = document.getElementById('w-slice-control') as HTMLElement;
    this.wSliceSlider = document.getElementById('w-slice-slider') as HTMLInputElement;
    this.wSliceValue = document.getElementById('w-slice-value') as HTMLElement;
    this.vizModeSelect = document.getElementById('viz-mode-select') as HTMLSelectElement;
    this.patternSelect = document.getElementById('pattern-select') as HTMLSelectElement;
    this.loadPatternBtn = document.getElementById('load-pattern-btn') as HTMLButtonElement;
    this.densitySlider = document.getElementById('density-slider') as HTMLInputElement;
    this.densityValue = document.getElementById('density-value') as HTMLElement;
    this.survivalInput = document.getElementById('survival-input') as HTMLInputElement;
    this.birthInput = document.getElementById('birth-input') as HTMLInputElement;
    this.applyRulesBtn = document.getElementById('apply-rules-btn') as HTMLButtonElement;
    this.fpsValue = document.getElementById('fps-value') as HTMLElement;
    this.cellCount = document.getElementById('cell-count') as HTMLElement;
    this.generationDisplay = document.getElementById('generation') as HTMLElement;
    this.gridInfo = document.getElementById('grid-info') as HTMLElement;
    this.exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
    this.importBtn = document.getElementById('import-btn') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.stepBtn.addEventListener('click', () => this.step());
    this.resetBtn.addEventListener('click', () => this.reset());
    
    this.dimensionSelect.addEventListener('change', () => {
      this.dimension = this.dimensionSelect.value as Dimension;
      this.updateDimension();
    });
    
    this.gridSizeSelect.addEventListener('change', () => {
      this.gridSize = parseInt(this.gridSizeSelect.value);
      this.reset();
    });
    
    this.speedSlider.addEventListener('input', () => {
      const speed = parseInt(this.speedSlider.value);
      this.speedValue.textContent = speed.toString();
      this.simulationTimer.setTargetFPS(speed);
    });
    
    this.wSliceSlider.addEventListener('input', () => {
      this.wSlice = parseInt(this.wSliceSlider.value);
      this.wSliceValue.textContent = this.wSlice.toString();
      this.update4DVisualization();
    });
    
    this.vizModeSelect.addEventListener('change', () => {
      this.renderer.setVisualizationMode(this.vizModeSelect.value as VisualizationMode);
      this.updateVisualization();
    });
    
    this.loadPatternBtn.addEventListener('click', () => this.loadPattern());
    
    this.densitySlider.addEventListener('input', () => {
      this.densityValue.textContent = this.densitySlider.value;
    });
    
    this.applyRulesBtn.addEventListener('click', () => this.applyRules());
    
    this.exportBtn.addEventListener('click', () => this.exportState());
    this.importBtn.addEventListener('click', () => this.importState());
  }

  async initialize(): Promise<void> {
    // Show loading message
    console.log('Initializing WebGPU...');

    const success = await this.gpuEngine.initialize();
    if (!success) {
      this.showError('WebGPU not supported. Please use a compatible browser (Chrome 120+, Edge 120+, etc.)');
      return;
    }

    // Initialize 3D simulation
    this.initializeSimulation();
    
    // Start render loop
    this.animate();
    
    console.log('Application initialized successfully');
  }

  private initializeSimulation(): void {
    const rules = this.parseRules();
    
    if (this.dimension === '3d') {
      this.gameOfLife3D = new GameOfLife3D(this.gpuEngine, {
        gridSize: this.gridSize,
        ...rules,
      });
      this.gameOfLife3D.seedRandom(0.15);
      this.renderer.setGridSize(this.gridSize);
      this.gridInfo.textContent = `${this.gridSize}³`;
      this.wSliceControl.style.display = 'none';
    } else {
      const size4d = Math.floor(this.gridSize * 0.5); // Use smaller grid for 4D
      this.gameOfLife4D = new GameOfLife4D(this.gpuEngine, {
        gridSize: size4d,
        ...rules,
      });
      this.gameOfLife4D.seedRandom(0.15);
      this.renderer.setGridSize(size4d);
      this.gridInfo.textContent = `${size4d}⁴`;
      this.wSliceControl.style.display = 'block';
      this.wSliceSlider.max = (size4d - 1).toString();
      this.wSlice = Math.floor(size4d / 2);
      this.wSliceSlider.value = this.wSlice.toString();
      this.wSliceValue.textContent = this.wSlice.toString();
    }
    
    this.updateVisualization();
  }

  private updateDimension(): void {
    // Clean up old simulation
    if (this.gameOfLife3D) {
      this.gameOfLife3D.destroy();
      this.gameOfLife3D = null;
    }
    if (this.gameOfLife4D) {
      this.gameOfLife4D.destroy();
      this.gameOfLife4D = null;
    }
    
    this.isPlaying = false;
    this.playPauseBtn.textContent = '▶ Play';
    
    // Initialize new simulation
    this.initializeSimulation();
  }

  private parseRules(): { survivalMin: number; survivalMax: number; birthMin: number; birthMax: number } {
    const survival = this.survivalInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const birth = this.birthInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    return {
      survivalMin: Math.min(...survival),
      survivalMax: Math.max(...survival),
      birthMin: Math.min(...birth),
      birthMax: Math.max(...birth),
    };
  }

  private applyRules(): void {
    const rules = this.parseRules();
    
    if (this.gameOfLife3D) {
      this.gameOfLife3D.updateRules(rules);
    }
    if (this.gameOfLife4D) {
      this.gameOfLife4D.updateRules(rules);
    }
  }

  private togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    this.playPauseBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
  }

  private step(): void {
    if (this.gameOfLife3D) {
      this.gameOfLife3D.step();
    }
    if (this.gameOfLife4D) {
      this.gameOfLife4D.step();
    }
    this.updateVisualization();
  }

  private reset(): void {
    this.isPlaying = false;
    this.playPauseBtn.textContent = '▶ Play';
    this.updateDimension();
  }

  private loadPattern(): void {
    const patternName = this.patternSelect.value;
    
    if (patternName === 'random') {
      const density = parseFloat(this.densitySlider.value) / 100;
      if (this.gameOfLife3D) {
        this.gameOfLife3D.seedRandom(density);
      }
      if (this.gameOfLife4D) {
        this.gameOfLife4D.seedRandom(density);
      }
    } else {
      if (this.dimension === '3d' && this.gameOfLife3D) {
        const pattern = patterns3D[patternName];
        if (pattern) {
          const cells = placePattern3D(pattern, this.gridSize);
          this.gameOfLife3D.seed(cells);
        }
      } else if (this.dimension === '4d' && this.gameOfLife4D) {
        const pattern = patterns4D[patternName];
        if (pattern) {
          const size4d = Math.floor(this.gridSize * 0.5);
          const cells = placePattern4D(pattern, size4d);
          this.gameOfLife4D.seed(cells);
        }
      }
    }
    
    this.updateVisualization();
  }

  private async updateVisualization(): Promise<void> {
    if (this.dimension === '3d' && this.gameOfLife3D) {
      const cells = await this.gameOfLife3D.getCells();
      this.renderer.update(cells);
      this.updateStats(cells, this.gameOfLife3D.getGeneration());
    } else if (this.dimension === '4d' && this.gameOfLife4D) {
      await this.update4DVisualization();
    }
  }

  private async update4DVisualization(): Promise<void> {
    if (!this.gameOfLife4D) return;
    
    const slice = await this.gameOfLife4D.getSlice(this.wSlice);
    this.renderer.update(slice);
    
    const allCells = await this.gameOfLife4D.getCells();
    this.updateStats(allCells, this.gameOfLife4D.getGeneration());
  }

  private updateStats(cells: Uint32Array, generation: number): void {
    let livingCount = 0;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === 1) livingCount++;
    }
    
    this.cellCount.textContent = livingCount.toLocaleString();
    this.generationDisplay.textContent = generation.toString();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // Update performance monitor
    this.performanceMonitor.update();
    this.fpsValue.textContent = this.performanceMonitor.getFPS().toString();

    // Simulation step if playing
    if (this.isPlaying && this.simulationTimer.shouldUpdate()) {
      this.step();
    }

    // Render
    this.renderer.render();
  };

  private showError(message: string): void {
    const controls = document.getElementById('controls');
    if (controls) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      controls.insertBefore(errorDiv, controls.firstChild);
    }
  }

  private async exportState(): Promise<void> {
    try {
      const rules = this.parseRules();
      
      if (this.dimension === '3d' && this.gameOfLife3D) {
        const cells = await this.gameOfLife3D.getCells();
        const filename = `game-of-life-3d-${Date.now()}.json`;
        downloadState(
          filename,
          '3d',
          this.gridSize,
          this.gameOfLife3D.getGeneration(),
          rules,
          cells
        );
      } else if (this.dimension === '4d' && this.gameOfLife4D) {
        const cells = await this.gameOfLife4D.getCells();
        const size4d = Math.floor(this.gridSize * 0.5);
        const filename = `game-of-life-4d-${Date.now()}.json`;
        downloadState(
          filename,
          '4d',
          size4d,
          this.gameOfLife4D.getGeneration(),
          rules,
          cells
        );
      }
    } catch (error) {
      console.error('Failed to export state:', error);
      this.showError('Failed to export state');
    }
  }

  private importState(): void {
    uploadState((state) => {
      try {
        // Stop simulation
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶ Play';
        
        // Update UI to match loaded state
        this.dimensionSelect.value = state.dimension;
        this.dimension = state.dimension;
        
        if (state.dimension === '3d') {
          this.gridSizeSelect.value = state.gridSize.toString();
          this.gridSize = state.gridSize;
        } else {
          // For 4D, find closest grid size option
          this.gridSize = state.gridSize * 2;
          this.gridSizeSelect.value = this.gridSize.toString();
        }
        
        // Update rule inputs
        this.survivalInput.value = state.rules.survivalMin === state.rules.survivalMax
          ? state.rules.survivalMin.toString()
          : `${state.rules.survivalMin},${state.rules.survivalMax}`;
        this.birthInput.value = state.rules.birthMin === state.rules.birthMax
          ? state.rules.birthMin.toString()
          : `${state.rules.birthMin},${state.rules.birthMax}`;
        
        // Reinitialize with loaded state
        this.updateDimension();
        
        // Load the cells
        if (state.dimension === '3d' && this.gameOfLife3D) {
          this.gameOfLife3D.seed(state.cells);
        } else if (state.dimension === '4d' && this.gameOfLife4D) {
          this.gameOfLife4D.seed(state.cells);
        }
        
        this.updateVisualization();
        
        console.log('State imported successfully');
      } catch (error) {
        console.error('Failed to import state:', error);
        this.showError('Failed to import state');
      }
    });
  }
}

// Initialize application
const app = new Application();
app.initialize().catch(error => {
  console.error('Failed to initialize application:', error);
});
