// src/components/Timeline.js
import React, { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';

const Timeline = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();

        // Sort posts by created_at in descending order (most recent first)
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
        <Box
          key={post._id}
          border="1px solid"
          borderColor="gray.200"
          p={4}
          mt={4}
          borderRadius="md"
        >
          <Text fontWeight="bold">{post.title}</Text>
          <Text mt={2}>{post.content}</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Posted on {new Date(post.created_at).toLocaleString()}
          </Text>
          <Text mt={2}>Likes: {post.likes}</Text>
          {post.comments && post.comments.length > 0 && (
            <Box mt={2}>
              <Text fontWeight="bold">Comments:</Text>
              {post.comments.map((comment, index) => (
                <Box key={index} ml={4} mt={1}>
                  <Text>{comment.content}</Text>
                  <Text fontSize="xs" color="gray.400">
                    - {comment.author} on{' '}
                    {new Date(comment.created_at).toLocaleString()}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Timeline;
