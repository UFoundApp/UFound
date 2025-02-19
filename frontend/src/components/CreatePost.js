import { useState } from "react";
import { VStack, Input, Textarea, Button, Box, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8000/api/posts", {
        title,
        content,
        created_at: new Date(),
        likes: 0,
        comments: [],

      });
      if (response.data) {
        setMessage("Post created successfully!");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      setMessage("Failed to create post.");
    }
    setLoading(false);
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} bg="white" borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" mb={4}>Create a Post</Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} required />
          <Button type="submit" colorScheme="blue" isLoading={loading}>Post</Button>
          {message && <Text color="green.500">{message}</Text>}
        </VStack>
      </form>
    </Box>
  );
}

export default CreatePost;
