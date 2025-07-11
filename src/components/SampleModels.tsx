import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

interface SampleModel {
  name: string;
  url: string;
  format: string;
}

interface SampleModelsProps {
  onSelectModel: (model: SampleModel) => void;
}

const SampleModels: React.FC<SampleModelsProps> = ({ onSelectModel }) => {
  const [models, setModels] = useState<SampleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log('Fetching sample models...');
        const response = await fetch('/sample-models.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch sample models: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Sample models loaded:', data.models);
        setModels(data.models || []);
      } catch (err) {
        console.error('Error loading sample models:', err);
        setError('Failed to load sample models');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleModelSelect = (model: SampleModel, index: number) => {
    console.log('Selected sample model:', model);
    setSelectedIndex(index);
    onSelectModel(model);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading sample models...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ mt: 2 }}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Sample Models
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a sample model to view:
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 0 }}>
        {models.map((model, index) => (
          <ListItemButton 
            key={index}
            selected={selectedIndex === index}
            onClick={() => handleModelSelect(model, index)}
          >
            <ListItemIcon>
              <ViewInArIcon />
            </ListItemIcon>
            <ListItemText 
              primary={model.name} 
              secondary={`Format: ${model.format.toUpperCase()}`}
            />
          </ListItemButton>
        ))}
      </List>
      
      {models.length === 0 && (
        <Box p={2}>
          <Typography variant="body2" color="text.secondary" align="center">
            No sample models available
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SampleModels; 