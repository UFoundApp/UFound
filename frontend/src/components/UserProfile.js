// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, Input, Textarea, Button, Text, Flex } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateStoredUsername } from './AuthPageUtil';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { useColorMode } from '../theme/ColorModeContext';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);
  const { colorMode } = useColorMode();

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
  }, [username]);

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

  const isOwnProfile = currentUser?.username === username;
  const isAdmin = currentUser?.is_admin === true;


  // Function to check if username is available
  const checkUsernameAvailability = async (newUsername) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/profile/${newUsername}`);
      return false; // Exists
    } catch (error) {
      return error.response?.status === 404; // 404 means available
    }
  };

  // Handle saving profile changes (only for own profile)
  const handleSave = async () => {
    // Check uniqueness if username is changed
    if (profile.username !== username) {
      const available = await checkUsernameAvailability(profile.username);
      if (!available) {
        setMessage("Username is already taken.");
        return;
      }
    }
  
    try {
      // Update the profile
      await axios.put(`http://localhost:8000/api/profile/${username}`, profile);
      setMessage('Profile updated successfully');
  
      // If the username was changed, update the username in comments, update storage, and navigate
      if (profile.username !== username) {
        await axios.post(
          `http://localhost:8000/api/posts/update-comments-username`,
          {
            user_id: currentUser.id,
            new_username: profile.username,
          },
          { withCredentials: true }
        );

        await axios.post(
          `http://localhost:8000/api/posts/update-author-username`,
          {
            user_id: currentUser.id,
            new_username: profile.username,
          },
          { withCredentials: true }
        );
        await axios.post(
          `http://localhost:8000/api/professors/update-reviews-author`,
          {
            user_id: currentUser.id,
            old_username: currentUser.username,
            new_username: profile.username,
          },
          { withCredentials: true }
        );
        // Update course reviews
        await axios.post(
          `http://localhost:8000/api/courses/update-reviews-author`,
          {
            user_id: currentUser.id,
            old_username: currentUser.username,
            new_username: profile.username,
          },
          { withCredentials: true }
        );
  
        updateStoredUsername(profile.username);
        navigate(`/profile/${profile.username}`);
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error updating profile');
    }
  };
  

  return (
    <Flex flex="1" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
      <Box 
        as="aside" 
        width={{ base: '0', md: '25%' }} 
        display={{ base: 'none', md: 'block' }} 
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} 
        height="calc(100vh - 60px)" 
        position="fixed" 
        left="0"
      >
        <Box width="80%" ml="auto"><LeftSidebar /></Box>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        ml={{ base: 0, md: '25%' }}
        mr={{ base: 0, md: '25%' }}
        overflowY="scroll"
        minH="calc(100vh - 75px)"
      >
        <Box p={4} maxW="800px" mx="auto">
          <VStack spacing={4} align="stretch">
            {isOwnProfile ? (
              <>
                <Heading size="lg" mb={2} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Your Profile</Heading>
                {message && (
                  <Text color={
                    message.includes('Error') || message.includes('taken')
                      ? 'red.500'
                      : 'green.500'
                  }>
                    {message}
                  </Text>
                )}
                <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>Username</Text>
                <Input 
                  value={profile.username} 
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })} 
                  placeholder="Username" 
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                />
                <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>Bio</Text>
                <Textarea 
                  value={profile.bio} 
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                  placeholder="Tell other users about yourself" 
                  h="150px"
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                />
                <Button 
                  colorScheme="blue" 
                  onClick={handleSave} 
                  w="100%"
                  bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                  color="white"
                  _hover={{
                    bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                  }}
                >
                  Save
                </Button>

                {/* UofT Email Upgrade */}
                {currentUser && !currentUser.is_uoft && (
                  <Box 
                    mt={6} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                  >
                    <Text 
                      fontWeight="semibold" 
                      mb={2}
                      color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    >
                      Upgrade to UofT Email
                    </Text>
                    <Text 
                      fontSize="sm" 
                      color={colorMode === 'light' ? 'gray.600' : 'gray.300'} 
                      mb={2}
                    >
                      Your current email: <strong>{currentUser.email}</strong>
                    </Text>

                    {!verificationSent ? (
                      <>
                        <Input
                          placeholder="Enter your UofT email (e.g. you@mail.utoronto.ca)"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          mb={2}
                          bg={colorMode === 'light' ? 'white' : 'gray.600'}
                          color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                        />
                        <Button
                          colorScheme="blue"
                          onClick={async () => {
                            try {
                              const res = await axios.post("http://localhost:8000/auth/send-verification-code", {
                                email: newEmail,
                              });
                              setVerificationSent(true);
                              setMessage(res.data.message);
                            } catch (err) {
                              setMessage(err.response?.data?.detail || "Failed to send verification code");
                            }
                          }}
                          isDisabled={!newEmail.endsWith("@mail.utoronto.ca")}
                          bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                          color="white"
                          _hover={{
                            bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                          }}
                        >
                          Send Verification Code
                        </Button>
                      </>
                    ) : !emailUpdated ? (
                      <>
                        <Input
                          placeholder="Enter the 6-digit verification code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          mb={2}
                          bg={colorMode === 'light' ? 'white' : 'gray.600'}
                          color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                        />
                        <Button
                          colorScheme="green"
                          onClick={async () => {
                            try {
                              await axios.post("http://localhost:8000/auth/verify-code", {
                                email: newEmail,
                                code,
                              });

                              await axios.post("http://localhost:8000/auth/update-email-after-verification", {
                                current_email: currentUser.email,
                                new_email: newEmail,
                              });

                              setEmailUpdated(true);
                              setMessage("Email successfully updated!");
                              setTimeout(() => window.location.reload(), 1500);
                            } catch (err) {
                              setMessage(err.response?.data?.detail || "Verification failed");
                            }
                          }}
                          bg={colorMode === 'light' ? 'green.500' : 'green.400'}
                          color="white"
                          _hover={{
                            bg: colorMode === 'light' ? 'green.600' : 'green.500'
                          }}
                        >
                          Confirm & Update Email
                        </Button>
                      </>
                    ) : (
                      <Text color="green.500">Your email has been upgraded!</Text>
                    )}
                  </Box>
                )}

                {isOwnProfile && currentUser?.is_admin && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    variant="solid"
                    fontWeight="bold"
                    fontSize="lg"
                    boxShadow="md"
                    _hover={{ bg: colorMode === 'light' ? "green.600" : "green.500", transform: "scale(1.03)" }}
                    mt={6}
                    onClick={() => navigate("/admin")}
                    w="100%"
                    bg={colorMode === 'light' ? 'green.500' : 'green.400'}
                    color="white"
                  >
                    Go to Admin Panel
                  </Button>
                )}

              </>
            ) : (
              <>
                <Heading mb={4} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>{profile.username}'s Profile</Heading>
                <Box 
                  p={6} 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                >
                  <Text 
                    fontSize="lg" 
                    fontWeight="bold" 
                    mb={2}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                  >
                    About {profile.username}
                  </Text>
                  <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
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
        width={{ base: '0', md: '25%' }}
        display={{ base: 'none', md: 'block' }}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        height="calc(100vh - 60px)"
        position="fixed"
        right="0"
      >
        <Box
          bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
          height="85vh"
          p={4}
          width="100%"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colorMode === 'light' ? 'gray.200' : 'gray.600',
              borderRadius: '24px',
            },
          }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text 
              fontWeight="bold" 
              color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
            >
              {profile.username}'s RECENT POSTS
            </Text>
          </Flex>

          <Box 
            bg={colorMode === 'light' ? 'white' : 'gray.700'} 
            borderRadius="xl" 
            boxShadow="sm" 
            p={3} 
            border="1px" 
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          >
            <VStack spacing={2} align="stretch">
              {profile.posts.map((post) => (
                <Flex
                  key={post._id}
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.600' }}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => navigate(`/view-post/${post._id}`)}
                >
                  <FontAwesomeIcon
                    icon={faComments}
                    color={colorMode === 'light' ? '#4A5568' : '#A0AEC0'}
                    size="lg"
                    style={{ marginTop: '4px' }}
                  />
                  <Box ml={3}>
                    <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                      {post.title}
                    </Text>
                    <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'} fontSize="xs" noOfLines={2}>
                      {post.content}
                    </Text>
                    <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} fontSize="xs" mt={1}>
                      {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
                    </Text>
                  </Box>
                </Flex>
              ))}
              {profile.posts.length === 0 && (
                <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} fontSize="sm" p={2}>
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
