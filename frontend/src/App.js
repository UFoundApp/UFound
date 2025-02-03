import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme'; // Your custom minimal theme
import MainPage from './MainPage';
import ViewPost from './Posts/ViewPost';
import Dashboard from "./components/Dashboard";
import ResetPassword from "./components/ResetPassword";
import Home from "./components/home";
import AuthPage from "./components/AuthPage";

function App() {
    return (
        <ChakraProvider value={system}>
            <Router>
                <Routes>
                    <Route path="/view-post/:id" element={<ViewPost />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<AuthPage />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;
