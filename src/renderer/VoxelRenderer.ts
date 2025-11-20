/**
 * VoxelRenderer - Three.js based renderer for cellular automaton
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type VisualizationMode = 'voxels' | 'points';

export class VoxelRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private instancedMesh: THREE.InstancedMesh | null = null;
  private pointCloud: THREE.Points | null = null;
  private gridSize = 64;
  private mode: VisualizationMode = 'voxels';
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 1, 3);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.width / canvas.height,
      0.1,
      100
    );
    this.camera.position.set(1.5, 1.5, 1.5);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 5;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0x8888ff, 0.3);
    directionalLight2.position.set(-1, -1, -1);
    this.scene.add(directionalLight2);

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  setGridSize(size: number): void {
    this.gridSize = size;
    this.clearMeshes();
  }

  setVisualizationMode(mode: VisualizationMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.clearMeshes();
    }
  }

  private clearMeshes(): void {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.instancedMesh = null;
    }

    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      (this.pointCloud.material as THREE.Material).dispose();
      this.pointCloud = null;
    }
  }

  update(cells: Uint32Array): void {
    const livingCells: THREE.Vector3[] = [];

    // Extract living cell positions
    for (let z = 0; z < this.gridSize; z++) {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const index = x + y * this.gridSize + z * this.gridSize * this.gridSize;
          if (cells[index] === 1) {
            livingCells.push(new THREE.Vector3(x, y, z));
          }
        }
      }
    }

    if (this.mode === 'voxels') {
      this.updateVoxels(livingCells);
    } else {
      this.updatePoints(livingCells);
    }
  }

  private updateVoxels(positions: THREE.Vector3[]): void {
    const count = positions.length;

    if (!this.instancedMesh || this.instancedMesh.count !== count) {
      this.clearMeshes();

      if (count === 0) return;

      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        shininess: 30,
        flatShading: false,
      });

      this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);
      this.scene.add(this.instancedMesh);
    }

    if (count === 0) return;

    const matrix = new THREE.Matrix4();
    const offset = this.gridSize / 2;
    const scale = 1 / this.gridSize;

    positions.forEach((pos, i) => {
      matrix.makeTranslation(
        (pos.x - offset) * scale,
        (pos.y - offset) * scale,
        (pos.z - offset) * scale
      );
      this.instancedMesh!.setMatrixAt(i, matrix);

      // Color variation based on position
      const color = new THREE.Color();
      color.setHSL(
        (pos.x / this.gridSize + pos.y / this.gridSize) * 0.3 + 0.55,
        0.7,
        0.5 + (pos.z / this.gridSize) * 0.3
      );
      this.instancedMesh!.setColorAt(i, color);
    });

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  private updatePoints(positions: THREE.Vector3[]): void {
    this.clearMeshes();

    if (positions.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(positions.length * 3);
    const colorArray = new Float32Array(positions.length * 3);
    const offset = this.gridSize / 2;
    const scale = 1 / this.gridSize;

    positions.forEach((pos, i) => {
      posArray[i * 3] = (pos.x - offset) * scale;
      posArray[i * 3 + 1] = (pos.y - offset) * scale;
      posArray[i * 3 + 2] = (pos.z - offset) * scale;

      const color = new THREE.Color();
      color.setHSL(
        (pos.x / this.gridSize + pos.y / this.gridSize) * 0.3 + 0.55,
        0.8,
        0.6
      );
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.pointCloud = new THREE.Points(geometry, material);
    this.scene.add(this.pointCloud);
  }

  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy(): void {
    this.clearMeshes();
    this.controls.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.handleResize());
  }
}
