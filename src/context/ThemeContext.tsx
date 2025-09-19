import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadow: string;
  overlay: string;
  gradient: string[];
  tabBar: string;
  statusBar: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2E7D32',
    secondary: '#388E3C',
    accent: '#4CAF50',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#424242',
    textMuted: '#757575',
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: ['#4CAF50', '#2E7D32'],
    tabBar: '#FFFFFF',
    statusBar: '#FAFAFA',
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#00E676',
    secondary: '#4CAF50',
    accent: '#81C784',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    textMuted: '#BDBDBD',
    border: '#2A2A2A',
    borderLight: '#333333',
    success: '#00E676',
    warning: '#FF9800',
    error: '#FF5252',
    info: '#64B5F6',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    gradient: ['#00E676', '#4CAF50'],
    tabBar: '#000000',
    statusBar: '#0A0A0A',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value = useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    colors: theme.colors,
  }), [isDark, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { lightTheme, darkTheme };
