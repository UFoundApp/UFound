import { useState } from "react";
import axios from "axios";
import {
  VStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

import { useContext } from 'react';
import { AlertContext } from './UI/AlertContext';

function EmailInput({ onSuccess, resetPasswordState }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { showAlert } = useContext(AlertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");


    setLoading(true);
    try {
      if (resetPasswordState) {
        const response = await axios.post("http://127.0.0.1:8000/auth/verify-user-exists", { email });
        console.log("User verification response:", response.data);
        if (response.data.exists) {
          setMessage("");
        } else {
          setMessage("This email is not registered.");
          showAlert("error", "surface", "Email Error", "This email is not registered" );
          setLoading(false);
          return;
        }
      } 

      console.log("Sending verification code to:", email);
      const response = await axios.post("http://127.0.0.1:8000/auth/send-verification-code", { email });
      console.log("Verification code response:", response.data);
      
      if (response.data.message === "Verification code sent") {
        setMessage("Verification code sent! Please check your email.");
        showAlert("success", "surface", "Email Sent", "Verification code sent! Please check your email.");
        onSuccess(email);
      } else {
        setMessage("Failed to send verification code. Please try again.");
        showAlert("error", "surface", "Email Error", "Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error in email verification:", error);
      setMessage(error.response?.data?.detail || "Failed to send verification email.");
      showAlert("error", "surface", "Email Error", error.response?.data?.detail || "Failed to send verification email.");
    }
    setLoading(false);
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="100%">
      <VStack align="stretch" w="100%" spacing={2}>
        <Text fontSize="sm" fontWeight="medium">University Email</Text>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john.doe@mail.utoronto.ca"
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
        isLoading={loading}
        loadingText="Sending..."
        mt={4}
      >
        Send Code
      </Button>

      {message && (
        <Text color="red.500" fontSize="sm" textAlign="center">
          {message}
        </Text>
      )}
    </VStack>
  );
}

export default EmailInput;

