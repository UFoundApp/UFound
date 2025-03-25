import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Spinner, VStack } from '@chakra-ui/react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from './LeftSidebar';  // ✅ Import Sidebar

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const [posts, setPosts] = useState({ posts: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            async function fetchResults() {
                try {
                    let response;
                    if (type === "posts") {
                        response = await axios.get(`http://127.0.0.1:8000/api/search/posts`, { params: { query } });
                    } else if (type === "professors") {
                        response = await axios.get(`http://127.0.0.1:8000/api/search/professors`, { params: { query } });
                    } else if (type === "courses") {
                        response = await axios.get(`http://127.0.0.1:8000/api/search/courses`, { params: { query } });
                    }
                    setPosts(response?.data || {});
                } catch (error) {
                    console.error('Error fetching search results:', error);
                } finally {
                    setLoading(false);
                }
            }
            fetchResults();
        }
    }, [query, type]);

    return (
        <Flex flex="1" bg="gray.50">
            {/* Left Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                left="0"
            >
                <Box width="80%" ml="auto">
                    <LeftSidebar />  {/* ✅ Adds the search bar */}
                </Box>
            </Box>

            {/* Main Content - Search Results */}
            <Box 
                flex="1"
                ml={{ base: 0, md: '25%' }}
                mr={{ base: 0, md: '25%' }}
                bg="gray.50"
                minH="calc(100vh - 60px)"
            >
                <Box p={4} maxW="900px" mx="auto" bg="gray.50">
                    {loading ? (
                        <Flex justify="center" align="center" minH="200px">
                            <VStack spacing={4}>
                                <Spinner
                                    thickness="4px"
                                    speed="0.65s"
                                    emptyColor="gray.200"
                                    color="blue.500"
                                    size="xl"
                                />
                                <Text color="gray.500">Searching for "{query}"...</Text>
                            </VStack>
                        </Flex>
                    ) : (
                        <Text fontSize="xl" fontWeight="bold">Search Results:</Text>
                    )}

                    {type === "posts" && posts.posts?.map((post) => (
                        <Link key={post._id} to={`/view-post/${post._id}`}>
                            <Box border="1px solid" bg='white' borderColor="gray.200" p={4} mt={4} borderRadius="md" _hover={{ cursor: 'pointer', backgroundColor: 'gray.100' }}>
                                <Text fontWeight="bold">{post.title}</Text>
                                <Text mt={2}>{post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}</Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>Posted on {new Date(post.created_at).toLocaleString()}</Text>
                            </Box>
                        </Link>
                    ))}

                    {type === "professors" && posts.professors?.map((professor) => (
                        <Link key={professor._id} to={`/professors/${professor._id}`}>
                            <Box border="1px solid" bg='white' borderColor="gray.200" p={4} mt={4} borderRadius="md" _hover={{ cursor: 'pointer', backgroundColor: 'gray.100' }}>
                                <Text fontWeight="bold">{professor.name}</Text>
                                <Text mt={2}>{professor.department}</Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>Rating: ⭐ {professor.ratings ? professor.ratings.toFixed(1) : "N/A"}/5</Text>
                                <Text fontSize="sm" color="gray.500">Current Courses: {professor.current_courses.length}</Text>
                            </Box>
                        </Link>
                    ))}

                    {type === "courses" && posts.courses?.map((course) => (
                        <Link key={course._id} to={`/course/${course._id}`}>
                            <Box border="1px solid" bg='white' borderColor="gray.200" p={4} mt={4} borderRadius="md" _hover={{ cursor: 'pointer', backgroundColor: 'gray.100' }}>
                                <Text fontWeight="bold">{course.title}</Text>
                                <Text mt={2}>{course.department}</Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>{course.description}</Text>
                                <Text fontSize="sm" color="gray.500">{course.professor}</Text>
                            </Box>
                        </Link>
                    ))}
                </Box>
            </Box>

            {/* Right Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                right="0"
            >
                <Box width="80%" mr="auto">
                    {/* Right sidebar content */}
                </Box>
            </Box>
        </Flex>
    );
};

export default SearchResults;
