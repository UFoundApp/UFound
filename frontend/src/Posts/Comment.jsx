import React, { useState, useEffect } from "react";
import { Box, HStack, Input, Button, Text, Flex, VStack } from "@chakra-ui/react";
import { FaReply, FaHeart, FaRegHeart } from "react-icons/fa";
import { getUser } from "../components/AuthPageUtil";
import { Link } from 'react-router-dom';
import ReportDialog from "./Reporting.jsx";
import { useColorMode } from '../theme/ColorModeContext';
import { FaTrash } from "react-icons/fa";

const Comment = ({ comment, postId, handleReply, handleLike, handleUnlike, depth, handleDelete }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [user, setUser] = useState(null);
    const { colorMode } = useColorMode();

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setUser(userData);
        }
        fetchUser();
    }, []);
    

    const hasLiked = (comment.likes ?? []).includes(user?.id);

    return (
        <Box
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            bg={colorMode === 'light' 
                ? (depth % 2 === 0 ? "gray.50" : "white")
                : (depth % 2 === 0 ? "gray.700" : "gray.600")}
            ml={depth > 0 ? 4 : 0}
            position="relative"
        >
            {/* Comment Header */}
            <Flex align="center" mb={2} justify="space-between">
                <Flex align="center">
                    <Link to={`/profile/${comment.author_name}`}>
                        <Text 
                            fontSize="sm" 
                            fontWeight="bold" 
                            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                            _hover={{ 
                                textDecoration: "underline", 
                                color: colorMode === 'light' ? "blue.500" : "blue.300" 
                            }}
                        >
                            {comment.author_name}
                        </Text>
                    </Link>
                    <Text 
                        fontSize="xs" 
                        color={colorMode === 'light' ? 'gray.500' : 'gray.400'} 
                        ml={2}
                    >
                        {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                    {user?.id === comment.author_id && (
                    <FaTrash 
                        color="gray" 
                        cursor="pointer" 
                        onClick={() => handleDelete(comment.id)}
                        
                        />
)}

                </Flex>

                {/* Like Button */}
                
                <HStack position="absolute" top="8px" right="8px" spacing={3}>
                    {hasLiked ? (
                        <FaHeart 
                            color={colorMode === 'light' ? 'red' : '#ff6b6b'} 
                            cursor="pointer" 
                            onClick={() => handleUnlike(comment.id)} 
                        />
                    ) : (
                        <FaRegHeart 
                            cursor="pointer" 
                            onClick={() => handleLike(comment.id)}
                            color={colorMode === 'light' ? 'gray.600' : 'gray.200'} 
                        />
                    )}
                    <Text 
                        fontSize="xs"
                        color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    >
                        {(comment.likes ?? []).length}
                    </Text>
                    <ReportDialog endpoint={`http://localhost:8000/api/posts/${postId}/comments/${comment.id}/report`} />
                </HStack>
            </Flex>

            {/* Comment Content */}
            <Text 
                fontSize="md"
                color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
            >
                {comment.content}
            </Text>

            {/* Actions: Reply Button */}
            <HStack mt={2} spacing={4} fontSize="sm">
                <Text 
                    cursor="pointer" 
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
                    _hover={{ color: colorMode === 'light' ? 'gray.700' : 'gray.200' }}
                >
                    <FaReply /> Reply
                </Text>
            </HStack>

            {/* Reply Input */}
            {showReplyInput && (
                <HStack mt={2} ml={4}>
                    <Input
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        bg={colorMode === 'light' ? 'white' : 'gray.600'}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                        _placeholder={{
                            color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                        }}
                        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                    />
                    <Button 
                        size="sm" 
                        onClick={() => { 
                            handleReply(comment.id, replyText); 
                            setReplyText(""); 
                        }}
                        bg={colorMode === 'light' ? 'white' : 'gray.600'}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                        _hover={{
                            bg: colorMode === 'light' ? 'gray.100' : 'gray.500'
                        }}
                    >
                        Reply
                    </Button>
                </HStack>
            )}

            {/* Nested Replies */}
            {comment.replies?.length > 0 && (
                <VStack align="stretch" ml={6} mt={2} spacing={2}>
                    {comment.replies.map((reply) => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            handleReply={handleReply}
                            handleLike={handleLike}
                            handleUnlike={handleUnlike}
                            handleDelete={handleDelete}
                            depth={depth + 1}
                        />
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default Comment;
