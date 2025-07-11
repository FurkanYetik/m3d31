import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DropzoneContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#f5f5f5',
  color: theme.palette.text.secondary,
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
  minHeight: 200,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
  },
}));

const UploadIcon = styled(CloudUploadIcon)(({ theme }) => ({
  fontSize: 48,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, acceptedFileTypes }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'model/obj': ['.obj'],
      'model/fbx': ['.fbx'],
      'model/stl': ['.stl'],
    },
    maxFiles: 1,
  });

  return (
    <Box sx={{ width: '100%' }}>
      <DropzoneContainer {...getRootProps()}>
        <input {...getInputProps()} />
        <UploadIcon />
        {isDragActive ? (
          <Typography variant="h6" align="center">
            Drop the file here...
          </Typography>
        ) : isDragReject ? (
          <Typography variant="h6" align="center" color="error">
            Unsupported file format
          </Typography>
        ) : (
          <>
            <Typography variant="h6" align="center">
              Drag & drop a 3D model file here
            </Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              or click to select a file
            </Typography>
            <Typography variant="caption" align="center" sx={{ mt: 2 }}>
              Supported formats: {acceptedFileTypes.join(', ')}
            </Typography>
          </>
        )}
      </DropzoneContainer>
    </Box>
  );
};

export default FileUploader; 