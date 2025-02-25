// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Input,
  Textarea,
  Button,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateStoredUsername } from './AuthPageUtil';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    posts: []
  });

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

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8000/api/profile/${username}`, profile);
      setMessage('Profile updated successfully');
      
      if (profile.username !== username && isOwnProfile) {
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
      {/* Left Sidebar - Fixed */}
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

      {/* Main Content - Center aligned with margins for sidebars */}
      <Box 
        flex="1"
        bg="white"
        ml={{ base: 0, md: '20%' }}
        mr={{ base: 0, md: '20%' }}
        overflowY="scroll"
        minH="calc(100vh - 75px)"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.200',
            borderRadius: '24px',
          },
        }}
      >
        <Box p={4} maxW="800px" mx="auto">
          <VStack spacing={4} align="stretch">
            {isOwnProfile ? (
              // Show editable profile for own profile
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
              // Show read-only profile for other users
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

      {/* Right Sidebar - Fixed */}
      <Box
        as="aside"
        width={{ base: '0', md: '20%' }}
        display={{ base: 'none', md: 'block' }}
        bg="gray.50"
        height="calc(100vh - 60px)"
        position="fixed"
        right="0"
      >
        <Box
          bg="gray.50"
          p={4}
          width="100%"
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold" color="gray.700">
              {profile.username}'s RECENT POSTS
            </Text>
          </Flex>

          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={3}
            border="1px"
            borderColor="gray.200"
          >
            <VStack spacing={2} align="stretch">
              {profile.posts.map((post) => (
                <Flex 
                  key={post._id}
                  _hover={{ bg: 'gray.100' }}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => navigate(`/view-post/${post._id}`)}
                >
                  <FontAwesomeIcon 
                    icon={faComments} 
                    color="gray.600" 
                    size="lg" 
                    style={{ marginTop: '4px' }} 
                  />
                  <Box ml={3}>
                    <Text color="gray.700" fontSize="sm">
                      {post.title}
                    </Text>
                    <Text color="gray.600" fontSize="xs" noOfLines={2}>
                      {post.content}
                    </Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
                    </Text>
                  </Box>
                </Flex>
              ))}

              {profile.posts.length === 0 && (
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