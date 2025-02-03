import { useState } from "react";
import axios from "axios";
import {
  VStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

function PasswordSetup({ email, onSuccess, resetPasswordState }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate input
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // First verify if the password meets requirements
      const checkResponse = await axios.post("http://127.0.0.1:8000/auth/check-password", { 
        email, 
        new_password: password 
      });

      if (!checkResponse.data.status) {
        setMessage("Password is invalid. Please choose a different password.");
        setLoading(false);
        return;
      }

      // If password is valid, proceed with update
      const updateResponse = await axios.post("http://127.0.0.1:8000/auth/update-password", {
        email: email,
        new_password: password,
        confirm_new_password: confirmPassword
      });

      console.log('Update Response:', updateResponse.data); // Debug log

      if (updateResponse.data.message) {
        setMessage("Password updated successfully!");
        setTimeout(() => onSuccess(), 1000);
      } else {
        setMessage("Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error('Error details:', error.response?.data); // Debug log
      const errorMessage = error.response?.data?.detail;
      setMessage(typeof errorMessage === 'string' 
        ? errorMessage 
        : "Failed to update password. Please try again.");
    }

    setLoading(false);
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="100%">
      <VStack align="stretch" w="100%" spacing={2}>
        <Text fontSize="sm" fontWeight="medium">New Password</Text>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          size="lg"
          required
        />
      </VStack>

      <VStack align="stretch" w="100%" spacing={2}>
        <Text fontSize="sm" fontWeight="medium">Confirm Password</Text>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
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
        loadingText="Updating..."
        mt={4}
      >
        Update Password
      </Button>

      {message && (
        <Text 
          color={message.includes("success") ? "green.500" : "red.500"} 
          fontSize="sm" 
          textAlign="center"
        >
          {message}
        </Text>
      )}
    </VStack>
  );
}

export default PasswordSetup;

