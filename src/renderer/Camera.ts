/**
 * Camera controller with orbit controls
 */

import * as THREE from 'three';

export class Camera {
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private center: THREE.Vector3;
  private distance: number;
  private azimuth: number = 0.5; // Horizontal angle
  private elevation: number = 0.5; // Vertical angle

  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private minDistance: number;
  private maxDistance: number;

  constructor(canvas: HTMLCanvasElement, center: THREE.Vector3, initialDistance: number) {
    this.canvas = canvas;
    this.center = center;
    this.distance = initialDistance;
    this.minDistance = initialDistance * 0.2;
    this.maxDistance = initialDistance * 5;

    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      initialDistance * 10
    );

    this.updateCameraPosition();
    this.setupControls();
  }

  private setupControls(): void {
    // Mouse controls
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.canvas.addEventListener('touchend', () => this.onTouchEnd());

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.azimuth += deltaX * 0.005;
    this.elevation = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.elevation - deltaY * 0.005));

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.updateCameraPosition();
  }

  private onMouseUp(): void {
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();

    const zoomSpeed = 0.1;
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance * (1 + e.deltaY * zoomSpeed * 0.01))
    );

    this.updateCameraPosition();
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();

    if (e.touches.length === 1 && this.isDragging) {
      const deltaX = e.touches[0].clientX - this.lastMouseX;
      const deltaY = e.touches[0].clientY - this.lastMouseY;

      this.azimuth += deltaX * 0.005;
      this.elevation = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.elevation - deltaY * 0.005));

      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;

      this.updateCameraPosition();
    }
  }

  private onTouchEnd(): void {
    this.isDragging = false;
  }

  private updateCameraPosition(): void {
    const x = this.center.x + this.distance * Math.cos(this.elevation) * Math.cos(this.azimuth);
    const y = this.center.y + this.distance * Math.sin(this.elevation);
    const z = this.center.z + this.distance * Math.cos(this.elevation) * Math.sin(this.azimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.center);
  }

  update(): void {
    // Can be used for camera animations if needed
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  setCenter(center: THREE.Vector3): void {
    this.center = center;
    this.updateCameraPosition();
  }

  reset(center: THREE.Vector3, distance: number): void {
    this.center = center;
    this.distance = distance;
    this.azimuth = 0.5;
    this.elevation = 0.5;
    this.updateCameraPosition();
  }

  destroy(): void {
    // Remove event listeners if needed
    // Note: in a real application, you'd want to store bound function references
    // to properly remove them. For brevity, we skip that here.
  }
}
