import { useState, useEffect } from "react";
import { VStack, Input, Textarea, Button, Box, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from './AuthPageUtil';
import { For, HStack, Switch } from "@chakra-ui/react"


function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [anon, setAnon] = useState(false);
  const [author, setAuthor] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8000/api/posts", {
        title,
        content,
        created_at: new Date(),
        likes: [],
        comments: [],
        author_id: author.id,
        author: anon ? "Anonymous" : author.username
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

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUser();
      setAuthor(fetchedUser);
    };
    fetchUser();
  }, []);

  return (
    <Box maxW="600px" mx="auto" mt={10} p={6} bg="white" borderRadius="lg" boxShadow="lg">
      <Box position={"relative"} mb={8}>
        <Text fontSize="2xl" mb={4}>Create a Post</Text>
        <HStack gap="8">

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


    </Box>
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
