// src/components/RightSidebar.js
import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Flex, Spinner } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faComments,
    faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { useColorMode } from '../theme/ColorModeContext';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
    const { colorMode } = useColorMode();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/posts');
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                
                // Sort posts by number of likes (descending)
                const sortedPosts = data.sort((a, b) => 
                    (b.likes?.length || 0) - (a.likes?.length || 0)
                ).slice(0, 12); // Get top 12 posts
                
                setPosts(sortedPosts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);
    
    return (
        <Box
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            height="85vh"
            p={4}
            width="100%"
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                    display: 'none',
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
                    TRENDING
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
                {loading ? (
                    <Flex justify="center" p={4}>
                        <Spinner />
                    </Flex>
                ) : (
                    <VStack spacing={2} align="stretch">
                        {posts.map((post) => (
                            <Flex 
                                key={post._id}
                                as={Link}
                                to={`/view-post/${post._id}`}
                                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                                p={2}
                                borderRadius="md"
                                cursor="pointer"
                            >
                                <FontAwesomeIcon 
                                    icon={faComments} 
                                    color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} 
                                    size="lg" 
                                    style={{ marginTop: '4px' }} 
                                />
                                <Box ml={3}>
                                    <Text 
                                        color={colorMode === 'light' ? 'gray.700' : 'gray.200'} 
                                        fontSize="sm"
                                    >
                                        {post.title}
                                    </Text>
                                    <Text 
                                        color={colorMode === 'light' ? 'gray.600' : 'gray.400'} 
                                        fontSize="xs" 
                                        noOfLines={2}
                                    >
                                        {post.content.length > 100 ? `${post.content.slice(0, 100)}...` : post.content}
                                    </Text>
                                    <Text 
                                        color={colorMode === 'light' ? 'gray.500' : 'gray.500'} 
                                        fontSize="xs" 
                                        mt={1}
                                    >
                                        {post.likes?.length || 0} likes · {post.comments?.length || 0} comments
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                    </VStack>
                )}
            </Box>
        </Box>
    );
};

export default RightSidebar;