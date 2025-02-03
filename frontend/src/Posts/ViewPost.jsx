import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  Divider,
  Flex,
  Spinner,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { FaRegThumbsUp, FaCommentAlt } from 'react-icons/fa';

const ViewPost = ({ postId }) => {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);

  const postIdTemp = "67a032e3d18a7a81a01a1a3a";

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/posts/${postIdTemp}/`);
        setPost(response.data);
        setLikes(response.data.likes || 0);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postIdTemp]);

  const handleLike = async () => {
    setLikes((prev) => prev + 1);
    await axios.post(`http://localhost:8000/api/posts/${postIdTemp}/like`);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const newComment = { content: comment, author: "Anonymous" };
    setPost((prev) => ({ ...prev, comments: [...prev.comments, newComment] }));
    setComment('');
    await axios.post(`http://localhost:8000/api/posts/${postIdTemp}/comment`, newComment);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md" mt={8}>
      <Text fontSize="sm" color="gray.500" mb={2}>
        {post.author} • {new Date(post.created_at).toLocaleDateString()}
      </Text>
      <Heading as="h1" size="lg" mb={3}>
        {post.title}
      </Heading>
      <Text fontSize="lg" mb={4}>
        {post.content}
      </Text>

      <HStack spacing={4} mb={6}>
        <Button leftIcon={<FaRegThumbsUp />} onClick={handleLike}>
          {likes} Likes
        </Button>
        <Button leftIcon={<FaCommentAlt />}>
          {post.comments.length} Comments
        </Button>
      </HStack>

      <Divider my={4} />

      <Heading as="h2" size="md" mb={4}>
        Comments
      </Heading>
      <VStack align="stretch" spacing={3}>
        {post.comments.length > 0 ? (
          post.comments.map((c, index) => (
            <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
              <Text fontSize="md">{c.content}</Text>
              <Text fontSize="sm" color="gray.500">By {c.author}</Text>
            </Box>
          ))
        ) : (
          <Text fontStyle="italic" color="gray.500">Be the first to add a comment.</Text>
        )}
      </VStack>

      <HStack mt={4}>
        <Input
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <IconButton icon={<FaCommentAlt />} onClick={handleComment} aria-label="Add Comment" />
      </HStack>
    </Box>
  );
};

export default ViewPost;