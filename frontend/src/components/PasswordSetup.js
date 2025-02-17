import { useState } from "react";
import axios from "axios";
import {
  VStack,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

function PasswordSetup({ email, onSuccess, resetPasswordState }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username && !resetPasswordState) {
      setMessage("Username is required.");
      return;
    }
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
      if (resetPasswordState) {
        // Password Reset Flow
        const response = await axios.post("http://127.0.0.1:8000/auth/update-password", {
          email: email,
          password: password,
          confirm_password: confirmPassword
        });

        if (response.data.message === "Password updated successfully") {
          setMessage("✅ Password updated! Redirecting...");
          setTimeout(() => onSuccess(), 1000);
        } else {
          setMessage("⚠️ Failed to update password. Try again.");
        }
      } else {
        // User Registration Flow
        const response = await axios.post("http://127.0.0.1:8000/auth/register", {
          email,
          username,
          password,
          confirm_password: confirmPassword
        });

        if (response.data.message === "User registered successfully") {
          setMessage("🎉 Registration successful! Redirecting...");
          setTimeout(() => onSuccess(), 1000);
        } else {
          setMessage("⚠️ Registration failed. Please try again.");
        }
      }
    } catch (error) {

      console.error("Error:", error.response?.data); // Debugging log

      // Ensure error message is a string before setting state
      const errorMessage = error.response?.data?.detail;

      // If errorMessage is an object, convert it to a string
      const formattedMessage = typeof errorMessage === "string" 
        ? errorMessage 
        : JSON.stringify(errorMessage);
        
      // Handle different errors based on the flow
      if (resetPasswordState) {
        setMessage(formattedMessage || "Error updating password. Please try again.");
      } else {
        setMessage(formattedMessage || "Error registering user. Please check your details.");
      }
    }

    setLoading(false);
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} w="100%">
      {!resetPasswordState && (
        <VStack align="stretch" w="100%" spacing={2}>
          <Text fontSize="sm" fontWeight="medium">Username</Text>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            size="lg"
            required
          />
        </VStack>
      )}
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
        loadingText={resetPasswordState ? "Updating..." : "Registering..."}
        mt={4}
      >
        {resetPasswordState ? "Update Password" : "Register"}
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

