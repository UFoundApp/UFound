import './App.css';
import AuthPage from "./components/AuthPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/home";
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';  // Your custom minimal theme
import MainPage from './MainPage';
import TopNav from './components/TopNav';
import { Box, Flex } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider value={system}>
      <Router>
        <Flex direction="column" minH="100vh">
          <TopNav />
          <Box flex="1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/home" element={<MainPage />} />
            </Routes>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

export default App;
