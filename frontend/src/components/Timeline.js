import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, HStack, Icon, IconButton, Spacer } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaEye, FaShareAlt } from 'react-icons/fa';
import axios from 'axios';
import { getUser } from './AuthPageUtil';

import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [likeDisabled, setLikeDisabled] = useState(false);

  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUser();
      setUser(userData);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('http://localhost:8000/api/posts'); // Adjust URL as needed
        if (!response.ok) {
          showAlert("error", "surface", "Error", "Failed to fetch posts");
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        // Sort posts from most recent to least recent
        const sortedPosts = data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Ensure all posts have a views field
        const postsWithViews = sortedPosts.map(post => ({
          ...post,
          views: post.views || 0
        }));
        
        setPosts(postsWithViews);
      } catch (error) {
        showAlert("error", "surface", "Error", "Failed to fetch posts");
        console.error('Error fetching posts:', error);
      }
    }
    fetchPosts();
  }, []);

  // Format date according to requirements
  const formatDate = (dateString) => {
    // Parse UTC date from backend and force UTC interpretation
    const postDate = new Date(dateString + 'Z'); 
  
    // Convert the post date to Eastern Time (America/Toronto)
    const postDateEastern = new Date(
      postDate.toLocaleString("en-US", { timeZone: "America/Toronto" })
    );
  
    // Get the current time in Eastern Time
    const nowEastern = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
    );
  
    const diffInMs = nowEastern - postDateEastern;
  
    // Less than 1 minute => "just now"
    // if (diffInMs < 60 * 1000) {
    //   return "just now";
    // }
  
    // Less than 1 hour => "Xm"
    const diffInMinutes = Math.floor(diffInMs / (60 * 1000));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    // Less than 24 hours => "Xh"
    const diffInHours = Math.floor(diffInMs / (60 * 60 * 1000));
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
  
    // Calculate days
    const diffInDays = Math.floor(diffInHours / 24);
  
    // 1 day => "yesterday"
    if (diffInDays === 1) {
      return "yesterday";
    }
  
    // 2-6 days => "X days"
    if (diffInDays >= 2 && diffInDays <= 6) {
      return `${diffInDays} days`;
    }
  
    // Same year => "MonthName Day"
    if (postDateEastern.getFullYear() === nowEastern.getFullYear()) {
      return postDateEastern.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  
    // Different year => "MonthName Day, Year"
    return postDateEastern.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  


  const handleLike = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();

    if (likeDisabled) {
      showAlert("warning", "surface", "Please wait", "Please wait before attempting to like/unlike");
      return;
    }
    setLikeDisabled(true);

    if (!user || !user.id) {
      showAlert("error", "surface", "Error", "You must be logged in to like a post");
      setLikeDisabled(false);
      return;
    }

    try {
      const post = posts.find(p => p._id === postId);
      const hasLiked = post.likes.includes(user.id);

      if (hasLiked) {
        // Unlike
        await axios.post(
          `http://127.0.0.1:8000/api/posts/${postId}/unlike`,
          { user_id: user.id },
          { withCredentials: true }
        );
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId) {
            return { ...p, likes: p.likes.filter(id => id !== user.id) };
          }
          return p;
        }));
      } else {
        // Like
        await axios.post(
          `http://127.0.0.1:8000/api/posts/${postId}/like`,
          { user_id: user.id },
          { withCredentials: true }
        );
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId) {
            return { ...p, likes: [...p.likes, user.id] };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error("Error updating like:", error);
      showAlert("error", "surface", "Error", "Failed to update like");
    } finally {
      setTimeout(() => setLikeDisabled(false), 500);
    }
  };
  const handleShare = (e, postId) => {
    e.preventDefault(); // Prevent navigation to post
    e.stopPropagation(); // Stop event propagation
    
    // Copy the post URL to clipboard
    const postUrl = `${window.location.origin}/view-post/${postId}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        showAlert("success", "surface", "Success", "Link copied to clipboard");
      })
      .catch(err => {
        showAlert("error", "surface", "Error", "Failed to copy link");
        console.error("Failed to copy link:", err);
      });
  };

  return (
      <Box>
        <Flex justifyContent="space-between" alignItems="center">
          {/* <Text fontSize="xl" fontWeight="bold" color="primary">
            Timeline
          </Text> */}
        </Flex>
        {posts.map((post) => (
            <Box
                key={post._id}
                as={Link}
                to={`/view-post/${post._id}`}
                border="1px solid"
                borderColor="gray.200"
                p={4}
                mt={4}
                borderRadius="md"
                bg="white"
                _hover={{ cursor: 'pointer', backgroundColor: 'gray.100' }}
                minHeight="190px"
                position="relative"
                display="flex"
                flexDirection="column"
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{post.title}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(post.created_at)}
                </Text>
              </Flex>
              <Text mt={2} flex="1">
                {post.content.length > 400 ? post.content.slice(0, 450) + '...' : post.content}
              </Text>
              
              {/* Post actions bar - fixed to bottom with no border */}
              <Flex 
                mt={4}
                alignItems="center"
              >
                {/* Like button */}
                <Flex alignItems="center" onClick={(e) => handleLike(e, post._id)}>
                  <Icon 
                    as={user && post.likes.includes(user.id) ? FaHeart : FaRegHeart} 
                    color={user && post.likes.includes(user.id) ? "red.500" : "gray.500"} 
                    cursor="pointer" 
                    mr={1}
                  />
                  {post.likes.length > 0 && (
                    <Text fontSize="sm" color="gray.600">{post.likes.length}</Text>
                  )}
                </Flex>
                
                {/* Comment count */}
                <Flex alignItems="center" ml={4}>
                  <Icon as={FaComment} color="gray.500" mr={1} />
                  {post.comments.length > 0 && (
                    <Text fontSize="sm" color="gray.600">{post.comments.length}</Text>
                  )}
                </Flex>
                
                {/* Views count - always show the icon */}
                <Flex alignItems="center" ml={4}>
                  <Icon as={FaEye} color="gray.500" mr={1} />
                  <Text fontSize="sm" color="gray.600">{post.views || 0}</Text>
                </Flex>
                
                <Spacer />
                
                {/* Share button */}
                <Flex alignItems="center" ml={4} onClick={(e) => handleShare(e, post._id)} cursor="pointer">
                    <Icon as={FaShareAlt} color="gray.500" mr={1} />
                    <Text fontSize="sm" color="gray.600">Share</Text>
                </Flex>
              </Flex>
            </Box>
        ))}
      </Box>
  );
};

export default Timeline;