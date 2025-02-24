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
    IconButton
} from '@chakra-ui/react';
import { FaRegThumbsUp, FaThumbsDown, FaCommentAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';

const ViewPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/posts/${id}/`);
                setPost(response.data);
                setLikes(response.data.likes.length);

                // Check if the user has already liked the post
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

    const handleComment = async () => {
        if (!comment.trim()) {
            setMessage("Comment cannot be empty.");
            setIsError(true);
            return;
        }

        const newComment = { content: comment, author: "Anonymous" };

        try {
            setIsCommenting(true);
            await axios.post(`http://localhost:8000/api/posts/${id}/comment`, newComment);

            setPost((prev) => ({
                ...prev,
                comments: [...prev.comments, newComment]
            }));
            setComment('');
            setMessage("Your comment was posted successfully!");
            setIsError(false);
        } catch (error) {
            setMessage("Failed to post comment.");
            setIsError(true);
        } finally {
            setIsCommenting(false);
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
                    <Text fontStyle="italic" color="gray.500">
                        Be the first to add a comment.
                    </Text>
                )}
            </VStack>

            <HStack mt={4}>
                <Input
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    isDisabled={isCommenting}
                />
                <IconButton
                    icon={<FaCommentAlt />}
                    onClick={handleComment}
                    aria-label="Add Comment"
                    isLoading={isCommenting}
                />
            </HStack>
        </Box>
    );
};

export default ViewPost;
