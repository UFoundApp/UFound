// src/components/ViewPost.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Heading,
    Text,
    Flex,
    Spinner,
    Button,
    HStack,
} from '@chakra-ui/react';
import { FaRegThumbsUp, FaThumbsDown, FaCommentAlt, FaEye } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import CommentsSection from './CommentsSection.jsx';
import { FaFlag } from 'react-icons/fa';
import ReportDialog from './Reporting.jsx';
import { Link } from 'react-router-dom';


const ViewPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [views, setViews] = useState(0);
    const [user, setUser] = useState(null); // Track current user


    useEffect(() => {
        // Fetch the currently logged-in user
        getUser().then((fetchedUser) => setUser(fetchedUser));
      }, []);
    

    useEffect(() => {
        let isMounted = true; // Flag to track if component is mounted

        const fetchPost = async () => {
            try {
                // First, get the post data
                const response = await axios.get(`http://localhost:8000/api/posts/${id}/`);

                if (!isMounted) return; // Don't update state if component unmounted

                setPost(response.data);
                console.log("RESPONSE: ", response.data);
                setLikes(response.data.likes.length);
                setViews(response.data.views || 0);

                const user = await getUser();
                if (user && response.data.likes.includes(user.id)) {
                    setHasLiked(true);
                }

                // Increment view count only once per session
                // Use sessionStorage to track if this post has been viewed in this session
                const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '{}');

                if (!viewedPosts[id]) {
                    // Only increment if not already viewed in this session
                    const viewResponse = await axios.post(`http://localhost:8000/api/posts/${id}/view`);

                    if (!isMounted) return; // Don't update state if component unmounted

                    setViews(viewResponse.data.views);

                    // Mark this post as viewed in this session
                    viewedPosts[id] = true;
                    sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                }
            } catch (error) {
                if (isMounted) {
                    // setMessage("Failed to load post.");
                    setIsError(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPost();

        // Cleanup function to set isMounted to false when component unmounts
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleDeletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
    
        try {
          await axios.delete(`http://localhost:8000/api/posts/${id}`, {
            withCredentials: true,
          });
          // After deletion, redirect to homepage or another page
          window.location.href = "/";
        } catch (error) {
          setMessage("Failed to delete post.");
          setIsError(true);
        }
      };

    const countTotalComments = (comments) => {
        return comments.reduce((total, comment) => {
            return total + 1 + countTotalComments(comment.replies || []);
        }, 0);
    };
    

    const handleLike = async () => {
        const user = await getUser();
        if (!user || !user.id) {
            setMessage("You must be logged in to like a post.");
            setIsError(true);
            return;
        }

        if (hasLiked) {
            await handleUnlike();
            return;
        }

        try {
            setIsProcessing(true);
            await axios.post(`http://127.0.0.1:8000/api/posts/${id}/like?user_id=${user.id}`,
                {}, {
                withCredentials: true,
            });
            setLikes((prev) => prev + 1);
            setHasLiked(true);
            setIsError(false);
        } catch (error) {
            setMessage("Failed to like post.");
            setIsError(true);
        } finally {
            setIsProcessing(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleUnlike = async () => {
        const user = await getUser();
        if (!user || !user.id) {
            setMessage("You must be logged in to unlike a post.");
            setIsError(true);
            return;
        }

        try {
            setIsProcessing(true);
            await axios.post(`http://127.0.0.1:8000/api/posts/${id}/unlike?user_id=${user.id}`,
                {}, {
                withCredentials: true,
            }
            );
            setLikes((prev) => prev - 1);
            setHasLiked(false);
            setIsError(false);
        } catch (error) {
            setMessage("Failed to unlike post.");
            setIsError(true);
        } finally {
            setIsProcessing(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleReport = async () => {
        const user = await getUser();
        if (!user || !user.id) {
            setMessage("You must be logged in to report a post.");
            setIsError(true);
            return;
        }
        try {
            await axios.post(`http://localhost:8000/api/posts/${id}/report?user_id=${user.id}`);
            setMessage("Post reported successfully.");
            setIsError(false);
        } catch (error) {
            setMessage("Failed to report post.");
            setIsError(true);
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <Box maxW="800px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md" mt={8} position="relative" >
            <Box position="absolute" top="16px" right="16px">
                <ReportDialog endpoint={`http://localhost:8000/api/posts/${id}/report`} />
            </Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
            {(post.author !== "Anonymous") ? post.author : "Anonymous"} • {new Date(post.created_at).toLocaleDateString()}
            </Text>
            <Heading as="h1" size="lg" mb={3}>
                {post.title}
            </Heading>
            <Text fontSize="lg" mb={4}>
                {post.content}
            </Text>

            {message && (
                <Text color={isError ? "red.500" : "green.500"} mb={4}>
                    {message}
                </Text>
            )}

            <HStack spacing={4} mb={6}>
                <Button
                    leftIcon={hasLiked ? <FaThumbsDown /> : <FaRegThumbsUp />}
                    onClick={handleLike}
                    isLoading={isProcessing}
                >
                    {likes} {hasLiked ? "Unlike" : "Like"}
                </Button>
                <Button leftIcon={<FaCommentAlt />}>
                {countTotalComments(post.comments)} Comments
                </Button>

                <Button leftIcon={<FaEye />} variant="ghost">
                    {views} Views
                </Button>

                {user && user.id === post.author_id && (
          <Button
            colorPalette="red"
            onClick={handleDeletePost}
          >
            Delete
          </Button>
        )}
                
            </HStack>

            {/* Comments Section */}
            <CommentsSection 
    postId={id} 
    onCommentsChange={(updatedComments) => {
        // Update the post's comments with the new value
        setPost(prevPost => ({ ...prevPost, comments: updatedComments }));
    }} 
/>
        </Box>
    );
};

export default ViewPost;
