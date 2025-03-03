import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [posts, setPosts] = useState({ posts: [], reviews: [] });

    console.log("SearchResults sees:", query); // Debugging log

    useEffect(() => {
        if (query) {
            async function fetchResults() {
                try {
                    console.log("Fetching results from:", `http://127.0.0.1:8000/api/search?q=${query}`); // Debugging log
                    const response = await axios.get(`http://127.0.0.1:8000/api/search`, { params: { query: query } });
                    
                    
                    console.log("API Response Data:", response.data); // Debugging log
                    setPosts(response.data);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                }
            }
            fetchResults();
        }
    }, [query]);

  return (
      <Box>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="primary">
            Search Results
          </Text>
        </Flex>
        {posts.posts?.map((post) => (
            <Link key={post._id} to={`/view-post/${post._id}`}>
              <Box
                  border="1px solid"
                  borderColor="gray.200"
                  p={4}
                  mt={4}
                  borderRadius="md"
                  _hover={{ cursor: 'pointer', backgroundColor: 'gray.100' }}
              >
                <Text fontWeight="bold">{post.title}</Text>
                <Text mt={2}>
                  {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
                </Text>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Posted on {new Date(post.created_at).toLocaleString()}
                </Text>
              </Box>
            </Link>
        ))}
      </Box>
  );
};

export default SearchResults;
