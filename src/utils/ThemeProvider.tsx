import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define the context type
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a hook to use the theme context
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use localStorage to persist theme preference if available
  const getInitialMode = (): boolean => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('darkMode');
      if (typeof storedPrefs === 'string') {
        return storedPrefs === 'true';
      }
      
      // If no stored preference, use system preference
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return true;
      }
    }
    
    // Default to light mode
    return false;
  };

  const [darkMode, setDarkMode] = useState<boolean>(getInitialMode());

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('darkMode', String(newMode));
    }
  };

  // Create theme based on current mode
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: darkMode ? '#90caf9' : '#1976d2',
        },
        secondary: {
          main: darkMode ? '#f48fb1' : '#dc004e',
        },
        background: {
          default: darkMode ? '#121212' : '#f5f5f5',
          paper: darkMode ? '#1e1e1e' : '#ffffff',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarColor: darkMode ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
              '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                backgroundColor: darkMode ? '#2b2b2b' : '#f5f5f5',
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                borderRadius: 8,
                backgroundColor: darkMode ? '#6b6b6b' : '#959595',
                minHeight: 24,
              },
              '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
                backgroundColor: darkMode ? '#959595' : '#6b6b6b',
              },
            },
          },
        },
      },
    }),
    [darkMode]
  );

  // Provide the theme context to children
  const contextValue = useMemo(() => ({
    darkMode,
    toggleDarkMode,
    theme,
  }), [darkMode, theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 