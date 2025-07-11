import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Stage, 
  useGLTF, 
  Center,
  Grid,
  Environment,
  PerspectiveCamera,
  Text,
  useTexture,
  Loader
} from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { EnvironmentProps } from '@react-three/drei';

// Error message component that works within Three.js context
const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <group>
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        {message}
      </Text>
    </group>
  );
};

// Placeholder model for unsupported or loading formats
const PlaceholderModel = ({ message }: { message: string }) => {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        {message}
      </Text>
    </group>
  );
};

// Model component that handles different file formats
const Model = ({ url, renderMode }: { url: string, renderMode: string }) => {
  console.log('Model component received URL:', url);
  
  // Extract file extension
  let fileExtension = '';
  
  // First, check if we have the file type stored in sessionStorage
  if (url && sessionStorage.getItem(`fileType_${url}`)) {
    fileExtension = sessionStorage.getItem(`fileType_${url}`) || '';
    console.log('Found file extension in sessionStorage:', fileExtension);
  } else {
    // Handle blob URLs and regular URLs differently
    if (url.startsWith('blob:')) {
      // For blob URLs, we need to rely on the file name which might be in a query parameter
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      // Try to extract extension from any part of the URL that might contain it
      if (lastPart.includes('.')) {
        fileExtension = lastPart.split('.').pop()?.toLowerCase() || '';
      } else {
        // If no extension found, check if there's a query parameter with the file name
        const searchParams = new URL(url).search;
        if (searchParams && searchParams.includes('.')) {
          fileExtension = searchParams.split('.').pop()?.toLowerCase() || '';
        }
      }
    } else {
      // For regular URLs, just get the extension from the path
      const urlPath = url.split('?')[0]; // Remove query parameters
      fileExtension = urlPath.split('.').pop()?.toLowerCase() || '';
    }
  }
  
  console.log('Detected file extension:', fileExtension);
  
  // For GLTF/GLB models
  if (fileExtension === 'gltf' || fileExtension === 'glb') {
    console.log('Rendering as GLTF/GLB model');
    return <GLTFModel url={url} renderMode={renderMode} />;
  }
  
  // For OBJ models
  if (fileExtension === 'obj') {
    console.log('Rendering as OBJ model');
    return <OBJModel url={url} renderMode={renderMode} />;
  }
  
  // For STL models
  if (fileExtension === 'stl') {
    console.log('Rendering as STL placeholder');
    return <PlaceholderModel message="STL format support coming soon" />;
  }
  
  // For FBX models
  if (fileExtension === 'fbx') {
    console.log('Rendering as FBX placeholder');
    return <PlaceholderModel message="FBX format support coming soon" />;
  }
  
  console.log('Unsupported file format:', url);
  return <ErrorMessage message={`Unsupported file format: ${fileExtension || 'unknown'}`} />;
};

// GLTF/GLB Model component
const GLTFModel = ({ url, renderMode }: { url: string, renderMode: string }) => {
  const gltf = useGLTF(url);
  const { scene } = gltf;
  const { camera } = useThree();

  useEffect(() => {
    if (scene) {
      // Apply material based on render mode
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          
          if (renderMode === 'wireframe') {
            mesh.material = new THREE.MeshBasicMaterial({ 
              wireframe: true, 
              color: 0x00ff00 
            });
          } else if (renderMode === 'solid') {
            mesh.material = new THREE.MeshStandardMaterial({ 
              color: 0xcccccc,
              flatShading: true 
            });
          }
          // For textured mode, we keep the original materials
        }
      });
    }
  }, [scene, renderMode]);

  // Auto-fit camera to model
  useEffect(() => {
    if (scene && camera instanceof THREE.PerspectiveCamera) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
      
      // Set camera position
      camera.position.z = cameraZ * 1.5;
      camera.updateProjectionMatrix();
    }
  }, [scene, camera]);

  return <primitive object={scene} />;
};

