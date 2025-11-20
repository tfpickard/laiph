# laiph - 3D/4D Game of Life

A high-performance browser-based cellular automaton simulator supporting both 3D and 4D Game of Life with real-time visualization and interaction.

![3D/4D Game of Life](https://img.shields.io/badge/WebGPU-Powered-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.181-green)

## Features

### Core Capabilities

- **3D Game of Life**: Configurable grid sizes (32³, 64³, 128³) with classic 3D cellular automaton rules
- **4D Game of Life**: True 4D hypergrid simulation (24⁴, 32⁴, 48⁴) with 3D slice visualization
- **WebGPU Acceleration**: Massively parallel computation using compute shaders for high performance
- **Real-time Visualization**: Smooth rendering at 60 FPS using Three.js instanced rendering
- **Interactive Controls**: Full camera controls (orbit, pan, zoom) and simulation management

### Visualization Modes

- **Solid Voxels**: Instanced cube rendering with per-cell coloring
- **Point Cloud**: Lightweight particle-based visualization for larger grids

### Customization

- **Rule Editor**: Customize survival and birth conditions (default 3D: 4-5/5)
- **Pattern Library**: Pre-defined patterns including gliders, blinkers, pulsars, and more
- **Random Seeding**: Adjustable density for random initial states
- **Speed Control**: Adjustable simulation speed from 1 to 60 steps per second

### 4D Features

- **W-Axis Slicing**: View 3D slices of the 4D hypergrid
- **Interactive Slider**: Smoothly navigate through the 4th dimension
- **4D Patterns**: Tesseracts, 4D gliders, and other hyperdimensional structures

## Browser Requirements

**Requires WebGPU support:**
- Chrome/Edge 120+ (recommended)
- Firefox 130+ (experimental, enable in about:config)
- Safari 18+

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/tfpickard/laiph.git
cd laiph

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview
```

The built application will be in the `dist` folder and can be deployed as a static site.

## Usage

### Controls

- **Play/Pause**: Start or stop the simulation
- **Step**: Advance the simulation by one generation
- **Reset**: Clear and reinitialize the grid with a new random state

### Camera Controls

- **Left Mouse**: Rotate camera around the grid
- **Right Mouse**: Pan camera
- **Mouse Wheel**: Zoom in/out

### Changing Dimensions

Use the **Dimension** dropdown to switch between 3D and 4D modes. In 4D mode, use the **W-Axis Slice** slider to view different 3D cross-sections of the 4D grid.

### Loading Patterns

1. Select a pattern from the **Pattern** dropdown
2. Adjust **Random Density** if using random seeding
3. Click **Load Pattern** to apply

### Customizing Rules

The Game of Life uses neighbor counts to determine cell survival and birth:

- **Survival**: Number of neighbors required for a living cell to survive
- **Birth**: Number of neighbors required for a dead cell to become alive

Default 3D rules: Survival 4-5, Birth 5 (notation: 4-5/5)

Modify the values and click **Apply Rules** to update the simulation.

## Architecture

### Technology Stack

- **TypeScript**: Type-safe application code
- **Vite**: Fast build tooling with HMR
- **WebGPU**: Compute shaders for cellular automaton calculation
- **Three.js**: 3D rendering and visualization
- **OrbitControls**: Interactive camera navigation

### Project Structure

```
src/
├── engine/
│   ├── GPUEngine.ts        # WebGPU initialization and management
│   ├── GameOfLife3D.ts     # 3D cellular automaton implementation
│   └── GameOfLife4D.ts     # 4D cellular automaton implementation
├── renderer/
│   └── VoxelRenderer.ts    # Three.js visualization
├── shaders/
│   ├── compute-3d.wgsl     # 3D Game of Life compute shader
│   ├── compute-4d.wgsl     # 4D Game of Life compute shader
│   └── render.wgsl         # Rendering shaders (reference)
├── patterns/
│   ├── patterns-3d.ts      # 3D pattern definitions
│   └── patterns-4d.ts      # 4D pattern definitions
├── utils/
│   └── performance.ts      # FPS monitoring and timing
└── main.ts                 # Application entry point
```

### Key Implementation Details

#### Compute Pipeline

- Double-buffering (ping-pong) pattern for state updates
- Each compute shader workgroup processes an 8×8×8 tile (3D) or 8×8×8 linearized tile (4D)
- Moore neighborhood: 26 neighbors in 3D, 80 neighbors in 4D
- Toroidal topology (wrap-around boundaries)

#### Rendering

- Instanced rendering for efficient voxel visualization
- Dynamic instance count based on living cells
- Color variation based on cell position for visual depth
- Adaptive culling via Three.js frustum culling

#### 4D Visualization

- Full 4D state stored in linear buffer
- Real-time extraction of 3D slices at specified W coordinate
- Smooth navigation through 4th dimension via slider

## Performance

- **3D Mode**: Maintains 60 FPS with 128³ grid on modern GPUs (RTX 3060 equivalent)
- **4D Mode**: 32⁴ (1M cells) runs smoothly at 60 FPS
- **Memory Usage**: Scales linearly with grid size (approximately 4 bytes per cell)

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

Built using modern web technologies including WebGPU for massively parallel computation and Three.js for real-time 3D rendering.

