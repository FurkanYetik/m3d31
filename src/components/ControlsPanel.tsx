import React from 'react';
import { 
  Box, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton, 
  IconButton, 
  Tooltip, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import GridOnIcon from '@mui/icons-material/GridOn';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

const ControlsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
}));

const ControlGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

interface ControlsPanelProps {
  renderMode: string;
  onRenderModeChange: (mode: string) => void;
  lightingPreset: string;
  onLightingPresetChange: (preset: string) => void;
  onResetCamera: () => void;
  onToggleFullscreen: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  renderMode,
  onRenderModeChange,
  lightingPreset,
  onLightingPresetChange,
  onResetCamera,
  onToggleFullscreen,
  autoRotate,
  onToggleAutoRotate,
  darkMode,
  onToggleDarkMode,
}) => {
  const handleRenderModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string,
  ) => {
    if (newMode !== null) {
      onRenderModeChange(newMode);
    }
  };

  return (
    <ControlsContainer elevation={2}>
      <ControlGroup>
        <ToggleButtonGroup
          value={renderMode}
          exclusive
          onChange={handleRenderModeChange}
          aria-label="render mode"
          size="small"
        >
          <ToggleButton value="textured" aria-label="textured">
            <Tooltip title="Textured">
              <ViewInArIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="solid" aria-label="solid">
            <Tooltip title="Solid">
              <GridOnIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="wireframe" aria-label="wireframe">
            <Tooltip title="Wireframe">
              <GridOnIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </ControlGroup>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />

      <ControlGroup>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="lighting-preset-label">Lighting</InputLabel>
          <Select
            labelId="lighting-preset-label"
            id="lighting-preset"
            value={lightingPreset}
            label="Lighting"
            onChange={(e) => onLightingPresetChange(e.target.value)}
          >
            <MenuItem value="studio">Studio</MenuItem>
            <MenuItem value="sunset">Sunset</MenuItem>
            <MenuItem value="dawn">Dawn</MenuItem>
            <MenuItem value="night">Night</MenuItem>
            <MenuItem value="warehouse">Warehouse</MenuItem>
            <MenuItem value="forest">Forest</MenuItem>
            <MenuItem value="apartment">Apartment</MenuItem>
            <MenuItem value="city">City</MenuItem>
          </Select>
        </FormControl>
      </ControlGroup>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />

      <ControlGroup>
        <Tooltip title="Reset Camera">
          <IconButton onClick={onResetCamera} size="small">
            <CenterFocusStrongIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle Fullscreen">
          <IconButton onClick={onToggleFullscreen} size="small">
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </ControlGroup>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />

      <ControlGroup>
        <FormControlLabel
          control={
            <Switch
              checked={autoRotate}
              onChange={onToggleAutoRotate}
              size="small"
            />
          }
          label="Auto-rotate"
        />
      </ControlGroup>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <Divider sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }} />

      <ControlGroup>
        <Tooltip title="Toggle Theme">
          <IconButton onClick={onToggleDarkMode} size="small">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </ControlGroup>
    </ControlsContainer>
  );
};

export default ControlsPanel; 