# 3D/4D Game of Life - WebGPU

A high-performance browser-based cellular automaton simulator supporting both 3D and 4D Game of Life with real-time visualization and interaction.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

### Core Capabilities

- **Dual Dimension Support**: Switch seamlessly between 3D and 4D Game of Life
- **WebGPU Acceleration**: Massively parallel computation using GPU compute shaders
- **Real-time Visualization**: 60 FPS rendering with Three.js instanced rendering
- **Interactive Controls**: Full UI for simulation control, pattern loading, and rule customization
- **Multiple Render Modes**: Cubes, spheres, and point cloud visualization
- **Pattern Library**: Pre-built patterns for both 3D and 4D (gliders, oscillators, etc.)
- **4D Slicing**: Visualize 4D space through interactive 3D slices along the W-axis
- **State Management**: Export and import simulation states
- **Performance Monitoring**: Real-time FPS, cell count, and generation tracking
- **Configurable Rules**: Customize survival and birth conditions

### Technical Highlights

- **WebGPU Compute Shaders**: Cellular automata rules implemented entirely on GPU
- **Double-Buffering**: Ping-pong buffer pattern for efficient state updates
- **Instanced Rendering**: Efficient rendering of thousands of voxels
- **Toroidal Topology**: Wraparound boundaries for infinite-like space
- **TypeScript**: Full type safety and modern JavaScript features
- **Modular Architecture**: Clean separation of concerns (engine, renderer, UI)

## Browser Compatibility

- **Chrome/Edge**: 120+ ✅
- **Firefox**: 130+ ✅
- **Safari**: 18+ ✅

> **Note**: WebGPU must be enabled in your browser. It's enabled by default in recent versions.

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/laiph.git
cd laiph

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## Usage Guide

### Basic Controls

1. **Play/Pause**: Start or pause the simulation
2. **Step**: Advance simulation by one generation
3. **Reset**: Clear and randomize the grid
4. **Speed**: Adjust simulation speed (1-60 steps/second)

### Camera Navigation

- **Mouse Drag**: Rotate camera around the center
- **Mouse Wheel**: Zoom in/out
- **Touch Drag**: Rotate camera (mobile)

### Pattern Selection

Choose from various pre-built patterns:

**3D Patterns:**
- Glider: Moves through 3D space
- Blinker: Simple oscillator
- Pulsar: Complex oscillator
- Block: Stable configuration
- Cross, Cube, Diagonal

**4D Patterns:**
- Tesseract: 4D hypercube
- 4D Cross, Glider, Blinker
- 4D Block, Plane, Diagonal

### Dimension Switching

- Select "3D" or "4D" from the dropdown
- In 4D mode, use the W-Slice slider to explore different 3D cross-sections
- Default grid sizes: 64³ for 3D, 32⁴ for 4D

### Rule Customization

Adjust the Game of Life rules:

- **Survive**: Min/Max neighbor count for cells to survive
- **Birth**: Min/Max neighbor count for dead cells to become alive

**Default 3D Rules**: Survive 4-5, Birth 5
**Default 4D Rules**: Survive 7-10, Birth 6-9

### Render Modes

- **Cubes**: Solid voxel cubes
- **Spheres**: Spherical voxels
- **Points**: Point cloud (best performance)

### Export/Import

- **Export**: Save current state as JSON file
- **Import**: Load previously saved state

## Architecture

### Project Structure

```
laiph/
├── src/
│   ├── shaders/          # WebGPU compute shaders
│   │   ├── compute-3d.wgsl
│   │   └── compute-4d.wgsl
│   ├── engine/           # Core Game of Life logic
│   │   ├── GPUEngine.ts
│   │   ├── GameOfLife3D.ts
│   │   └── GameOfLife4D.ts
│   ├── renderer/         # Three.js rendering
│   │   ├── VoxelRenderer.ts
│   │   └── Camera.ts
│   ├── ui/               # User interface
│   │   └── Controls.ts
│   ├── patterns/         # Pattern library
│   │   ├── patterns-3d.ts
│   │   └── patterns-4d.ts
│   ├── utils/            # Utilities
│   │   ├── performance.ts
│   │   └── serialization.ts
│   └── main.ts           # Application entry point
├── index.html
├── package.json
└── vite.config.ts
```

