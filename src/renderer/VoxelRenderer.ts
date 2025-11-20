/**
 * Voxel Renderer using Three.js instanced rendering
 * Efficiently renders large numbers of voxels
 */

import * as THREE from 'three';
import { Camera } from './Camera';

export type RenderMode = 'cubes' | 'spheres' | 'points';

export interface VoxelRendererConfig {
  gridSize: [number, number, number];
  renderMode?: RenderMode;
  voxelSize?: number;
  colorScheme?: 'default' | 'age' | 'heatmap';
}

export class VoxelRenderer {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: Camera;
  private gridSize: [number, number, number];
  private renderMode: RenderMode;
  private voxelSize: number;

  private instancedMesh: THREE.InstancedMesh | null = null;
  private pointCloud: THREE.Points | null = null;
  private dummy: THREE.Object3D;

  private maxInstances: number;

  constructor(canvas: HTMLCanvasElement, config: VoxelRendererConfig) {
    this.gridSize = config.gridSize;
    this.renderMode = config.renderMode || 'cubes';
    this.voxelSize = config.voxelSize || 1.2;
    this.maxInstances = this.gridSize[0] * this.gridSize[1] * this.gridSize[2];

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Initialize camera
    const centerX = (this.gridSize[0] - 1) * this.voxelSize / 2;
    const centerY = (this.gridSize[1] - 1) * this.voxelSize / 2;
    const centerZ = (this.gridSize[2] - 1) * this.voxelSize / 2;
    const center = new THREE.Vector3(centerX, centerY, centerZ);

    this.camera = new Camera(
      canvas,
      center,
      Math.max(...this.gridSize) * 2.5
    );

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x4488ff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    this.scene.add(directionalLight2);

    this.dummy = new THREE.Object3D();

    // Create initial geometry
    this.createGeometry();

    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
  }

  private createGeometry(): void {
    // Clear existing geometry
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      if (Array.isArray(this.pointCloud.material)) {
        this.pointCloud.material.forEach(m => m.dispose());
      } else {
        this.pointCloud.material.dispose();
      }
    }

    if (this.renderMode === 'points') {
      // Point cloud rendering
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(this.maxInstances * 3);
      const colors = new Float32Array(this.maxInstances * 3);

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: this.voxelSize * 0.8,
        vertexColors: true,
        sizeAttenuation: true,
      });

      this.pointCloud = new THREE.Points(geometry, material);
      this.scene.add(this.pointCloud);
    } else {
      // Instanced mesh rendering
      const geometry = this.renderMode === 'spheres'
        ? new THREE.SphereGeometry(this.voxelSize * 0.4, 8, 8)
        : new THREE.BoxGeometry(this.voxelSize * 0.9, this.voxelSize * 0.9, this.voxelSize * 0.9);

      const material = new THREE.MeshPhongMaterial({
        color: 0x00ffaa,
        emissive: 0x002211,
        specular: 0x333333,
        shininess: 30,
      });

      this.instancedMesh = new THREE.InstancedMesh(
        geometry,
        material,
        this.maxInstances
      );

      // Set default invisible positions
      for (let i = 0; i < this.maxInstances; i++) {
        this.dummy.position.set(0, -10000, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      }

      this.instancedMesh.instanceMatrix.needsUpdate = true;
      this.instancedMesh.count = 0;
      this.scene.add(this.instancedMesh);
    }
  }

  updateCells(cellData: Uint32Array): void {
    if (this.renderMode === 'points' && this.pointCloud) {
      // Update point cloud
      const positions = this.pointCloud.geometry.attributes.position.array as Float32Array;
      const colors = this.pointCloud.geometry.attributes.color.array as Float32Array;

      let visibleCount = 0;
      let idx = 0;

      for (let z = 0; z < this.gridSize[2]; z++) {
        for (let y = 0; y < this.gridSize[1]; y++) {
          for (let x = 0; x < this.gridSize[0]; x++) {
            const cellIndex = x + y * this.gridSize[0] + z * this.gridSize[0] * this.gridSize[1];

            if (cellData[cellIndex] === 1) {
              positions[visibleCount * 3] = x * this.voxelSize;
              positions[visibleCount * 3 + 1] = y * this.voxelSize;
              positions[visibleCount * 3 + 2] = z * this.voxelSize;

              // Color based on position
              const hue = (x / this.gridSize[0] + y / this.gridSize[1] + z / this.gridSize[2]) / 3;
              const color = new THREE.Color().setHSL(hue * 0.3 + 0.5, 0.8, 0.6);
              colors[visibleCount * 3] = color.r;
              colors[visibleCount * 3 + 1] = color.g;
              colors[visibleCount * 3 + 2] = color.b;

              visibleCount++;
            }
            idx++;
          }
        }
      }

      this.pointCloud.geometry.setDrawRange(0, visibleCount);
      this.pointCloud.geometry.attributes.position.needsUpdate = true;
      this.pointCloud.geometry.attributes.color.needsUpdate = true;
    } else if (this.instancedMesh) {
      // Update instanced mesh
      let visibleCount = 0;

      for (let z = 0; z < this.gridSize[2]; z++) {
        for (let y = 0; y < this.gridSize[1]; y++) {
          for (let x = 0; x < this.gridSize[0]; x++) {
            const cellIndex = x + y * this.gridSize[0] + z * this.gridSize[0] * this.gridSize[1];

            if (cellData[cellIndex] === 1) {
              this.dummy.position.set(
                x * this.voxelSize,
                y * this.voxelSize,
                z * this.voxelSize
              );
              this.dummy.scale.set(1, 1, 1);

              // Color variation based on position
              const hue = (x / this.gridSize[0] + y / this.gridSize[1] + z / this.gridSize[2]) / 3;
              const color = new THREE.Color().setHSL(hue * 0.3 + 0.5, 0.8, 0.6);
              this.instancedMesh.setColorAt(visibleCount, color);

              this.dummy.updateMatrix();
              this.instancedMesh.setMatrixAt(visibleCount, this.dummy.matrix);
              visibleCount++;
            }
          }
        }
      }

      // Hide remaining instances
      for (let i = visibleCount; i < this.maxInstances; i++) {
        this.dummy.position.set(0, -10000, 0);
        this.dummy.scale.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      }

      this.instancedMesh.count = visibleCount;
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.instancedMesh.instanceColor) {
        this.instancedMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  setRenderMode(mode: RenderMode): void {
    if (mode !== this.renderMode) {
      this.renderMode = mode;
      this.createGeometry();
    }
  }

  render(): void {
    this.camera.update();
    this.renderer.render(this.scene, this.camera.getCamera());
  }

  private onResize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.getCamera().aspect = width / height;
    this.camera.getCamera().updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  getCamera(): Camera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  destroy(): void {
    this.camera.destroy();

    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }

    if (this.pointCloud) {
      this.pointCloud.geometry.dispose();
      if (Array.isArray(this.pointCloud.material)) {
        this.pointCloud.material.forEach(m => m.dispose());
      } else {
        this.pointCloud.material.dispose();
      }
    }

    this.renderer.dispose();
  }
}
