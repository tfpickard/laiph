# Contributing to laiph

Thank you for your interest in contributing to the 3D/4D Game of Life project!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/laiph.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Project Structure

- `src/engine/` - WebGPU compute engine and simulation logic
- `src/renderer/` - Three.js visualization code
- `src/shaders/` - WGSL compute and render shaders
- `src/patterns/` - Pattern definitions for 3D and 4D
- `src/utils/` - Utility functions (performance, serialization)
- `src/main.ts` - Application entry point and UI logic

## Code Style

- TypeScript with strict mode enabled
- Use ESLint/Prettier if configured
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and modular

## Adding New Features

### New Patterns

Add patterns to `src/patterns/patterns-3d.ts` or `patterns-4d.ts`:

```typescript
export const patterns3D: Record<string, Pattern3D> = {
  yourPattern: {
    name: 'Your Pattern',
    description: 'Description of the pattern',
    cells: [
      [x1, y1, z1],
      [x2, y2, z2],
      // ...
    ],
  },
};
```

### New Visualization Modes

1. Add mode to `VisualizationMode` type in `VoxelRenderer.ts`
2. Implement rendering logic in `VoxelRenderer.update()`
3. Add UI option in `index.html`

### New Cellular Automaton Rules

Modify the compute shaders in `src/shaders/` to implement custom rules:

```wgsl
// In compute-3d.wgsl or compute-4d.wgsl
// Modify the survival/birth logic in the main() function
```

## Testing

Currently, the project focuses on manual testing:

1. Build: `npm run build`
2. Test different grid sizes (32, 64, 128)
3. Test both 3D and 4D modes
4. Verify patterns load correctly
5. Check performance (should maintain 60 FPS on modern hardware)

## WebGPU Shader Development

When modifying WGSL shaders:

1. Use Chrome DevTools for WebGPU debugging
2. Test on different GPU vendors (NVIDIA, AMD, Intel)
3. Verify toroidal boundary wrapping works correctly
4. Check neighbor counting logic carefully

## Performance Guidelines

- Maintain 60 FPS target for 128³ grids
- Profile using browser DevTools
- Consider GPU memory constraints
- Test on both integrated and dedicated GPUs

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push to your fork
6. Open a Pull Request with description of changes

## Bug Reports

When reporting bugs, include:

- Browser version and OS
- GPU model
- Grid size and dimension (3D/4D)
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Feature Requests

Open an issue with:

- Clear description of the feature
- Use case / motivation
- Implementation ideas (optional)
- Potential impact on performance

## Questions?

Open an issue with the "question" label for:

- Clarification on implementation details
- WebGPU-specific questions
- Architecture decisions
- Performance optimization ideas

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing!
