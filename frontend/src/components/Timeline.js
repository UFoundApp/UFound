import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Timeline = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('http://localhost:8000/api/posts'); // Adjust URL as needed
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        // Sort posts from most recent to least recent
        const sortedPosts = data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
    fetchPosts();
  }, []);

  return (
      <Box>
        <Text fontSize="xl" fontWeight="bold" color="primary">
          Timeline
        </Text>
        {posts.map((post) => (
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

export default Timeline;