import './App.css';
import AuthPage from "./components/AuthPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/home";
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';  // Your custom minimal theme
import MainPage from './MainPage';

function App() {
  return (
    
    <Router>
    <Routes>
      <ChakraProvider value={system}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </ChakraProvider>
    </Routes>
  </Router>
  );
}

export default App;
