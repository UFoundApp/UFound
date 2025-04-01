// src/theme.js
import { createSystem, defaultConfig } from '@chakra-ui/react';

const colors = {
  light: {
    bg: { value: '#F7FAFC' },      // Light gray background
    text: { value: '#1A202C' },    // Dark text
    primary: { value: 'rgb(0,42,92)' },
    secondary: { value: 'rgb(0,139,176)' },
    white: { value: '#FFFFFF' },
    gray: {
      50: { value: '#F7FAFC' },
      100: { value: '#EDF2F7' },
      200: { value: '#E2E8F0' },
      500: { value: '#718096' },
      600: { value: '#4A5568' },
    }
  },
  dark: {
    bg: { value: '#1A202C' },      // Dark background
    text: { value: '#F7FAFC' },    // Light text
    primary: { value: 'rgb(0,139,176)' },
    secondary: { value: 'rgb(0,42,92)' },
    white: { value: '#2D3748' },
    gray: {
      50: { value: '#2D3748' },
      100: { value: '#4A5568' },
      200: { value: '#718096' },
      500: { value: '#A0AEC0' },
      600: { value: '#CBD5E0' },
    }
  }
};

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors,
    },
  },
});