// OBJ Model component
const OBJModel = ({ url, renderMode }: { url: string, renderMode: string }) => {
  const { camera } = useThree();
  const [obj, setObj] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load OBJ file
  useEffect(() => {
    console.log('Loading OBJ model from URL:', url);
    const loadOBJ = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Dynamically import the OBJLoader
        console.log('Importing OBJLoader...');
        const OBJLoaderModule = await import('three/examples/jsm/loaders/OBJLoader.js');
        console.log('OBJLoader imported successfully');
        const loader = new OBJLoaderModule.OBJLoader();
        
        // Optional: Load MTL if available
        try {
          const mtlUrl = url.replace('.obj', '.mtl');
          console.log('Checking for MTL file at:', mtlUrl);
          const MTLLoaderModule = await import('three/examples/jsm/loaders/MTLLoader.js');
          const mtlLoader = new MTLLoaderModule.MTLLoader();
          
          const mtlResponse = await fetch(mtlUrl);
          if (mtlResponse.ok) {
            console.log('MTL file found, loading materials...');
            const mtlBlob = await mtlResponse.blob();
            const mtlObjectUrl = URL.createObjectURL(mtlBlob);
            
            mtlLoader.load(mtlObjectUrl, (materials) => {
              console.log('MTL loaded successfully');
              materials.preload();
              loader.setMaterials(materials);
              
              // Now load the OBJ with materials
              console.log('Loading OBJ with materials...');
              loader.load(
                url,
                (object) => {
                  console.log('OBJ loaded successfully with materials');
                  setObj(object);
                  setLoading(false);
                },
                (progress) => {
                  console.log('OBJ loading progress:', progress);
                },
                (err) => {
                  console.error('Error loading OBJ:', err);
                  setError('Failed to load OBJ model');
                  setLoading(false);
                }
              );
              
              // Clean up
              URL.revokeObjectURL(mtlObjectUrl);
            });
          } else {
            console.log('No MTL file found, loading OBJ without materials');
            // No MTL file, just load the OBJ
            loadOBJWithoutMTL();
          }
        } catch (mtlError) {
          console.warn('Could not load MTL file:', mtlError);
          loadOBJWithoutMTL();
        }
      } catch (error) {
        console.error('Error loading OBJ loader:', error);
        setError('Failed to load OBJ loader');
        setLoading(false);
      }
    };
    
    // Helper function to load OBJ without MTL
    const loadOBJWithoutMTL = async () => {
      try {
        console.log('Loading OBJ without MTL...');
        const OBJLoaderModule = await import('three/examples/jsm/loaders/OBJLoader.js');
        const loader = new OBJLoaderModule.OBJLoader();
        
        loader.load(
          url,
          (object) => {
            console.log('OBJ loaded successfully without materials');
            console.log('OBJ object:', object);
            setObj(object);
            setLoading(false);
          },
          (progress) => {
            console.log('OBJ loading progress:', progress);
          },
          (err) => {
            console.error('Error loading OBJ:', err);
            setError('Failed to load OBJ model');
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error loading OBJ without MTL:', error);
        setError('Failed to load OBJ model');
        setLoading(false);
      }
    };
    
    loadOBJ();
    
    // Cleanup function
    return () => {
      // Any cleanup code here
    };
  }, [url]);
  
  // Apply materials and adjust camera when model is loaded
  useEffect(() => {
    if (obj) {
      // Apply material based on render mode
      obj.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          
          if (renderMode === 'wireframe') {
            mesh.material = new THREE.MeshBasicMaterial({ 
              wireframe: true, 
              color: 0x00ff00 
            });
          } else if (renderMode === 'solid') {
            mesh.material = new THREE.MeshStandardMaterial({ 
              color: 0xcccccc,
              flatShading: true 
            });
          } else if (renderMode === 'textured') {
            // For textured mode, if there are no textures, use a basic material
            if (!mesh.material || 
                (Array.isArray(mesh.material) && mesh.material.length === 0) ||
                (mesh.material as THREE.Material).name === '') {
              mesh.material = new THREE.MeshStandardMaterial({ 
                color: 0xcccccc
              });
            }
          }
        }
      });
      
      // Auto-fit camera to model
      if (camera instanceof THREE.PerspectiveCamera) {
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
        
        // Set camera position
        camera.position.z = cameraZ * 1.5;
        camera.updateProjectionMatrix();
      }
    }
  }, [obj, renderMode, camera]);

  if (loading) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="blue"
          anchorX="center"
          anchorY="middle"
        >
          Loading OBJ model...
        </Text>
      </group>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return obj ? <primitive object={obj} /> : null;
};

// Camera controller component
const CameraController = ({ resetCamera, autoRotate }: { resetCamera: boolean, autoRotate: boolean }) => {
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    if (resetCamera && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetCamera]);

  return (
    <OrbitControls 
      ref={controlsRef}
      autoRotate={autoRotate}
      autoRotateSpeed={1}
      enableDamping={true}
      dampingFactor={0.1}
      enableZoom={true}
      enablePan={true}
    />
  );
};

interface ModelViewerProps {
  modelUrl: string;
  renderMode: string;
  autoRotate: boolean;
  resetCamera: boolean;
  onResetComplete?: () => void;
  lightingPreset?: string;
}

type LightingPreset = 'studio' | 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'sunset' | 'warehouse';

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  renderMode = 'textured',
  autoRotate = false,
  resetCamera = false,
  onResetComplete,
  lightingPreset = 'studio',
}) => {
  // Convert string to proper lighting preset type
  const environmentPreset = lightingPreset as LightingPreset;
  
  return (
    <>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <color attach="background" args={['#f0f0f0']} />
        
        <Suspense fallback={null}>
          <Stage environment={environmentPreset} intensity={0.5}>
            <Center>
              <Model url={modelUrl} renderMode={renderMode} />
            </Center>
          </Stage>
          <Environment preset={environmentPreset} />
        </Suspense>
        
        <CameraController resetCamera={resetCamera} autoRotate={autoRotate} />
        <Grid infiniteGrid fadeDistance={30} fadeStrength={1.5} />
      </Canvas>
      <Loader />
    </>
  );
};

export default ModelViewer; 