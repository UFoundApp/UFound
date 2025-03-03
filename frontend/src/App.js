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
import ProfessorPage from "./pages/ProfessorPage"; // ✅ Import Professor Page
import Professors from "./components/Professors";

function App() {
  return (
    <ChakraProvider value={system}>
      <Router>
        <Flex direction="column" minH="100vh">
          {/* Fixed TopNav */}
          <Box position="fixed" top="0" left="0" right="0" zIndex="1000">
            <TopNav />
          </Box>

          {/* Main content with top padding to account for fixed TopNav */}
          <Box flex="1" pt="75px">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/home" element={<MainPage />} />
              <Route path="/view-post/:id" element={<ViewPost />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/courses" element={<ReviewsPage />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="/professors" element={<Professors />} />
              <Route path="/professors/:professorId" element={<ProfessorPage />} />  {/* ✅ Added Professor Page */}
              <Route path="/profile/:username" element={<UserProfile />} />  {/* ✅ Added User Profile Page */}
            </Routes>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

export default App;