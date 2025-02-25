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
import { FaRegThumbsUp, FaThumbsDown, FaCommentAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import CommentsSection from './CommentsSection.jsx';

const ViewPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/posts/${id}/`);
                setPost(response.data);
                setLikes(response.data.likes.length);

                const user = getUser();
                if (user && response.data.likes.includes(user.id)) {
                    setHasLiked(true);
                }
            } catch (error) {
                setMessage("Failed to load post.");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleLike = async () => {
        const user = getUser();
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
            await axios.post(`http://localhost:8000/api/posts/${id}/like?user_id=${user.id}`);
            setLikes((prev) => prev + 1);
            setHasLiked(true);
            setMessage("You liked this post!");
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
        const user = getUser();
        if (!user || !user.id) {
            setMessage("You must be logged in to unlike a post.");
            setIsError(true);
            return;
        }

        try {
            setIsProcessing(true);
            await axios.post(`http://localhost:8000/api/posts/${id}/unlike?user_id=${user.id}`);
            setLikes((prev) => prev - 1);
            setHasLiked(false);
            setMessage("You unliked this post.");
            setIsError(false);
        } catch (error) {
            setMessage("Failed to unlike post.");
            setIsError(true);
        } finally {
            setIsProcessing(false);
            setTimeout(() => setMessage(""), 3000);
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
                    {post.comments.length} Comments
                </Button>
            </HStack>

            {/* Comments Section */}
            <CommentsSection postId={id} />
        </Box>
    );
};

export default ViewPost;
