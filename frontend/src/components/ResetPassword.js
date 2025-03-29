import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailInput from "./EmailInput";
import VerifyCode from "./VerifyCode";
import PasswordSetup from "./PasswordSetup";
import {
  Box,
  Container,
  VStack,
  Text,
  Heading,
  Link,
  Button,
} from '@chakra-ui/react';


function ResetPassword() {
  const [resetPasswordState, setResetPasswordState] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isPassUpdated, setIsPassUpdated] = useState(false);

  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <Box minH="100vh" bg="gray.50" py={20} px={4}>
      <Container maxW="lg">
        <VStack spacing={8} bg="white" rounded="lg" boxShadow="lg" p={10}>
          <Heading size="lg" mb={2}>
            Reset Password
          </Heading>
          
          <>
          {!email ? (
            <VStack spacing={6} w="100%" align="center">
              <Text color="gray.600" fontSize="sm" textAlign="center">
                Enter your UofT email address to receive a verification code.
              </Text>
              <VStack w="100%" spacing={6}>
                <VStack w="100%" spacing={2} align="flex-start">
                  <Text fontSize="sm" fontWeight="medium">
                    Enter Your UofT Email
                  </Text>
                  <EmailInput 
                    onSuccess={(enteredEmail) => setEmail(enteredEmail)} 
                    resetPasswordState={resetPasswordState}
                    buttonProps={{
                      width: "100%",
                      mt: 4,
                      size: "lg",
                      colorScheme: "blue",
                      borderRadius: "full",
                      children: "Send Code"
                    }}
                  />
                </VStack>
              </VStack>
            </VStack>
          ) : !isVerified ? (
            <VStack spacing={6} w="100%" align="center">
              <Text color="gray.600" fontSize="sm" textAlign="center">
                Check your email for the 6-digit verification code.
              </Text>
              <VerifyCode 
                email={email} 
                onSuccess={() => setIsVerified(true)} 
              />
            </VStack>
          ) : !isPassUpdated ? (
            <VStack spacing={6} w="100%" align="center">
              <Text color="gray.600" fontSize="sm" textAlign="center">
                Set up a new password for your account.
              </Text>
              <PasswordSetup 
                email={email} 
                onSuccess={() => setIsPassUpdated(true)} 
                resetPasswordState={resetPasswordState} 
              />
            </VStack>
          ) : (
            <VStack spacing={6} w="100%" align="center">
              <Heading size="md">🎉 Password Updated Successfully!</Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                You can now log in with your new password
              </Text>
              <Button
                onClick={() => navigate("/")}
                colorScheme="blue"
                size="lg"
                width="100%"
                borderRadius="full"
              >
                Return to Login
              </Button>
            </VStack>
          )}
          </>

          <VStack spacing={4} pt={4}>
            <Text color="gray.600" fontSize="sm">
              Don't have an account?{' '}
              <Link
                color="blue.500"
                href="/login"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign Up
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
        </VStack>
      </Container>
    </Box>
  );
}

export default ResetPassword;