### Key Components

#### WebGPU Compute Pipeline

The cellular automata computation is performed entirely on the GPU:

1. **Compute Shader**: Processes each cell in parallel
2. **Moore Neighborhood**: Counts neighbors (26 in 3D, 80 in 4D)
3. **Rule Application**: Applies survival/birth conditions
4. **Double Buffering**: Reads from one buffer, writes to another, then swaps

#### Rendering Pipeline

1. **Instanced Rendering**: Single draw call for all visible cells
2. **Color Variation**: Hue based on spatial position
3. **Camera System**: Orbital camera with smooth controls
4. **Multiple Modes**: Cubes, spheres, or point cloud

#### 4D Visualization

4D space is visualized through 3D slicing:
- The full 4D grid is stored in memory
- A 3D slice is extracted at the current W coordinate
- The slice is rendered using the same 3D rendering pipeline
- Animate through W to see 4D evolution

## Performance

### Target Performance

- **60 FPS** with 128³ grid on modern GPU (RTX 3060 or equivalent)
- Actual performance depends on:
  - Grid size
  - Number of living cells
  - Render mode
  - GPU capabilities

### Optimization Tips

1. **Use Point Cloud Mode**: Fastest rendering
2. **Reduce Grid Size**: Smaller grids run faster
3. **Lower Simulation Speed**: Reduces compute load
4. **Modern GPU**: WebGPU performs best on recent hardware

### Bundle Size

- **Uncompressed**: ~503 KB
- **Gzipped**: ~127 KB
- **Three.js**: Majority of bundle size
- **Core Logic**: <50 KB

## Development

### Type Checking

```bash
npm run type-check
```

### Building

```bash
npm run build
```

### Tech Stack

- **WebGPU**: GPU compute and acceleration
- **Three.js**: 3D rendering engine
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server

## Advanced Topics

### Custom Rules

The Game of Life rules can be customized through the UI or programmatically:

```typescript
game3D.updateRules(
  surviveMin: 4,
  surviveMax: 5,
  birthMin: 5,
  birthMax: 5
);
```

### Custom Patterns

Add custom patterns to `src/patterns/patterns-3d.ts`:

```typescript
myPattern: {
  name: 'My Pattern',
  description: 'A custom pattern',
  size: [5, 5, 5],
  cells: [[0, 0, 0], [1, 1, 1], /* ... */],
}
```

### WebGPU Shader Modification

Modify the compute shaders in `src/shaders/` to experiment with:
- Different neighbor counting rules
- Custom boundary conditions
- Alternative cellular automata rules

## Troubleshooting

### WebGPU Not Available

**Error**: "WebGPU is not supported in this browser"

**Solutions**:
- Update to the latest browser version
- Try Chrome/Edge 120+ or Firefox 130+
- Check if WebGPU is enabled in browser flags

### Poor Performance

**Solutions**:
- Switch to point cloud render mode
- Reduce grid size
- Lower simulation speed
- Update graphics drivers
- Use a device with a dedicated GPU

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

## Contributing

Contributions are welcome! Areas for improvement:

- [ ] WebAssembly fallback for non-WebGPU browsers
- [ ] VR/AR support via WebXR
- [ ] More pattern libraries
- [ ] Pattern detection algorithms
- [ ] Multiplayer synchronization
- [ ] Music generation from cell activity

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by Conway's Game of Life
- Built with WebGPU and Three.js
- Uses modern web technologies (ES2022, TypeScript)

## Resources

- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Game of Life Wiki](https://conwaylife.com/)
- [4D Cellular Automata](https://arxiv.org/abs/1001.1179)

---

**Built with ❤️ using WebGPU and TypeScript**
