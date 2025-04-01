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
import { useColorMode } from '../theme/ColorModeContext';

const CommentsSection = ({ postId, onCommentsChange  }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const [user, setUser] = useState(null);
    const { colorMode } = useColorMode();

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

    const removeCommentById = (comments, commentId) => {
        return comments.reduce((acc, comment) => {
          // If this comment is the one to delete, skip it
          if (comment.id === commentId) {
            return acc;
          }
          // Otherwise, if it has replies, process them recursively
          let updatedReplies = comment.replies;
          if (comment.replies && comment.replies.length > 0) {
            updatedReplies = removeCommentById(comment.replies, commentId);
          }
          // Include the comment (with its updated replies) in the accumulator
          return [...acc, { ...comment, replies: updatedReplies }];
        }, []);
      };

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

    
const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
        // Ensure commentId is a string before sending it
        const objectId = commentId.toString();

        await axios.delete(`http://127.0.0.1:8000/api/posts/${postId}/comments/${objectId}`, {
            withCredentials: true, 
        });

        // Remove deleted comment from state
        setComments(prevComments => {
            const updatedComments = removeCommentById(prevComments, commentId);
            // Call the callback to inform the parent
            if (onCommentsChange) {
                onCommentsChange(updatedComments);
            }
            return updatedComments;
        });    } catch (error) {
        console.error("Failed to delete comment:", error.response?.data || error.message);
    }
};
    

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
        const response = await axios.post(
            `http://127.0.0.1:8000/api/posts/${postId}/comment`,
            {
                author_id: user.id,
                content: commentText,
                parent_id: parentId,
            },
            {
                withCredentials: true,
            }
        );

        if (parentId) {
            setComments((prevComments) => {
                const updatedComments = addReplyToNestedComments(prevComments, parentId, response.data.comment);
                if (onCommentsChange) {
                    onCommentsChange(updatedComments);
                }
                return updatedComments;
            });
        } else {
            setComments((prevComments) => {
                const updatedComments = [response.data.comment, ...prevComments];
                if (onCommentsChange) {
                    onCommentsChange(updatedComments);
                }
                return updatedComments;
            });
        }

        setComment("");
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
            <Text 
                fontSize="lg" 
                fontWeight="bold" 
                mb={4}
                color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
            >
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
                    {comments.map((c, index) => (
                        <Comment
                            key={c.id}
                            comment={{...c, index}}
                            postId={postId}
                            handleReply={handleComment}
                            handleLike={handleLike}
                            handleUnlike={handleUnlike}
                            handleDelete={handleDelete} // ✅ Pass the delete function here
                            depth={0}
                            colorMode={colorMode}
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
                    bg={colorMode === 'light' ? 'white' : 'gray.600'}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    _placeholder={{
                        color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                    }}
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                />
                <IconButton
                    onClick={() => handleComment()}
                    aria-label="Add Comment"
                    isLoading={isCommenting}
                    bg={colorMode === 'light' ? 'white' : 'gray.600'}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    _hover={{
                        bg: colorMode === 'light' ? 'gray.100' : 'gray.500'
                    }}
                >
                    <FaCommentAlt />
                </IconButton>
            </HStack>
        </Box>
    );
};

export default CommentsSection;
