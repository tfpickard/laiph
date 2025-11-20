/**
 * UI Controls for the Game of Life application
 */

import { RenderMode } from '../renderer/VoxelRenderer';

export interface ControlsConfig {
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (speed: number) => void;
  onDimensionChange: (dimension: '3D' | '4D') => void;
  onPatternChange: (pattern: string) => void;
  onRenderModeChange: (mode: RenderMode) => void;
  onRulesChange: (surviveMin: number, surviveMax: number, birthMin: number, birthMax: number) => void;
  onWSliceChange?: (w: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export class Controls {
  private container: HTMLElement;
  private config: ControlsConfig;
  private isPlaying = false;

  // UI Elements
  private playButton!: HTMLButtonElement;
  private pauseButton!: HTMLButtonElement;
  private resetButton!: HTMLButtonElement;
  private stepButton!: HTMLButtonElement;
  private speedSlider!: HTMLInputElement;
  private speedValue!: HTMLSpanElement;
  private dimensionSelect!: HTMLSelectElement;
  private patternSelect!: HTMLSelectElement;
  private renderModeSelect!: HTMLSelectElement;
  private fpsDisplay!: HTMLSpanElement;
  private cellCountDisplay!: HTMLSpanElement;
  private generationDisplay!: HTMLSpanElement;
  private wSlider?: HTMLInputElement;
  private wValue?: HTMLSpanElement;
  private wControls?: HTMLDivElement;

  // Rule editors
  private surviveMinInput!: HTMLInputElement;
  private surviveMaxInput!: HTMLInputElement;
  private birthMinInput!: HTMLInputElement;
  private birthMaxInput!: HTMLInputElement;

  constructor(containerId: string, config: ControlsConfig) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container ${containerId} not found`);
    }
    this.container = element;
    this.config = config;
    this.createUI();
  }

  private createUI(): void {
    this.container.innerHTML = `
      <div class="controls-panel">
        <div class="control-section">
          <h3>Simulation</h3>
          <div class="button-group">
            <button id="playBtn" class="btn btn-primary">▶ Play</button>
            <button id="pauseBtn" class="btn btn-secondary" style="display:none;">⏸ Pause</button>
            <button id="stepBtn" class="btn">⏭ Step</button>
            <button id="resetBtn" class="btn btn-danger">🔄 Reset</button>
          </div>
          <div class="slider-group">
            <label for="speedSlider">Speed: <span id="speedValue">5</span> steps/s</label>
            <input type="range" id="speedSlider" min="1" max="60" value="5" step="1">
          </div>
        </div>

        <div class="control-section">
          <h3>Configuration</h3>
          <div class="select-group">
            <label for="dimensionSelect">Dimension:</label>
            <select id="dimensionSelect">
              <option value="3D" selected>3D</option>
              <option value="4D">4D</option>
            </select>
          </div>
          <div class="select-group">
            <label for="patternSelect">Pattern:</label>
            <select id="patternSelect">
              <option value="random">Random</option>
              <optgroup label="Still Lifes">
                <option value="block">Block</option>
                <option value="biBlock">Bi-Block</option>
                <option value="twinBees">Twin Bees</option>
              </optgroup>
              <optgroup label="Oscillators">
                <option value="blinker3d">Blinker</option>
                <option value="toad">Toad</option>
                <option value="beacon">Beacon</option>
                <option value="pulsar">Pulsar</option>
                <option value="pentadecathlon">Pentadecathlon</option>
              </optgroup>
              <optgroup label="Spaceships">
                <option value="glider">3D Glider</option>
                <option value="lwss">Lightweight Spaceship</option>
                <option value="pufferTrain">Puffer Train</option>
                <option value="sidecar">Sidecar</option>
              </optgroup>
              <optgroup label="Methuselahs">
                <option value="rPentomino">R-Pentomino</option>
                <option value="acorn">Acorn</option>
                <option value="diehard">Diehard</option>
              </optgroup>
              <optgroup label="Geometric Shapes">
                <option value="cube">Cube</option>
                <option value="octahedron">Octahedron</option>
                <option value="pyramid">Pyramid</option>
                <option value="sphere">Sphere</option>
                <option value="cross">3D Cross</option>
                <option value="plus">Plus Sign</option>
                <option value="ring">Ring</option>
              </optgroup>
              <optgroup label="Helices & Spirals">
                <option value="helix">Helix</option>
                <option value="doubleHelix">Double Helix</option>
                <option value="diagonal">Diagonal Line</option>
              </optgroup>
              <optgroup label="Other Patterns">
                <option value="galaxy">Galaxy</option>
                <option value="tTetromino">T-Tetromino</option>
                <option value="spacefiller">Spacefiller</option>
                <option value="exploder">Exploder</option>
              </optgroup>
            </select>
          </div>
          <div class="select-group">
            <label for="renderModeSelect">Render Mode:</label>
            <select id="renderModeSelect">
              <option value="cubes" selected>Cubes</option>
              <option value="spheres">Spheres</option>
              <option value="points">Points</option>
            </select>
          </div>
          <div id="wControls" style="display:none;" class="slider-group">
            <label for="wSlider">W Slice: <span id="wValue">0</span></label>
            <input type="range" id="wSlider" min="0" max="31" value="0" step="1">
          </div>
        </div>

        <div class="control-section">
          <h3>Rules</h3>
          <div class="rule-inputs">
            <div class="input-group">
              <label for="surviveMin">Survive:</label>
              <input type="number" id="surviveMin" min="0" max="26" value="5" class="rule-input">
              <span>to</span>
              <input type="number" id="surviveMax" min="0" max="26" value="7" class="rule-input">
            </div>
            <div class="input-group">
              <label for="birthMin">Birth:</label>
              <input type="number" id="birthMin" min="0" max="26" value="6" class="rule-input">
              <span>to</span>
              <input type="number" id="birthMax" min="0" max="26" value="6" class="rule-input">
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3>Statistics</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">FPS:</span>
              <span id="fpsDisplay" class="stat-value">60</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cells:</span>
              <span id="cellCountDisplay" class="stat-value">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Generation:</span>
              <span id="generationDisplay" class="stat-value">0</span>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3>Data</h3>
          <div class="button-group">
            <button id="exportBtn" class="btn">💾 Export</button>
            <button id="importBtn" class="btn">📂 Import</button>
          </div>
          <input type="file" id="importFile" accept=".json" style="display:none;">
        </div>

        <div class="control-section info">
          <h3>Controls</h3>
          <ul>
            <li><strong>Mouse:</strong> Drag to rotate camera</li>
            <li><strong>Wheel:</strong> Zoom in/out</li>
            <li><strong>Touch:</strong> Drag to rotate</li>
          </ul>
        </div>
      </div>
    `;

    // Get references to elements
    this.playButton = this.getElement('playBtn') as HTMLButtonElement;
    this.pauseButton = this.getElement('pauseBtn') as HTMLButtonElement;
    this.resetButton = this.getElement('resetBtn') as HTMLButtonElement;
    this.stepButton = this.getElement('stepBtn') as HTMLButtonElement;
    this.speedSlider = this.getElement('speedSlider') as HTMLInputElement;
    this.speedValue = this.getElement('speedValue') as HTMLSpanElement;
    this.dimensionSelect = this.getElement('dimensionSelect') as HTMLSelectElement;
    this.patternSelect = this.getElement('patternSelect') as HTMLSelectElement;
    this.renderModeSelect = this.getElement('renderModeSelect') as HTMLSelectElement;
    this.fpsDisplay = this.getElement('fpsDisplay') as HTMLSpanElement;
    this.cellCountDisplay = this.getElement('cellCountDisplay') as HTMLSpanElement;
    this.generationDisplay = this.getElement('generationDisplay') as HTMLSpanElement;
    this.wControls = this.getElement('wControls') as HTMLDivElement;
    this.wSlider = this.getElement('wSlider') as HTMLInputElement;
    this.wValue = this.getElement('wValue') as HTMLSpanElement;

    this.surviveMinInput = this.getElement('surviveMin') as HTMLInputElement;
    this.surviveMaxInput = this.getElement('surviveMax') as HTMLInputElement;
    this.birthMinInput = this.getElement('birthMin') as HTMLInputElement;
    this.birthMaxInput = this.getElement('birthMax') as HTMLInputElement;

    this.attachEventListeners();
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element ${id} not found`);
    }
    return element;
  }

  private attachEventListeners(): void {
    // Playback controls
    this.playButton.addEventListener('click', () => {
      this.isPlaying = true;
      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
      this.config.onPlay();
    });

    this.pauseButton.addEventListener('click', () => {
      this.isPlaying = false;
      this.pauseButton.style.display = 'none';
      this.playButton.style.display = 'inline-block';
      this.config.onPause();
    });

    this.resetButton.addEventListener('click', () => {
      this.config.onReset();
    });

    this.stepButton.addEventListener('click', () => {
      this.config.onStep();
    });

    // Speed control
    this.speedSlider.addEventListener('input', () => {
      const speed = parseInt(this.speedSlider.value);
      this.speedValue.textContent = speed.toString();
      this.config.onSpeedChange(speed);
    });

    // Dimension selector
    this.dimensionSelect.addEventListener('change', () => {
      const dimension = this.dimensionSelect.value as '3D' | '4D';
      this.config.onDimensionChange(dimension);

      // Update pattern list
      this.updatePatternList(dimension);

      // Show/hide W controls
      if (this.wControls) {
        this.wControls.style.display = dimension === '4D' ? 'block' : 'none';
      }

      // Update rule limits
      if (dimension === '4D') {
        this.surviveMinInput.max = '80';
        this.surviveMaxInput.max = '80';
        this.birthMinInput.max = '80';
        this.birthMaxInput.max = '80';
        // Default 4D rules
        this.surviveMinInput.value = '7';
        this.surviveMaxInput.value = '10';
        this.birthMinInput.value = '6';
        this.birthMaxInput.value = '9';
      } else {
        this.surviveMinInput.max = '26';
        this.surviveMaxInput.max = '26';
        this.birthMinInput.max = '26';
        this.birthMaxInput.max = '26';
        // Default 3D rules
        this.surviveMinInput.value = '5';
        this.surviveMaxInput.value = '7';
        this.birthMinInput.value = '6';
        this.birthMaxInput.value = '6';
      }

      this.onRulesChanged();
    });

    // Pattern selector
    this.patternSelect.addEventListener('change', () => {
      this.config.onPatternChange(this.patternSelect.value);
    });

    // Render mode selector
    this.renderModeSelect.addEventListener('change', () => {
      this.config.onRenderModeChange(this.renderModeSelect.value as RenderMode);
    });

    // W slider for 4D
    if (this.wSlider && this.config.onWSliceChange) {
      this.wSlider.addEventListener('input', () => {
        const w = parseInt(this.wSlider!.value);
        if (this.wValue) {
          this.wValue.textContent = w.toString();
        }
        if (this.config.onWSliceChange) {
          this.config.onWSliceChange(w);
        }
      });
    }

    // Rule inputs
    this.surviveMinInput.addEventListener('change', () => this.onRulesChanged());
    this.surviveMaxInput.addEventListener('change', () => this.onRulesChanged());
    this.birthMinInput.addEventListener('change', () => this.onRulesChanged());
    this.birthMaxInput.addEventListener('change', () => this.onRulesChanged());

    // Export/Import
    const exportBtn = this.getElement('exportBtn');
    const importBtn = this.getElement('importBtn');
    const importFile = this.getElement('importFile') as HTMLInputElement;

    exportBtn.addEventListener('click', () => {
      this.config.onExport();
    });

    importBtn.addEventListener('click', () => {
      importFile.click();
    });

    importFile.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.config.onImport(file);
      }
    });
  }

  private updatePatternList(dimension: '3D' | '4D'): void {
    if (dimension === '4D') {
      this.patternSelect.innerHTML = `
        <option value="random">Random</option>
        <optgroup label="Basic Shapes">
          <option value="tesseract">Tesseract (Hypercube)</option>
          <option value="hypersphere">Hypersphere</option>
          <option value="hexadecachoron">16-Cell</option>
          <option value="block4d">4D Block</option>
          <option value="frame4d">4D Frame</option>
        </optgroup>
        <optgroup label="Crosses & Stars">
          <option value="cross4d">4D Cross</option>
          <option value="doubleCross4d">Double Cross</option>
          <option value="star4d">4D Star</option>
        </optgroup>
        <optgroup label="Structures">
          <option value="plane4d">4D Plane</option>
          <option value="pyramid4d">4D Pyramid</option>
          <option value="lattice4d">4D Lattice</option>
          <option value="tube4d">4D Tube</option>
        </optgroup>
        <optgroup label="Curved Forms">
          <option value="ring4d">4D Ring</option>
          <option value="torus4d">4D Torus</option>
          <option value="helix4d">4D Helix</option>
          <option value="spiral4d">4D Spiral</option>
          <option value="knot4d">4D Knot</option>
        </optgroup>
        <optgroup label="Dynamic">
          <option value="glider4d">4D Glider</option>
          <option value="blinker4d">4D Blinker</option>
          <option value="spinner4d">4D Spinner</option>
          <option value="diagonal4d">4D Diagonal</option>
        </optgroup>
      `;
    } else {
      this.patternSelect.innerHTML = `
        <option value="random">Random</option>
        <optgroup label="Still Lifes">
          <option value="block">Block</option>
          <option value="biBlock">Bi-Block</option>
          <option value="twinBees">Twin Bees</option>
        </optgroup>
        <optgroup label="Oscillators">
          <option value="blinker3d">Blinker</option>
          <option value="toad">Toad</option>
          <option value="beacon">Beacon</option>
          <option value="pulsar">Pulsar</option>
          <option value="pentadecathlon">Pentadecathlon</option>
        </optgroup>
        <optgroup label="Spaceships">
          <option value="glider">3D Glider</option>
          <option value="lwss">Lightweight Spaceship</option>
          <option value="pufferTrain">Puffer Train</option>
          <option value="sidecar">Sidecar</option>
        </optgroup>
        <optgroup label="Methuselahs">
          <option value="rPentomino">R-Pentomino</option>
          <option value="acorn">Acorn</option>
          <option value="diehard">Diehard</option>
        </optgroup>
        <optgroup label="Geometric Shapes">
          <option value="cube">Cube</option>
          <option value="octahedron">Octahedron</option>
          <option value="pyramid">Pyramid</option>
          <option value="sphere">Sphere</option>
          <option value="cross">3D Cross</option>
          <option value="plus">Plus Sign</option>
          <option value="ring">Ring</option>
        </optgroup>
        <optgroup label="Helices & Spirals">
          <option value="helix">Helix</option>
          <option value="doubleHelix">Double Helix</option>
          <option value="diagonal">Diagonal Line</option>
        </optgroup>
        <optgroup label="Other Patterns">
          <option value="galaxy">Galaxy</option>
          <option value="tTetromino">T-Tetromino</option>
          <option value="spacefiller">Spacefiller</option>
          <option value="exploder">Exploder</option>
        </optgroup>
      `;
    }
  }

  private onRulesChanged(): void {
    const surviveMin = parseInt(this.surviveMinInput.value);
    const surviveMax = parseInt(this.surviveMaxInput.value);
    const birthMin = parseInt(this.birthMinInput.value);
    const birthMax = parseInt(this.birthMaxInput.value);

    this.config.onRulesChange(surviveMin, surviveMax, birthMin, birthMax);
  }

  updateStats(fps: number, cellCount: number, generation: number): void {
    this.fpsDisplay.textContent = fps.toString();
    this.cellCountDisplay.textContent = cellCount.toLocaleString();
    this.generationDisplay.textContent = generation.toString();
  }

  setWSliderMax(max: number): void {
    if (this.wSlider) {
      this.wSlider.max = (max - 1).toString();
    }
  }

  pause(): void {
    if (this.isPlaying) {
      this.pauseButton.click();
    }
  }
}
