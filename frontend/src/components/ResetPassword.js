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
import { useColorMode } from '../theme/ColorModeContext';

function ResetPassword() {
  const [resetPasswordState, setResetPasswordState] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isPassUpdated, setIsPassUpdated] = useState(false);
  const { colorMode } = useColorMode();

  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <Box 
      minH="100vh" 
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} 
      py={20} 
      px={4}
    >
      <Container maxW="lg">
        <VStack 
          spacing={8} 
          bg={colorMode === 'light' ? 'white' : 'gray.700'} 
          rounded="lg" 
          boxShadow="lg" 
          p={10}
          borderWidth="1px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
        >
          <Heading 
            size="lg" 
            mb={2}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Reset Password
          </Heading>
          
          <>
          {!email ? (
            <VStack spacing={6} w="100%" align="center">
              <Text 
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
                fontSize="sm" 
                textAlign="center"
              >
                Enter your UofT email address to receive a verification code.
              </Text>
              <VStack w="100%" spacing={6}>
                <VStack w="100%" spacing={2} align="flex-start">
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium"
                    color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                  >
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
                      bg: colorMode === 'light' ? 'blue.500' : 'blue.400',
                      color: "white",
                      _hover: {
                        bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                      },
                      children: "Send Code"
                    }}
                  />
                </VStack>
              </VStack>
            </VStack>
          ) : !isVerified ? (
            <VStack spacing={6} w="100%" align="center">
              <Text 
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
                fontSize="sm" 
                textAlign="center"
              >
                Check your email for the 6-digit verification code.
              </Text>
              <VerifyCode 
                email={email} 
                onSuccess={() => setIsVerified(true)} 
              />
            </VStack>
          ) : !isPassUpdated ? (
            <VStack spacing={6} w="100%" align="center">
              <Text 
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
                fontSize="sm" 
                textAlign="center"
              >
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
              <Heading 
                size="md"
                color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
              >
                🎉 Password Updated Successfully!
              </Heading>
              <Text 
                color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
                fontSize="sm" 
                textAlign="center"
              >
                You can now log in with your new password
              </Text>
              <Button
                onClick={() => navigate("/")}
                colorScheme="blue"
                size="lg"
                width="100%"
                borderRadius="full"
                bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                color="white"
                _hover={{
                  bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                }}
              >
                Return to Login
              </Button>
            </VStack>
          )}
          </>

          <VStack spacing={4} pt={4}>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="sm">
              Don't have an account?{' '}
              <Link
                color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
                href="/login"
                _hover={{ 
                  textDecoration: 'underline',
                  color: colorMode === 'light' ? 'blue.600' : 'blue.200'
                }}
              >
                Sign Up
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
        </VStack>
      </Container>
    </Box>
  );
}

export default ResetPassword;