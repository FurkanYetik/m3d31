import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import type { Annotation } from '../utils/annotations';

const AnnotationsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const AnnotationsList = styled(List)(({ theme }) => ({
  overflow: 'auto',
  flexGrow: 1,
}));

const ColorIndicator = styled('div')<{ color: string }>(({ theme, color }) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: color || theme.palette.primary.main,
  marginRight: theme.spacing(1),
}));

interface AnnotationsPanelProps {
  annotations: Annotation[];
  onAddAnnotation: () => void;
  onEditAnnotation: (id: string, data: Partial<Omit<Annotation, 'id'>>) => void;
  onDeleteAnnotation: (id: string) => void;
  onSelectAnnotation: (id: string) => void;
  selectedAnnotationId?: string;
}

const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({
  annotations,
  onAddAnnotation,
  onEditAnnotation,
  onDeleteAnnotation,
  onSelectAnnotation,
  selectedAnnotationId,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#3f51b5');

  const handleEditClick = (annotation: Annotation) => {
    setCurrentAnnotation(annotation);
    setEditTitle(annotation.title);
    setEditDescription(annotation.description);
    setEditColor(annotation.color || '#3f51b5');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentAnnotation) {
      onEditAnnotation(currentAnnotation.id, {
        title: editTitle,
        description: editDescription,
        color: editColor,
      });
    }
    setEditDialogOpen(false);
  };

  return (
    <AnnotationsPaper elevation={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Annotations</Typography>
        <Tooltip title="Add Annotation">
          <IconButton onClick={onAddAnnotation} size="small" color="primary">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {annotations.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <LabelIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            No annotations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Click the + button to add an annotation
          </Typography>
        </Box>
      ) : (
        <AnnotationsList>
          {annotations.map((annotation) => (
            <ListItemButton
              key={annotation.id}
              selected={selectedAnnotationId === annotation.id}
              onClick={() => onSelectAnnotation(annotation.id)}
            >
              <ColorIndicator color={annotation.color || '#3f51b5'} />
              <ListItemText
                primary={annotation.title}
                secondary={
                  annotation.description.length > 50
                    ? `${annotation.description.substring(0, 50)}...`
                    : annotation.description
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(annotation);
                  }}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnnotation(annotation.id);
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
        </AnnotationsList>
      )}

      {/* Edit Annotation Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          {currentAnnotation ? 'Edit Annotation' : 'Add Annotation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Color
            </Typography>
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              style={{ width: '100%', height: 40 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AnnotationsPaper>
  );
};

export default AnnotationsPanel; 