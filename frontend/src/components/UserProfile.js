// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, Input, Textarea, Button, Text, Flex } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateStoredUsername } from './AuthPageUtil';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);

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
    // check uniqueness of username
    if (profile.username !== username) {
      const available = await checkUsernameAvailability(profile.username);
      if (!available) {
        setMessage("Username is already taken.");
        return;
      }
    }

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

  return (
    <Flex flex="1">
      <Box as="aside" width={{ base: '0', md: '25%' }} display={{ base: 'none', md: 'block' }} bg="gray.50" height="calc(100vh - 60px)" position="fixed" left="0">
        <Box width="80%" ml="auto"><LeftSidebar /></Box>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        bg="gray.50"
        ml={{ base: 0, md: '25%' }}
        mr={{ base: 0, md: '25%' }}
        overflowY="scroll"
        minH="calc(100vh - 75px)"
      >
        <Box p={4} maxW="800px" mx="auto">
          <VStack spacing={4} align="stretch">
            {isOwnProfile ? (
              <>
                <Heading size="lg" mb={2}>Your Profile</Heading>
                {message && (
                  <Text color={
                    message.includes('Error') || message.includes('taken')
                      ? 'red.500'
                      : 'green.500'
                  }>                    {message}
                  </Text>
                )}
                <Text mb={2}>Username</Text>
                <Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="Username" />
                <Text mb={2}>Bio</Text>
                <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell other users about yourself" h="150px" />
                <Button colorScheme="blue" onClick={handleSave} w="100%">Save</Button>

                {/* UofT Email Upgrade */}
                {currentUser && !currentUser.is_uoft && (
                  <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                    <Text fontWeight="semibold" mb={2}>Upgrade to UofT Email</Text>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Your current email: <strong>{currentUser.email}</strong>
                    </Text>

                    {!verificationSent ? (
                      <>
                        <Input
                          placeholder="Enter your UofT email (e.g. you@mail.utoronto.ca)"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          mb={2}
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
                        >
                          Confirm & Update Email
                        </Button>
                      </>
                    ) : (
                      <Text color="green.600">Your email has been upgraded!</Text>
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
                    _hover={{ bg: "green.600", transform: "scale(1.03)" }}
                    mt={6}
                    onClick={() => navigate("/admin")}
                    w="100%"
                  >
                    Go to Admin Panel
                  </Button>
                )}

               </>
             ) : (
              <>
                <Heading mb={4}>{profile.username}'s Profile</Heading>
                <Box p={6} borderWidth="1px" borderRadius="lg" bg="gray.50">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>About {profile.username}</Text>
                  <Text>{profile.bio || "This user hasn't written a bio yet."}</Text>
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
        bg="gray.50"
        height="calc(100vh - 60px)"
        position="fixed"
        right="0"
      >
        <Box
          bg="gray.50"
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
              background: 'gray.200',
              borderRadius: '24px',
            },
          }}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold" color="gray.700">{profile.username}'s RECENT POSTS</Text>
          </Flex>

          <Box bg="white" borderRadius="xl" boxShadow="sm" p={3} border="1px" borderColor="gray.200">
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
                    <Text color="gray.700" fontSize="sm">{post.title}</Text>
                    <Text color="gray.600" fontSize="xs" noOfLines={2}>{post.content}</Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
                    </Text>
                  </Box>
                </Flex>
              ))}
              {profile.posts.length === 0 && (
                <Text color="gray.500" fontSize="sm" p={2}>No posts yet</Text>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default UserProfile;
