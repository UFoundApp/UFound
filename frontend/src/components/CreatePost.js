import { useEffect, useState } from "react";
import { VStack, Input, Textarea, Button, Box, Text } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from './AuthPageUtil';
import { For, HStack, Switch } from "@chakra-ui/react"
import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';
import { useColorMode } from '../theme/ColorModeContext';

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [author, setAuthor] = useState("")
  const [anon, setAnon] = useState(false)
  const { colorMode } = useColorMode();

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
    <Box 
      maxW="600px" 
      mx="auto" 
      mt={10} 
      p={6} 
      bg={colorMode === 'light' ? 'white' : 'gray.700'} 
      borderRadius="lg" 
      boxShadow="lg"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      borderWidth="1px"
    >
      <Text 
        fontSize="2xl" 
        mb={4}
        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
      >
        Create a Post
      </Text>
      <HStack gap="8" mb={4}>
        <Switch.Root 
          key={"lg"} 
          size={"lg"}
          checked={anon}
          onCheckedChange={(e) => setAnon(e.checked)}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>
            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'}>
              Post Anonymously
            </Text>
          </Switch.Label>
        </Switch.Root>
      </HStack>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>

          <Input 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            bg={colorMode === 'light' ? 'white' : 'gray.600'}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
            _placeholder={{
              color: colorMode === 'light' ? 'gray.400' : 'gray.300'
            }}
          />
          <Textarea 
            placeholder="What's on your mind?" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
            bg={colorMode === 'light' ? 'white' : 'gray.600'}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
            _placeholder={{
              color: colorMode === 'light' ? 'gray.400' : 'gray.300'
            }}
          />
          <Button 
            type="submit" 
            colorScheme="blue" 
            loading={loading}
            bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
            color="white"
            _hover={{
              bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
            }}
          >
            Post
          </Button>
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