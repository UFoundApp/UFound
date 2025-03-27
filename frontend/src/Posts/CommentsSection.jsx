import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    VStack,
    HStack,
    Box,
    Input,
    IconButton,
    Text,
    Flex,
    Spinner,
    Button
} from "@chakra-ui/react";
import { FaCommentAlt, FaReply } from "react-icons/fa";
import { getUser } from "../components/AuthPageUtil";
import Comment from "./Comment"; // Import the Comment component

const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setUser(userData);
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!postId) return;

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/posts/${postId}/comments`);
                console.log("API Response:", response.data);
                setComments(response.data.comments || []);
            } catch (error) {
                setMessage("Failed to load comments.");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    function addReplyToNestedComments(comments, parentId, newReply) {
        return comments.map((comment) => {
            // If this is the parent comment, append the new reply
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [...comment.replies, newReply],
                };
            }
            // Otherwise, recursively look in its replies
            return {
                ...comment,
                replies: addReplyToNestedComments(comment.replies, parentId, newReply),
            };
        });
    }


    const handleComment = async (parentId = null, replyText = null) => {
        const commentText = parentId ? replyText : comment;
        if (!user || !user.id) {
            setMessage("You must be logged in to comment.");
            setIsError(true);
            return;
        }

        if (!commentText.trim()) {
            setMessage("Comment cannot be empty.");
            setIsError(true);
            return;
        }

        try {
            setIsCommenting(true);
            const response = await axios.post(`http://localhost:8000/api/posts/${postId}/comment`, {
                author_id: user.id,
                content: commentText,
                parent_id: parentId
            });

            if (parentId) {
                setComments((prevComments) =>
                    addReplyToNestedComments(prevComments, parentId, response.data.comment)
                );
            } else {
                setComments((prevComments) => [response.data.comment, ...prevComments]);
            }

            setComment("");
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

    function updateCommentLikes(comments, commentId, userId, action) {
        return comments.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    likes: action === "like"
                        ? [...comment.likes, userId]
                        : comment.likes.filter(id => id !== userId),
                };
            }
            return { ...comment, replies: updateCommentLikes(comment.replies, commentId, userId, action) };
        });
    }

    const handleLike = async (commentId) => {
        if (!user || !user.id) {
            setMessage("You must be logged in to like a comment.");
            setIsError(true);
            return;
        }

        try {
            await axios.post(`http://localhost:8000/api/posts/${postId}/comments/${commentId}/like`, {
                user_id: user.id
            });

            // Update state
            setComments(prevComments => updateCommentLikes(prevComments, commentId, user.id, "like"));
        } catch (error) {
            setMessage("Failed to like comment.");
            setIsError(true);
        }
    };

    const handleUnlike = async (commentId) => {
        if (!user || !user.id) {
            setMessage("You must be logged in to unlike a comment.");
            setIsError(true);
            return;
        }

        try {
            await axios.post(`http://localhost:8000/api/posts/${postId}/comments/${commentId}/unlike`, {
                user_id: user.id
            });

            // Update state
            setComments(prevComments => updateCommentLikes(prevComments, commentId, user.id, "unlike"));
        } catch (error) {
            setMessage("Failed to unlike comment.");
            setIsError(true);
        }
    };



    return (
        <Box mt={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                Comments
            </Text>

            {message && (
                <Text color={isError ? "red.500" : "green.500"} mb={2}>
                    {message}
                </Text>
            )}

            {loading ? (
                <Spinner size="md" />
            ) : (
                <VStack align="stretch" spacing={3}>
                    {comments.map((c) => (
                        <Comment
                            key={c.id}
                            comment={c}
                            postId={postId}
                            handleReply={handleComment}
                            handleLike={handleLike}
                            handleUnlike={handleUnlike}
                            depth={0}
                        />
                    ))}
                </VStack>

            )}

            <HStack mt={4}>
                <Input
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    isDisabled={isCommenting}
                />
                <IconButton
                    icon={<FaCommentAlt />}
                    onClick={() => handleComment()}
                    aria-label="Add Comment"
                    isLoading={isCommenting}
                />
            </HStack>
        </Box>
    );
};

export default CommentsSection;
