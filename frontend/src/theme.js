// src/theme.js
import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                primary: { value: 'rgb(0,42,92)' },      // Primary color: R0, G42, B92
                secondary: { value: 'rgb(0,139,176)' },    // Secondary color: R0, G139, B176
                white: { value: '#FFFFFF' }                // White
            },
        },
    },
});