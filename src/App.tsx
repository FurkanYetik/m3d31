import { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ModelViewer from './components/ModelViewer';
import FileUploader from './components/FileUploader';
import ControlsPanel from './components/ControlsPanel';
import AnnotationsPanel from './components/AnnotationsPanel';
import SampleModels from './components/SampleModels';
import useModelFile from './hooks/useModelFile';
import useFullscreen from './hooks/useFullscreen';
import ThemeProvider, { useThemeMode } from './utils/ThemeProvider';
import { createAnnotationManager } from './utils/annotations';
import type { Annotation } from './utils/annotations';
import * as THREE from 'three';

const drawerWidth = 300;

const MainContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const ViewerContainer = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 10,
  color: '#fff',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

interface SampleModel {
  name: string;
  url: string;
  format: string;
}

function ModelViewerApp() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Model state
  const { 
    modelUrl, 
    loadModel, 
    isLoading, 
    error, 
    fileName, 
    fileType, 
    clearModel 
  } = useModelFile();
  
  // Viewer state
  const [renderMode, setRenderMode] = useState<string>('textured');
  const [lightingPreset, setLightingPreset] = useState<string>('studio');
  const [resetCamera, setResetCamera] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Tabs state
  const [tabValue, setTabValue] = useState(0);
  
  // Annotations state
  const annotationManagerRef = useRef(createAnnotationManager());
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | undefined>(undefined);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // Update annotations when the manager changes
  useEffect(() => {
    setAnnotations(annotationManagerRef.current.annotations);
  }, []);
  
  // Handle camera reset
  useEffect(() => {
    if (resetCamera) {
      const timer = setTimeout(() => {
        setResetCamera(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [resetCamera]);
  
  // Handle file upload
  const handleFileUpload = (file: File) => {
    // Check if file type is supported
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'glb' || fileExtension === 'gltf' || fileExtension === 'obj') {
      loadModel(file);
      showAlert(`Loaded model: ${file.name}`, 'success');
    } else {
      showAlert(`File format .${fileExtension} is not fully supported yet. Only GLB/GLTF/OBJ files are currently supported.`, 'warning');
      loadModel(file); // Still try to load it to show placeholder
    }
  };

  // Handle sample model selection
  const handleSampleModelSelect = (model: SampleModel) => {
    console.log('Sample model selected:', model);
    // Create a temporary file from the URL
    fetch(model.url)
      .then(response => {
        console.log('Sample model fetch response:', response);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        console.log('Sample model blob:', blob);
        
        // Create a proper MIME type based on the format
        let mimeType = 'application/octet-stream'; // default
        
        switch (model.format.toLowerCase()) {
          case 'gltf':
            mimeType = 'model/gltf+json';
            break;
          case 'glb':
            mimeType = 'model/gltf-binary';
            break;
          case 'obj':
            mimeType = 'model/obj';
            break;
          case 'stl':
            mimeType = 'model/stl';
            break;
          case 'fbx':
            mimeType = 'model/fbx';
            break;
        }
        
        // Create a File object from the blob with proper name and MIME type
        const fileName = model.name.includes('.') ? model.name : `${model.name}.${model.format}`;
        const file = new File([blob], fileName, { type: mimeType });
        
        console.log('Created File object:', file);
        loadModel(file);
        showAlert(`Loaded sample model: ${model.name}`, 'success');
      })
      .catch(err => {
        console.error('Error loading sample model:', err);
        showAlert(`Failed to load sample model: ${err.message}`, 'error');
      });
  };
  
  // Handle adding annotation
  const handleAddAnnotation = () => {
    if (!modelUrl) {
      showAlert('Please load a model first', 'warning');
      return;
    }
    
    // In a real app, we would get the position from a click on the model
    // For now, we'll just use a random position
    const randomPosition = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    
    const newAnnotation = annotationManagerRef.current.addAnnotation({
      position: randomPosition,
      title: 'New Annotation',
      description: 'Click to edit this annotation',
      color: '#3f51b5',
    });
    
    setAnnotations([...annotationManagerRef.current.annotations]);
    setSelectedAnnotationId(newAnnotation.id);
    showAlert('Annotation added', 'success');
  };
  
  // Handle editing annotation
  const handleEditAnnotation = (id: string, data: Partial<Omit<Annotation, 'id'>>) => {
    annotationManagerRef.current.updateAnnotation(id, data);
    setAnnotations([...annotationManagerRef.current.annotations]);
    showAlert('Annotation updated', 'success');
  };
  
  // Handle deleting annotation
  const handleDeleteAnnotation = (id: string) => {
    annotationManagerRef.current.removeAnnotation(id);
    setAnnotations([...annotationManagerRef.current.annotations]);
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(undefined);
    }
    showAlert('Annotation deleted', 'success');
  };
  
  // Handle selecting annotation
  const handleSelectAnnotation = (id: string) => {
    setSelectedAnnotationId(id);
  };
  
  // Show alert message
  const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            3D Model Viewer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="GLB/GLTF" 
              color="success" 
              size="small" 
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
            />
            <Chip 
              label="OBJ" 
              color="success" 
              size="small" 
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
            />
            <Chip 
              label="STL/FBX Coming Soon" 
              color="warning" 
              size="small" 
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
            />
          </Box>
          {!modelUrl && (
            <IconButton color="inherit" onClick={() => document.getElementById('file-upload-input')?.click()}>
              <UploadFileIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Upload" />
            <Tab label="Samples" />
            <Tab label="Annotations" />
          </Tabs>
          
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }} hidden={tabValue !== 0}>
            <FileUploader 
              onFileUpload={handleFileUpload} 
              acceptedFileTypes={['.glb', '.gltf', '.obj', '.fbx', '.stl']} 
            />
            
            {fileName && (
              <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Model
                </Typography>
                <Typography variant="body2">
                  {fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Type: {fileType?.toUpperCase()}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }} hidden={tabValue !== 1}>
            <SampleModels onSelectModel={handleSampleModelSelect} />
          </Box>
          
          <Box sx={{ flexGrow: 1, height: '100%' }} hidden={tabValue !== 2}>
            <AnnotationsPanel 
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
              onEditAnnotation={handleEditAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              onSelectAnnotation={handleSelectAnnotation}
              selectedAnnotationId={selectedAnnotationId}
            />
          </Box>
        </Box>
      </StyledDrawer>
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        <Toolbar />
        
        <ViewerContainer ref={viewerContainerRef} elevation={3}>
          {isLoading && (
            <LoadingOverlay>
              <CircularProgress color="inherit" size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading Model...
              </Typography>
            </LoadingOverlay>
          )}
          
          {!modelUrl ? (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
              }}
            >
              <UploadFileIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" align="center" gutterBottom>
                No Model Loaded
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Upload a 3D model to get started
              </Typography>
            </Box>
          ) : (
            <ModelViewer 
              modelUrl={modelUrl}
              renderMode={renderMode}
              autoRotate={autoRotate}
              resetCamera={resetCamera}
              lightingPreset={lightingPreset}
            />
          )}
        </ViewerContainer>
        
        <ControlsPanel 
          renderMode={renderMode}
          onRenderModeChange={setRenderMode}
          lightingPreset={lightingPreset}
          onLightingPresetChange={setLightingPreset}
          onResetCamera={() => setResetCamera(true)}
          onToggleFullscreen={() => toggleFullscreen(viewerContainerRef.current)}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </Box>
      
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ModelViewerApp />
    </ThemeProvider>
  );
}

export default App;
