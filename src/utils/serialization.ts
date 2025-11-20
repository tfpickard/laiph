/**
 * State serialization utilities for save/load functionality
 */

export interface SerializedState {
  version: number;
  dimensions: 3 | 4;
  gridSize: number[];
  data: Uint32Array;
  rules: {
    surviveMin: number;
    surviveMax: number;
    birthMin: number;
    birthMax: number;
  };
  timestamp: number;
}

export class StateSerializer {
  private static VERSION = 1;

  static serialize(
    dimensions: 3 | 4,
    gridSize: number[],
    data: Uint32Array,
    rules: { surviveMin: number; surviveMax: number; birthMin: number; birthMax: number }
  ): string {
    const state: SerializedState = {
      version: this.VERSION,
      dimensions,
      gridSize,
      data,
      rules,
      timestamp: Date.now(),
    };

    // Convert to JSON, but handle Uint32Array separately
    const jsonObj = {
      version: state.version,
      dimensions: state.dimensions,
      gridSize: state.gridSize,
      data: Array.from(state.data), // Convert to regular array for JSON
      rules: state.rules,
      timestamp: state.timestamp,
    };

    return JSON.stringify(jsonObj);
  }

  static deserialize(serialized: string): SerializedState {
    const jsonObj = JSON.parse(serialized);

    if (jsonObj.version !== this.VERSION) {
      throw new Error(`Unsupported version: ${jsonObj.version}`);
    }

    return {
      version: jsonObj.version,
      dimensions: jsonObj.dimensions,
      gridSize: jsonObj.gridSize,
      data: new Uint32Array(jsonObj.data),
      rules: jsonObj.rules,
      timestamp: jsonObj.timestamp,
    };
  }

  static downloadState(state: SerializedState, filename?: string): void {
    const json = this.serialize(
      state.dimensions,
      state.gridSize,
      state.data,
      state.rules
    );

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `gameoflife_${state.dimensions}d_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async loadStateFromFile(file: File): Promise<SerializedState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const state = this.deserialize(content);
          resolve(state);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static compressState(data: Uint32Array): Uint32Array {
    // Simple run-length encoding for sparse grids
    const compressed: number[] = [];
    let count = 0;
    let current = data[0];

    for (let i = 0; i < data.length; i++) {
      if (data[i] === current && count < 65535) {
        count++;
      } else {
        compressed.push(current, count);
        current = data[i];
        count = 1;
      }
    }
    compressed.push(current, count);

    return new Uint32Array(compressed);
  }

  static decompressState(compressed: Uint32Array, targetSize: number): Uint32Array {
    const decompressed = new Uint32Array(targetSize);
    let index = 0;

    for (let i = 0; i < compressed.length; i += 2) {
      const value = compressed[i];
      const count = compressed[i + 1];

      for (let j = 0; j < count; j++) {
        if (index < targetSize) {
          decompressed[index++] = value;
        }
      }
    }

    return decompressed;
  }
}
