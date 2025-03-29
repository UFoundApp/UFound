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
import TopNav from './components/TopNav';
import { Box, Flex } from '@chakra-ui/react';
import CreatePost from "./components/CreatePost";
import ReviewsPage from "./components/ReviewPage";
import CoursePage from "./components/CoursePage";
import UserProfile from "./components/UserProfile";
import ProfessorPage from "./pages/ProfessorPage"; 
import Professors from "./components/Professors";
import SearchResults from './components/SearchResults';
import AdminFlaggedPage from './components/AdminFlaggedPage'; 
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import { AlertProvider } from './components/UI/AlertContext';
import AlertComponent from './components/UI/Alert';
function App() {
  return (
    <ChakraProvider value={system}>
      <AlertProvider>
      <Router>
        <Flex direction="column" minH="100vh">
          {/* Fixed TopNav */}
          <Box position="fixed" top="0" left="0" right="0" zIndex="1000">
            <TopNav />
            <AlertComponent />
          </Box>

          {/* Main content with top padding to account for fixed TopNav */}
          <Box flex="1" pt="75px">

            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
                <Route path="/home" element={<PageTransition><MainPage /></PageTransition>} />
                <Route path="/view-post/:id" element={<PageTransition><ViewPost /></PageTransition>} />
                <Route path="/create-post" element={<PageTransition><CreatePost /></PageTransition>} />
                <Route path="/courses" element={<PageTransition><ReviewsPage /></PageTransition>} />
                <Route path="/course/:courseId" element={<PageTransition><CoursePage /></PageTransition>} />
                <Route path="/professors" element={<PageTransition><Professors /></PageTransition>} />
                <Route path="/professors/:professorId" element={<PageTransition><ProfessorPage /></PageTransition>} />
                <Route path="/profile/:username" element={<PageTransition><UserProfile /></PageTransition>} />
                <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />
                <Route path="/admin" element={<AdminFlaggedPage><AdminFlaggedPage /></PageTransition>} />                         
                                         
              </Routes>
            </AnimatePresence>
          </Box>
        </Flex>
      </Router>
      </AlertProvider>
    </ChakraProvider>
  );
}

export default App;