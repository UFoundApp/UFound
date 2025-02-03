import { useState } from "react";
import axios from "axios";
import {
  VStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

function VerifyCode({ email, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (code.length !== 6 || isNaN(code)) {
      setMessage("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/verify-code", {
        email,
        code,
      });
      setMessage(response.data.message);
      onSuccess();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Invalid or expired verification code.");
    }

    setLoading(false);
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="100%">
      <VStack align="stretch" w="100%" spacing={2}>
        <Text fontSize="sm" fontWeight="medium">Verification Code</Text>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          size="lg"
          maxLength={6}
          textAlign="center"
          letterSpacing="0.5em"
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
        loadingText="Verifying..."
        mt={4}
      >
        Verify Code
      </Button>

      {message && (
        <Text color="red.500" fontSize="sm" textAlign="center">
          {message}
        </Text>
      )}
    </VStack>
  );
}

export default VerifyCode;
