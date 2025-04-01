import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorModeContext = createContext();

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
};

export const ColorModeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState(() => {
    const savedMode = localStorage.getItem('chakra-ui-color-mode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('chakra-ui-color-mode', colorMode);
    document.documentElement.className = colorMode;
  }, [colorMode]);

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}; 