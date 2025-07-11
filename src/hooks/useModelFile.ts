import { useState, useEffect } from 'react';

interface UseModelFileResult {
  modelUrl: string | null;
  loadModel: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  fileName: string | null;
  fileType: string | null;
  clearModel: () => void;
}

const useModelFile = (): UseModelFileResult => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (modelUrl && modelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  const loadModel = (file: File) => {
    console.log('Loading model file:', file.name, 'Type:', file.type);
    
    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      return;
    }

    // Check file type
    let extension = file.name.split('.').pop()?.toLowerCase();
    
    // If no extension in the file name, try to extract it from the MIME type
    if (!extension && file.type.startsWith('model/')) {
      extension = file.type.split('/')[1];
      // Handle special cases
      if (extension === 'gltf+json') extension = 'gltf';
      if (extension === 'gltf-binary') extension = 'glb';
    }
    
    console.log('File extension detected:', extension);
    const supportedFormats = ['glb', 'gltf', 'obj', 'fbx', 'stl'];
    
    if (!extension || !supportedFormats.includes(extension)) {
      setError(`Unsupported file format: .${extension}`);
      return;
    }

    // Clear previous state
    if (modelUrl && modelUrl.startsWith('blob:')) {
      URL.revokeObjectURL(modelUrl);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      console.log('Created object URL:', objectUrl);
      
      // Store the file extension as a custom attribute in the URL
      // This is a hack since we can't modify the URL directly
      // We'll use sessionStorage to store the mapping
      sessionStorage.setItem(`fileType_${objectUrl}`, extension);
      
      setModelUrl(objectUrl);
      setFileName(file.name);
      setFileType(extension);
    } catch (err) {
      setError('Error loading model file');
      console.error('Error loading model:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearModel = () => {
    if (modelUrl) {
      // Clean up the session storage entry
      sessionStorage.removeItem(`fileType_${modelUrl}`);
      
      if (modelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(modelUrl);
      }
    }
    setModelUrl(null);
    setFileName(null);
    setFileType(null);
    setError(null);
  };

  return {
    modelUrl,
    loadModel,
    isLoading,
    error,
    fileName,
    fileType,
    clearModel
  };
};

export default useModelFile; 