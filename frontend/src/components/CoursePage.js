import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    Heading,
    Text,
    Flex,
    Spinner,
    VStack,
    HStack,
    Input,
    Field,
    IconButton,
    RatingGroup,
    useRatingGroup,
    Progress

} from '@chakra-ui/react';
import { FaPlusCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import dayjs from 'dayjs';

const CoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState('');
    const rating = useRatingGroup({ count: 5, defaultValue: 0 });
    const [overallRating, setOverallRating] = useState(0);
    const [allRating, setAllRating] = useState([]);
    const [isPostingReview, setIsPostingReview] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

     const fetchCourse = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            setMessage("Failed to load course.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }, [courseId]); 

    const fetchRating = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/courses/get_overall_rating/${courseId}`);
            setOverallRating(Math.round(response.data.average_rating));
            let data = response.data.rating_distribution;
            setAllRating([data["5_star"], data["4_star"], data["3_star"], data["2_star"], data["1_star"]]);
        } catch (error) {
            setMessage("Failed to load ratings.");
            setIsError(true);
        }
    }, [course]);

    useEffect(() => {
        if (!courseId) return;
        setLoading(true);
        fetchCourse();

    }, [courseId]);

    useEffect(() => {
        if (!courseId) return;
        fetchRating();

    }, [course]);


    const handleAddReview = async () => {
        if (!review.trim()) {
            //console.log("Review is empty.");
            setMessage("Review cannot be empty.");
            setIsError(true);
            return;
        }

        if (rating.value === 0) {
            //console.log("Rating is empty.");
            setMessage("Rating cannot be empty.");
            setIsError(true);
            return;
        }

        const user = getUser();
        if (!user || !user.id) {
            //console.log("User not logged in.");
            setMessage("You must be logged in to add a review.");
            setIsError(true);
            return;
        }


        const newReview = { content: review, rating: rating.value, created_at: new Date().toISOString(), author: user.username || "Anonymous" };

        console.log(newReview);
        try {
            setIsPostingReview(true);
            await axios.post(`http://localhost:8000/api/courses/${courseId}/review`, newReview);
            const response = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
            setCourse(response.data);
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

    return (
        <div>
        {loading ? (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" />
            </Flex> ) : ( 

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

                <Heading as="h2" size="md" mt={5} mb={3}>Overall Rating</Heading>
                <HStack mt={4}>
                    <RatingGroup.Root readOnly count={5} value={overallRating}  size="lg" colorPalette="orange">
                        <RatingGroup.HiddenInput />
                        <RatingGroup.Control>
                            {Array.from({ length: 5 }).map((_, index) => (
                            <RatingGroup.Item key={index} index={index + 1}>
                                <RatingGroup.ItemIndicator />
                            </RatingGroup.Item>
                            ))}
                        </RatingGroup.Control>
                    </RatingGroup.Root>
                
                
                </HStack>
                <VStack spacing={2} align="stretch" mt={4}>
                    {
                    allRating.map((rate, index) => (
                            <Progress.Root variant="outline" colorPalette="orange" size="sm" value={rate} maxW="sm">
                                <HStack>
                                    <Progress.Label>{5 - index } Stars</Progress.Label>
                                    <Progress.Track flex="1">
                                        <Progress.Range />
                                    </Progress.Track>
                                </HStack>
                            </Progress.Root>
                    ))
                    }
                </VStack>
                <Box borderBottom="1px solid gray" my={4} />

                {/* Reviews Section */}
                <Heading as="h2" size="md" mt={5} mb={3}>Leave a Review</Heading>
                <HStack mt={4}>
                    <RatingGroup.RootProvider value={rating} colorPalette="orange" size="lg">
                            <RatingGroup.HiddenInput />
                            <RatingGroup.Control>
                                {rating.items.map((index) => (
                                <RatingGroup.Item key={index} index={index}>
                                    <RatingGroup.ItemIndicator />
                                </RatingGroup.Item>
                                ))}
                            </RatingGroup.Control>
                    </RatingGroup.RootProvider>
                </HStack>
                <HStack mt={4} position="relative" alignItems="start" className='mb-4'>
                    <Field.Root 
                        invalid={isError}
                    >
                        <Input
                            placeholder="Write a review..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            isDisabled={isPostingReview}
                            errorText={isError ? message : ""}
                            
                        />
                        <Field.ErrorText>{message}</Field.ErrorText>
                    </Field.Root>
                    <IconButton
                            className='t-0'
                            onClick={handleAddReview}
                            aria-label="Add Review"
                            text="Add Review"
                            isLoading={isPostingReview}
                        >
                            <FaPlusCircle />
                        </IconButton>
                </HStack>

                <Heading as="h2" size="md" mt={5} mb={3}>Reviews</Heading>
                <VStack spacing={3} align="stretch">
                    {course.reviews.length > 0 ? (
                    course.reviews.map((r, index) => (
                            <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                                <Text fontWeight="bold">{r.author}</Text>
                                <RatingGroup.Root readOnly count={5} defaultValue={r.rating} size="sm" colorPalette="orange">
                                    <RatingGroup.HiddenInput />
                                    <RatingGroup.Control>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                        <RatingGroup.Item key={index} index={index + 1}>
                                            <RatingGroup.ItemIndicator />
                                        </RatingGroup.Item>
                                        ))}
                                    </RatingGroup.Control>
                                </RatingGroup.Root>
                                <Text fontSize="sm" color="gray.500">{new Date(r.created_at).toLocaleString()}</Text>
                                <Text mt={2}>{r.content}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text fontStyle="italic" color="gray.500">Be the first to leave a review.</Text>
                    )}
                </VStack>
                
            </Box> )}
            </div>
    );
};

export default CoursePage;