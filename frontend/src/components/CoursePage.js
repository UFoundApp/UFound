import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Heading,
    Text,
    Flex,
    Spinner,
    Button,
    VStack,
    HStack,
    Input,
    IconButton
} from '@chakra-ui/react';
import { FaCommentAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';

const CoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState('');
    const [isPostingReview, setIsPostingReview] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
                setCourse(response.data);
            } catch (error) {
                setMessage("Failed to load course.");
                setIsError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleAddReview = async () => {
        if (!review.trim()) {
            setMessage("Review cannot be empty.");
            setIsError(true);
            return;
        }

        const user = getUser();
        if (!user || !user.id) {
            setMessage("You must be logged in to add a review.");
            setIsError(true);
            return;
        }

        const newReview = { content: review, author: user.username || "Anonymous" };

        try {
            setIsPostingReview(true);
            await axios.post(`http://localhost:8000/api/courses/${courseId}/review`, newReview);

            setCourse((prev) => ({
                ...prev,
                reviews: [...prev.reviews, newReview]
            }));
            setReview('');
            setMessage("Your review was posted successfully!");
            setIsError(false);
        } catch (error) {
            setMessage("Failed to post review.");
            setIsError(true);
        } finally {
            setIsPostingReview(false);
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
            <Heading as="h1" size="lg" mb={3}>
                {course.title}
            </Heading>
            <Text fontSize="md" color="gray.600" mb={4}>
                {course.description}
            </Text>

            <Box borderBottom="1px solid gray" my={4} />

            {/* Course Details */}
            <Text fontSize="md" fontWeight="bold">Prerequisites:</Text>
            <Text mb={2}>{course.prerequisites || "None"}</Text>
            
            <Text fontSize="md" fontWeight="bold">Exclusions:</Text>
            <Text mb={2}>{course.exclusion || "None"}</Text>
            
            <Text fontSize="md" fontWeight="bold">Distribution:</Text>
            <Text mb={4}>{course.distribution || "N/A"}</Text>

            <Box borderBottom="1px solid gray" my={4} />

            {/* Professors Section */}
            <Heading as="h2" size="md" mb={3}>Professors</Heading>
            <VStack spacing={2} align="stretch">
                {course.professors.length > 0 ? (
                    course.professors.map((prof, index) => (
                        <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                            <Text fontWeight="bold">{prof.name}</Text>
                            <Text fontSize="sm" color="gray.500">{prof.department}</Text>
                        </Box>
                    ))
                ) : (
                    <Text fontStyle="italic" color="gray.500">No professors listed.</Text>
                )}
            </VStack>

            <Box borderBottom="1px solid gray" my={4} />

            {/* Reviews Section */}
            <Heading as="h2" size="md" mb={3}>Reviews</Heading>
            <VStack spacing={3} align="stretch">
                {course.reviews.length > 0 ? (
                    course.reviews.map((r, index) => (
                        <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                            <Text fontWeight="bold">{r.author}</Text>
                            <Text fontSize="sm" color="gray.500">{new Date(r.created_at).toLocaleString()}</Text>
                            <Text mt={2}>{r.content}</Text>
                        </Box>
                    ))
                ) : (
                    <Text fontStyle="italic" color="gray.500">Be the first to leave a review.</Text>
                )}
            </VStack>

            {/* Add Review Section */}
            <HStack mt={4}>
                <Input
                    placeholder="Write a review..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    isDisabled={isPostingReview}
                />
                <IconButton
                    icon={<FaCommentAlt />}
                    onClick={handleAddReview}
                    aria-label="Add Review"
                    isLoading={isPostingReview}
                />
            </HStack>
        </Box>
    );
};

export default CoursePage;