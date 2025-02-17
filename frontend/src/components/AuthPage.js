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

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [isSending, setIsSending] = useState(false);  // Track loading state


  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isLoggedIn()) {
      console.log("User is already logged in. Redirecting to dashboard...");
      navigate("/home"); // Redirect to dashboard if logged in
    }
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
      const response = await axios.post("http://127.0.0.1:8000/auth/login", {
        identifier: email,
        password: password
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed");
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (isSending) return; // Prevent multiple requests

    if (!email.endsWith("@mail.utoronto.ca")) {
      alert("Only @mail.utoronto.ca emails are allowed.");
      return;
    }
    
    setIsSending(true); // Disable button & show loading state
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/send-verification-code", { email });
      if (response.data.message === "Verification code sent") {
        setShowVerification(true); // Show verification code input after successful send
      }
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send verification code");
    }
    setTimeout(() => setIsSending(false), 5000); // 🔹 Ensure cooldown before enabling
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
                 isLoading={isSending}  // Show loading indicator
                 isDisabled={isSending} // Prevent multiple clicks
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
