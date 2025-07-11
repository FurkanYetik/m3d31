import * as THREE from 'three';

export interface Annotation {
  id: string;
  position: THREE.Vector3;
  title: string;
  description: string;
  color?: string;
}

export interface AnnotationManager {
  annotations: Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id'>) => Annotation;
  removeAnnotation: (id: string) => void;
  updateAnnotation: (id: string, data: Partial<Omit<Annotation, 'id'>>) => Annotation | null;
  getAnnotation: (id: string) => Annotation | undefined;
  clearAnnotations: () => void;
}

/**
 * Creates an annotation manager for handling model annotations
 */
export function createAnnotationManager(): AnnotationManager {
  let annotations: Annotation[] = [];

  /**
   * Adds a new annotation
   */
  const addAnnotation = (annotation: Omit<Annotation, 'id'>): Annotation => {
    const id = `annotation-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAnnotation = { ...annotation, id };
    annotations.push(newAnnotation);
    return newAnnotation;
  };

  /**
   * Removes an annotation by ID
   */
  const removeAnnotation = (id: string): void => {
    annotations = annotations.filter(a => a.id !== id);
  };

  /**
   * Updates an existing annotation
   */
  const updateAnnotation = (id: string, data: Partial<Omit<Annotation, 'id'>>): Annotation | null => {
    const index = annotations.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    const updatedAnnotation = { ...annotations[index], ...data };
    annotations[index] = updatedAnnotation;
    return updatedAnnotation;
  };

  /**
   * Gets an annotation by ID
   */
  const getAnnotation = (id: string): Annotation | undefined => {
    return annotations.find(a => a.id === id);
  };

  /**
   * Clears all annotations
   */
  const clearAnnotations = (): void => {
    annotations = [];
  };

  return {
    get annotations() { return [...annotations]; },
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    getAnnotation,
    clearAnnotations
  };
}

/**
 * Converts screen coordinates to 3D world position for placing annotations
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  depth: number = 0
): THREE.Vector3 {
  const vector = new THREE.Vector3();
  const canvas = renderer.domElement;
  
  // Convert screen coordinates to normalized device coordinates (-1 to +1)
  vector.set(
    (screenX / canvas.clientWidth) * 2 - 1,
    -(screenY / canvas.clientHeight) * 2 + 1,
    depth
  );
  
  // Convert to world coordinates
  vector.unproject(camera);
  
  // Get the ray from the camera to this position
  const dir = vector.sub(camera.position).normalize();
  
  // Calculate distance along the ray for the desired depth
  const distance = (depth - camera.position.z) / dir.z;
  
  // Get the 3D position
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  
  return pos;
}

/**
 * Projects a 3D world position to 2D screen coordinates
 */
export function worldToScreen(
  position: THREE.Vector3,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
): { x: number, y: number } {
  const vector = position.clone().project(camera);
  const canvas = renderer.domElement;
  
  return {
    x: Math.round((vector.x + 1) * canvas.clientWidth / 2),
    y: Math.round((-vector.y + 1) * canvas.clientHeight / 2)
  };
}

/**
 * Calculates if an annotation is visible from the current camera position
 */
export function isAnnotationVisible(
  position: THREE.Vector3,
  camera: THREE.Camera,
  scene: THREE.Scene
): boolean {
  // Direction from camera to annotation
  const direction = position.clone().sub(camera.position).normalize();
  
  // Create a ray from the camera to the annotation
  const raycaster = new THREE.Raycaster(camera.position, direction);
  
  // Find all intersections
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // If there are no intersections, the annotation is visible
  if (intersects.length === 0) return true;
  
  // Calculate distance from camera to annotation
  const distanceToAnnotation = camera.position.distanceTo(position);
  
  // Check if the first intersection is beyond the annotation
  return intersects[0].distance > distanceToAnnotation * 0.95;
} 