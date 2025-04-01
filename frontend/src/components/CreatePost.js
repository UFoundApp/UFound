import { useEffect, useState } from "react";
import { VStack, Input, Textarea, Button, Box, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from './AuthPageUtil';
import { For, HStack, Switch } from "@chakra-ui/react"
import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [author, setAuthor] = useState("")
  const [anon, setAnon] = useState(false)


  useEffect(() => {
    const loadUser = async () => {
      const u = await getUser();
      setUser(u);
    };
    loadUser();
  }, []);
  
  const { showAlert } = useContext(AlertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
    
      const response = await axios.post("http://127.0.01:8000/api/posts", {
        title,
        content,
        author: anon ? "Anonymous" : user.username
      }, {
        withCredentials: true,
      }
    );
      if (response.data) {
        setMessage("Post created successfully!");
        showAlert("success", "surface", "Post Created", "Post created successfully!");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      setMessage("Failed to create post.");
      showAlert("error", "surface", "Failed to create post", "You need an account to post. Sign in");
    }
    setLoading(false);
  };

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} bg="white" borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" mb={4}>Create a Post</Text>
      <HStack gap="8" mb={4}>

        <Switch.Root 
        key={"lg"} size={"lg"}
        checked={anon}
        onCheckedChange={(e) => setAnon(e.checked)}
        >
          <Switch.HiddenInput />

          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>Post Anonymously</Switch.Label>
          
        </Switch.Root>
      </HStack>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} required />
          <Button type="submit" colorScheme="blue" isLoading={loading}>Post</Button>
          {message && (
            <Text color={message.includes("Failed") ? "red.500" : "green.500"}>
              {message}
            </Text>
)}
        </VStack>
      </form>
    </Box>
  );
}

export default CreatePost;