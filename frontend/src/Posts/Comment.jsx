import React, { useState, useEffect } from "react";
import { Box, HStack, Input, Button, Text, Flex, VStack } from "@chakra-ui/react";
import { FaReply, FaHeart, FaRegHeart } from "react-icons/fa";
import { getUser } from "../components/AuthPageUtil";
import { Link } from 'react-router-dom';
import ReportDialog from "./Reporting.jsx";
import { FaTrash } from "react-icons/fa";

const Comment = ({ comment, postId, handleReply, handleLike, handleUnlike, depth, handleDelete }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [user, setUser] = useState(null);

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
            borderColor="gray.200"
            bg={depth % 2 === 0 ? "gray.50" : "gray.100"} // Alternate background for nesting
            ml={depth > 0 ? 4 : 0} // Indent replies
            position="relative"
        >
            {/* Comment Header */}
            <Flex align="center" mb={2} justify="space-between">
                <Flex align="center">
                <Link to={`/profile/${comment.author_name}`}>
                    <Text fontSize="sm" fontWeight="bold" _hover={{ textDecoration: "underline", color: "blue.500" }}>
                        {comment.author_name}
                    </Text>
                    </Link>
                    <Text fontSize="xs" color="gray.500" ml={2}>
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
  {/* ❤️ Like icon */}
  {hasLiked ? (
    <FaHeart color="red" cursor="pointer" onClick={() => handleUnlike(comment.id)} />
  ) : (
    <FaRegHeart cursor="pointer" onClick={() => handleLike(comment.id)} />
  )}
  <Text fontSize="xs">{(comment.likes ?? []).length}</Text>

  {/* 🏴 Report button */}
  <ReportDialog endpoint={`http://localhost:8000/api/posts/${postId}/comments/${comment.id}/report`} />
</HStack>
            </Flex>

            {/* Comment Content */}
            <Text fontSize="md">{comment.content}</Text>

            {/* Actions: Reply Button */}
            <HStack mt={2} spacing={4} fontSize="sm" color="gray.500">
                <Text cursor="pointer" onClick={() => setShowReplyInput(!showReplyInput)}>
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
                    />
                    <Button size="sm" onClick={() => { handleReply(comment.id, replyText); setReplyText(""); }}>
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
