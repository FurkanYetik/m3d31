# 3D Model Viewer

A modern, web-based 3D model viewer application built with React, Three.js, and Material-UI. This application allows users to view and interact with 3D models in various formats.

## Features

- **File Format Support**: GLB, GLTF, OBJ, FBX, STL
- **Viewing Controls**:
  - Orbit, pan, and zoom camera controls
  - Model rotation with mouse/touch input
  - Wireframe, solid, and textured rendering modes
  - Multiple lighting options
  - Auto-fit to screen (camera reset)
  - Fullscreen mode toggle
- **Advanced Features**:
  - Annotations on parts of the model
  - Dark/light theme switch
  - Responsive design for all screen sizes

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Three.js**: 3D rendering library
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber
- **Material-UI**: UI component library
- **Vite**: Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-model-viewer.git
cd 3d-model-viewer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

1. **Upload a 3D Model**:
   - Drag and drop a 3D model file onto the upload area
   - Or click to select a file from your device

2. **Interact with the Model**:
   - Left-click and drag to rotate
   - Right-click and drag to pan
   - Scroll to zoom in/out
   - Use the controls panel to change rendering mode, lighting, etc.

3. **Add Annotations**:
   - Switch to the Annotations tab
   - Click the "+" button to add a new annotation
   - Edit or delete annotations as needed

## Project Structure

```
src/
├── components/         # React components
│   ├── ModelViewer.tsx # Main 3D viewer component
│   ├── FileUploader.tsx # File upload component
│   ├── ControlsPanel.tsx # Controls UI
│   └── AnnotationsPanel.tsx # Annotations UI
├── hooks/              # Custom React hooks
│   ├── useModelFile.ts # Model file handling
│   └── useFullscreen.ts # Fullscreen functionality
├── utils/              # Utility functions
│   ├── annotations.ts  # Annotation management
│   └── ThemeProvider.tsx # Theme management
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Performance Considerations

- Large models are loaded asynchronously to prevent UI freezing
- Camera and rendering optimizations for smooth performance
- Efficient memory management for model loading/unloading

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for the excellent 3D rendering library
- React Three Fiber team for making Three.js integration with React seamless
- Material-UI team for the comprehensive UI component library
