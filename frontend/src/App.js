// src/App.js
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';  // Your custom minimal theme
import MainPage from './MainPage';
import './App.css';

function App() {
    return (
        <ChakraProvider value={system}>
            <MainPage />
        </ChakraProvider>
    );
}

export default App;