/**
 * State serialization utilities
 * Export and import cellular automaton states
 */

export interface SerializedState {
  version: number;
  dimension: '3d' | '4d';
  gridSize: number;
  generation: number;
  rules: {
    survivalMin: number;
    survivalMax: number;
    birthMin: number;
    birthMax: number;
  };
  cells: number[]; // Indices of living cells for compression
}

export function serializeState(
  dimension: '3d' | '4d',
  gridSize: number,
  generation: number,
  rules: {
    survivalMin: number;
    survivalMax: number;
    birthMin: number;
    birthMax: number;
  },
  cells: Uint32Array
): string {
  // Extract indices of living cells for compression
  const livingCells: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) {
      livingCells.push(i);
    }
  }

  const state: SerializedState = {
    version: 1,
    dimension,
    gridSize,
    generation,
    rules,
    cells: livingCells,
  };

  return JSON.stringify(state);
}

export function deserializeState(json: string): {
  dimension: '3d' | '4d';
  gridSize: number;
  generation: number;
  rules: {
    survivalMin: number;
    survivalMax: number;
    birthMin: number;
    birthMax: number;
  };
  cells: Uint32Array;
} {
  const state: SerializedState = JSON.parse(json);

  if (state.version !== 1) {
    throw new Error(`Unsupported state version: ${state.version}`);
  }

  // Reconstruct cell array
  const totalCells = state.gridSize ** (state.dimension === '3d' ? 3 : 4);
  const cells = new Uint32Array(totalCells);
  
  for (const index of state.cells) {
    cells[index] = 1;
  }

  return {
    dimension: state.dimension,
    gridSize: state.gridSize,
    generation: state.generation,
    rules: state.rules,
    cells,
  };
}

export function downloadState(
  filename: string,
  dimension: '3d' | '4d',
  gridSize: number,
  generation: number,
  rules: {
    survivalMin: number;
    survivalMax: number;
    birthMin: number;
    birthMax: number;
  },
  cells: Uint32Array
): void {
  const json = serializeState(dimension, gridSize, generation, rules, cells);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function uploadState(callback: (state: {
  dimension: '3d' | '4d';
  gridSize: number;
  generation: number;
  rules: {
    survivalMin: number;
    survivalMax: number;
    birthMin: number;
    birthMax: number;
  };
  cells: Uint32Array;
}) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const state = deserializeState(json);
        callback(state);
      } catch (error) {
        console.error('Failed to load state:', error);
        alert('Failed to load state file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}
