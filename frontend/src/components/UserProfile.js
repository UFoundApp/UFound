// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, Input, Textarea, Button, Text, Flex } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateStoredUsername } from './AuthPageUtil';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';

function UserProfile() {
  const { username } = useParams(); // username from URL
  const navigate = useNavigate();
  
  // State for current signed-in user
  const [currentUser, setCurrentUser] = useState(null);
  
  // State for profile data (for the profile being viewed)
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    posts: []
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, [username, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/profile/${username}`);
        setProfile({
          username: response.data.username || '',
          bio: response.data.bio || '',
          posts: response.data.posts || []
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Error loading profile');
      }
    };
    fetchProfile();
  }, [username]);

  // Handle saving profile changes (only for own profile)
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8000/api/profile/${username}`, profile);
      setMessage('Profile updated successfully');
      
      // If the username was changed, update stored username and navigate to the new URL
      if (profile.username !== username) {
        updateStoredUsername(profile.username);
        navigate(`/profile/${profile.username}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error updating profile');
    }
  };

  const isOwnProfile = currentUser?.username === username;

  return (
    <Flex flex="1">
      {/* Left Sidebar */}
      <Box
        as="aside"
        width={{ base: '0', md: '20%' }}
        display={{ base: 'none', md: 'block' }}
        bg="gray.50"
        height="calc(100vh - 60px)"
        position="fixed"
        left="0"
      >
        <LeftSidebar />
      </Box>

      {/* Main Content */}
      <Box 
        flex="1"
        bg="white"
        ml={{ base: 0, md: '20%' }}
        mr={{ base: 0, md: '20%' }}
        overflowY="scroll"
        minH="calc(100vh - 75px)"
      >
        <Box p={4} maxW="800px" mx="auto">
          <VStack spacing={4} align="stretch">
            {isOwnProfile ? (
              // Editable profile for the current user
              <>
                <Heading size="lg" mb={2}>Your Profile</Heading>
                {message && (
                  <Text color={message.includes('Error') ? 'red.500' : 'green.500'}>
                    {message}
                  </Text>
                )}
                <Text mb={2}>Username</Text>
                <Input
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Username"
                />
                <Text mb={2}>Bio</Text>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell other users about yourself"
                  h="150px"
                />
                <Button colorScheme="blue" onClick={handleSave} w="100%">
                  Save
                </Button>
              </>
            ) : (
              // Read-only view
              <>
                <Heading mb={4}>{profile.username}'s Profile</Heading>
                <Box p={6} borderWidth="1px" borderRadius="lg" bg="gray.50">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    About {profile.username}
                  </Text>
                  <Text>
                    {profile.bio || "This user hasn't written a bio yet."}
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Right Sidebar */}
      <Box
        as="aside"
        width={{ base: '0', md: '20%' }}
        display={{ base: 'none', md: 'block' }}
        bg="gray.50"
        height="calc(100vh - 60px)"
        position="fixed"
        right="0"
      >
        <Box p={4} width="100%" overflowY="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold" color="gray.700">
              {profile.username}'s RECENT POSTS
            </Text>
          </Flex>
          <Box bg="white" borderRadius="xl" boxShadow="sm" p={3} border="1px" borderColor="gray.200">
            <VStack spacing={2} align="stretch">
              {profile.posts && profile.posts.length > 0 ? (
                profile.posts.map((post) => (
                  <Flex 
                    key={post._id}
                    _hover={{ bg: 'gray.100' }}
                    p={2}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => navigate(`/view-post/${post._id}`)}
                  >
                    <Text color="gray.700" fontSize="sm">
                      {post.title}
                    </Text>
                  </Flex>
                ))
              ) : (
                <Text color="gray.500" fontSize="sm" p={2}>
                  No posts yet
                </Text>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default UserProfile;
