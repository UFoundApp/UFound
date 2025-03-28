import { useState } from "react";
import axios from "axios";
import {
  VStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

function EmailInput({ onSuccess, resetPasswordState }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // if (!email.endsWith("@mail.utoronto.ca")) {
    //   setMessage("Only @mail.utoronto.ca emails are allowed.");
    //   return;
    // }

    setLoading(true);
    try {
      if (resetPasswordState) {
        const response = await axios.post("http://127.0.0.1:8000/auth/verify-user-exists", { email });
        console.log("User verification response:", response.data);
        if (response.data.exists) {
          setMessage("");
        } else {
          setMessage("This email is not registered.");
          setLoading(false);
          return;
        }
      } 

      console.log("Sending verification code to:", email);
      const response = await axios.post("http://127.0.0.1:8000/auth/send-verification-code", { email });
      console.log("Verification code response:", response.data);
      
      if (response.data.message === "Verification code sent") {
        setMessage("Verification code sent! Please check your email.");
        onSuccess(email);
      } else {
        setMessage("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error in email verification:", error);
      setMessage(error.response?.data?.detail || "Failed to send verification email.");
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

