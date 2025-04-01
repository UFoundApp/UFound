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
  Stack,
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


function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [isSending, setIsSending] = useState(false);  // Track loading state
  const [loginLoading, setLoginLoading] = useState(false); // Track loading state for login

  const { showAlert } = useContext(AlertContext);

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
    setLoginLoading(true); // Disable button & show loading state

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
              navigate("/home");
            }
        } else {
            console.error("Login failed:", data.detail);
            showAlert("error", "surface", "Login Failed", data.detail);
        }
    } catch (error) {
        console.error("Error during login:", error);
        showAlert("error", "surface", "Login Failed", "An error occurred");
    } 
    setLoginLoading(false); 
};


  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
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
    setTimeout(() => setIsSending(false), 2000); // 🔹 Ensure cooldown before enabling
  };

  return (
    <Box minH="100vh" bg="gray.50" py={20} px={4}>     
        
      <Container maxW="lg">
        <VStack spacing={8} bg="white" rounded="lg" boxShadow="lg" p={10}>
          <Heading size="lg">
            {isLogin ? 'Login' : 'Sign up now'}
          </Heading>
          
          {!isLogin && (
            <Text color="gray.600" textAlign="center" fontSize="sm">
              Join other students in your university's exclusive anonymous social network.
            </Text>
          )}

          <>
            {isLogin ? (
              <VStack as="form" onSubmit={handleLoginSubmit} spacing={4} w="100%">
                <VStack align="stretch" w="100%" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">University Email</Text>
                  <Input
                    type="text"
                    placeholder="john.doe@utoronto.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    required
                  />
                </VStack>

                <VStack align="stretch" w="100%" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">Password</Text>
                  <Input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    required
                  />
                </VStack>

                <Link
                  alignSelf="flex-start"
                  color="blue.500"
                  fontSize="sm"
                  onClick={handleResetPassword}
                  cursor="pointer"
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
                  loading={loginLoading}
                  isDisabled={loginLoading} 
                  loadingText="Logging in..."

                >
                  Log In
                </Button>
              </VStack>
            ) : !showVerification ? (
              <VStack as="form" onSubmit={handleSignupSubmit} spacing={6} w="100%">
                <VStack align="stretch" w="100%" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">University Email</Text>
                  <Input 
                    type="email"
                    placeholder="john.doe@mail.utoronto.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    required
                  />
                </VStack>

                <Button
                 type="submit"
                 colorScheme="blue"
                 size="lg"
                 width="100%"
                 borderRadius="full"
                 loading={isSending}
                 isDisabled={isSending} // Prevent multiple clicks
                 loadingText="Sending..."
               >
                 Send Verification Code
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

          <Text color="gray.600" fontSize="sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              color="blue.500"
              onClick={toggleForm}
              _hover={{ textDecoration: 'underline' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </Link>
          </Text>

          <Text color="gray.600" fontSize="xs" textAlign="center">
            If you need help, please contact{' '}
            <Link color="blue.500" href="mailto:ufoundapp@gmail.com">
              ufoundapp@gmail.com
            </Link>
          </Text>

          <VStack spacing={2}>
            <Link fontSize="xs" color="gray.600" href="#">
              Terms of Use
            </Link>
            <Link fontSize="xs" color="gray.600" href="#">
              Privacy Policy
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default AuthPage;
