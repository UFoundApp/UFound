import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Check if these components exist and are properly exported
// Comment them out for now if they're not ready
// import EmailInput from "./EmailInput";
// import VerifyCode from "./VerifyCode";
// import PasswordSetup from "./PasswordSetup";
import axios from "axios";
import {
  Box,
  Container,
  VStack,
  Input,
  Button,
  Text,
  Heading,
  Link,
} from '@chakra-ui/react';
import '../App.css';
import { isLoggedIn } from './AuthPageUtil'; // Import isLoggedIn function
import EmailInput from "./EmailInput";
import VerifyCode from "./VerifyCode";
import PasswordSetup from "./PasswordSetup";


import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';
import { useColorMode } from '../theme/ColorModeContext';


function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [isSending, setIsSending] = useState(false);  // Track loading state

  const { showAlert } = useContext(AlertContext);
  const { colorMode } = useColorMode();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          console.log("User is already logged in. Redirecting to dashboard...");
          showAlert("info", "surface", "Already Logged In", "Redirecting to dashboard...");
          setTimeout(() => navigate("/home"), 1000); // Redirect to dashboard
        }
      } catch (error) {
        showAlert("error", "surface", "Error", "An error occurred while checking login status");
        console.error("Error checking login status:", error);
      }
    };
  
    setTimeout(checkAuthStatus, 500); // Delay to ensure cookies are set
  }, [navigate]);
  

  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                identifier: email,
                password: password,
            }),
            credentials: "include",  // Ensures cookies are sent & stored
        });

        const data = await response.json();
        console.log("🔹 Login Response:", data);

        if (response.ok) {
            console.log("Login Successful!");
            
            // Manually check authentication after login
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
              showAlert("success", "surface", "Login Successful", "Redirecting to dashboard...");
              setTimeout(() => navigate("/home"), 2000); // Redirect to dashboard 
            }
        } else {
            console.error("Login failed:", data.detail);
            showAlert("error", "surface", "Login Failed", data.detail);
        }
    } catch (error) {
        console.error("Error during login:", error);
        showAlert("error", "surface", "Login Failed", "An error occurred");
    }
};


  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (isSending) return; // Prevent multiple requests

    
    setIsSending(true); // Disable button & show loading state
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/send-verification-code", { email });
      if (response.data.message === "Verification code sent") {
        showAlert("success", "surface", "Verification Code Sent", "Please check your email for the verification code");
        setShowVerification(true); // Show verification code input after successful send
      }
    } catch (error) {
      showAlert("error", "surface", "Error", "An error occurred while sending the verification code");
    }
    setTimeout(() => setIsSending(false), 5000); // 🔹 Ensure cooldown before enabling
  };

  return (
    <Box 
      height="100vh"
      overflow="hidden"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} 
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >     
      <Container maxW="lg" maxH="90vh" overflowY="auto" sx={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: colorMode === 'light' ? 'gray.300' : 'gray.600',
          borderRadius: '24px',
        },
      }}>
        <VStack 
          spacing={8} 
          bg={colorMode === 'light' ? 'white' : 'gray.700'} 
          rounded="lg" 
          boxShadow="lg" 
          p={10}
          borderWidth="5px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
        >
          <Heading 
            size="lg"
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            {isLogin ? 'Login' : 'Sign up now'}
          </Heading>
          
          {!isLogin && (
            <Text 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
              textAlign="center" 
              fontSize="sm"
            >
              Join other students in your university's exclusive anonymous social network.
            </Text>
          )}

          <>
            {isLogin ? (
              <VStack as="form" onSubmit={handleLoginSubmit} spacing={4} w="100%">
                <VStack align="stretch" w="100%" spacing={2}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium"
                    color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                  >
                    University Email
                  </Text>
                  <Input
                    type="text"
                    placeholder="john.doe@utoronto.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    required
                    bg={colorMode === 'light' ? 'white' : 'gray.600'}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                    _placeholder={{
                      color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                    }}
                  />
                </VStack>

                <VStack align="stretch" w="100%" spacing={2}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium"
                    color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                  >
                    Password
                  </Text>
                  <Input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    required
                    bg={colorMode === 'light' ? 'white' : 'gray.600'}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                    _placeholder={{
                      color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                    }}
                  />
                </VStack>

                <Link
                  alignSelf="flex-start"
                  color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
                  fontSize="sm"
                  onClick={handleResetPassword}
                  cursor="pointer"
                  _hover={{
                    color: colorMode === 'light' ? 'blue.600' : 'blue.200'
                  }}
                >
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  borderRadius="full"
                  mt={4}
                  bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                  color="white"
                  _hover={{
                    bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                  }}
                >
                  Log In
                </Button>
              </VStack>
            ) : !showVerification ? (
              <VStack as="form" onSubmit={handleSignupSubmit} spacing={6} w="100%">
                <VStack align="stretch" w="100%" spacing={2}>
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium"
                    color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                  >
                    University Email
                  </Text>
                  <Input 
                    type="email"
                    placeholder="john.doe@mail.utoronto.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    required
                    bg={colorMode === 'light' ? 'white' : 'gray.600'}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                    _placeholder={{
                      color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                    }}
                  />
                </VStack>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  borderRadius="full"
                  isLoading={isSending}
                  isDisabled={isSending}
                  bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                  color="white"
                  _hover={{
                    bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                  }}
                >
                  {isSending ? "Sending..." : "Send Verification Code"}
                </Button>
              </VStack>
            ) : !isVerified ? (
              <VerifyCode 
                email={email} 
                onSuccess={() => setIsVerified(true)} 
              />
            ) : (
              <PasswordSetup
                email={email}
                onSuccess={() => navigate("/home")}
              />
            )}
          </>

          <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
              onClick={toggleForm}
              _hover={{ 
                textDecoration: 'underline',
                color: colorMode === 'light' ? 'blue.600' : 'blue.200'
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Link>
          </Text>

          <Text 
            color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
            fontSize="xs" 
            textAlign="center"
          >
            If you need help, please contact{' '}
            <Link 
              color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
              href="mailto:ufoundapp@gmail.com"
              _hover={{
                color: colorMode === 'light' ? 'blue.600' : 'blue.200'
              }}
            >
              ufoundapp@gmail.com
            </Link>
          </Text>

          <VStack spacing={2}>
            <Link 
              fontSize="xs" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              href="#"
              _hover={{
                color: colorMode === 'light' ? 'gray.700' : 'gray.200'
              }}
            >
              Terms of Use
            </Link>
            <Link 
              fontSize="xs" 
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              href="#"
              _hover={{
                color: colorMode === 'light' ? 'gray.700' : 'gray.200'
              }}
            >
              Privacy Policy
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default AuthPage;
