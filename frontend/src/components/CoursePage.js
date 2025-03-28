import React, { useState, useEffect, useCallback, use } from 'react';
import axios from 'axios';
import {
    Box,
    Heading,
    Text,
    Textarea,
    Flex,
    Spinner,
    VStack,
    HStack,
    Input,
    Field,
    IconButton,
    RatingGroup,
    useRatingGroup,
    Progress,
    Button

} from '@chakra-ui/react';
import  LeftSidebar  from './LeftSidebar';
import  RatingInput  from './RatingInput';
import { FaPlusCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import dayjs from 'dayjs';

const CoursePage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState('');
    const ratingE = useRatingGroup({ count: 5, defaultValue: 0 });
    const ratingMD = useRatingGroup({ count: 5, defaultValue: 0 });
    const ratingAD = useRatingGroup({ count: 5, defaultValue: 0 });
    const [overallRating, setOverallRating] = useState(0);
    const [isPostingReview, setIsPostingReview] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const formatDate = (dateString) => {
        const postDate = new Date(dateString + 'Z'); // Ensure UTC parsing
        const estDate = new Date(
          postDate.toLocaleString("en-US", { timeZone: "America/Toronto" })
        );
      
        const now = new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })
        );
      
        const diffInMs = now - estDate;
      
        const diffInMinutes = Math.floor(diffInMs / (60 * 1000));
        if (diffInMinutes < 1) return "just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
      
        const diffInHours = Math.floor(diffInMs / (60 * 60 * 1000));
        if (diffInHours < 24) return `${diffInHours}h`;
      
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "yesterday";
        if (diffInDays <= 6) return `${diffInDays} days`;
      
        return estDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: now.getFullYear() !== estDate.getFullYear() ? "numeric" : undefined,
        });
      };      

     const fetchCourse = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
            setOverallRating(Math.floor((response.data.ratings.average_rating_E + response.data.ratings.average_rating_MD + response.data.ratings.average_rating_AD) / 3));
            console.log(response.data);
            setCourse(response.data);
        } catch (error) {
            setMessage("Failed to load course.");
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }, [courseId]); 

    const sendReview = async ({newReview}) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/courses/${courseId}/review`, newReview);
            
            ratingE.setValue(0);
            ratingMD.setValue(0);
            ratingAD.setValue(0);
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

    useEffect(() => {
        if (!courseId) return;
        setLoading(true);
        fetchCourse();
    }, [courseId]);


    const handleAddReview = async () => {
        if (!review.trim()) {
            //console.log("Review is empty.");
            setMessage("Review cannot be empty.");
            setIsError(true);
            return;
        }

        if (ratingE.value === 0 || ratingMD.value === 0 || ratingAD.value === 0) {
            //console.log("Rating is empty.");
            setMessage("Rating cannot be empty.");
            setIsError(true);
            return;
        }

        const user = await getUser();
        if (!user.username && !user.email) {
            //console.log("User not logged in.");
            setMessage("You must be logged in to add a review.");
            setIsError(true);
            return;
        }


        const newReview = { 
            content: review, 
            ratingE: ratingE.value, 
            ratingMD: ratingMD.value, 
            ratingAD: ratingAD.value, 
            created_at: new Date().toISOString(), 
            author: user.username || "Anonymous" 
        };

        setIsPostingReview(true);
        await sendReview({newReview});
        await fetchCourse();            
           
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner size="xl" />
            </Flex> 
        )
    } else 
    {
    return (
        <Flex flex="1" bg="gray.50">
            {/* Left Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                left="0"
            >
                {/* Actual Sidebar Content - Moved inward */}
                <Box width="80%" ml="auto">
                <LeftSidebar />
                </Box>
            </Box>
        
            <Box 
                flex="1"
                ml={{ base: 0, md: '27%' }}
                mr={{ base: 0, md: '5%' }}
                mt={6}
                mb={6}
                bg="gray.50"
                minH="calc(100vh - 60px)"
            >
                
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
                
                { overallRating == 0 ? (
                    <Text fontStyle="italic" color="gray.500">No reviews yet</Text>
                    ) : (
                    <div>
                    <HStack >
                        <Heading as="h2" size="md" >Overall Rating:</Heading>
                        <RatingGroup.Root readOnly colorPalette="yellow" count={5} value={overallRating} size="lg" >
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
                        
                        <Text fontSize="lg">Engagement:</Text>    
                        <RatingGroup.Root readOnly count={5} ml={2} value={course.ratings.average_rating_E} size="md" >
                            <RatingGroup.HiddenInput />
                            <RatingGroup.Control>
                                {Array.from({ length: 5 }).map((_, index) => (
                                <RatingGroup.Item key={index} index={index + 1}>
                                    <RatingGroup.ItemIndicator />
                                </RatingGroup.Item>
                                ))}
                            </RatingGroup.Control>
                        </RatingGroup.Root>
                        
                        <Text fontSize="lg">Material Difficulty:</Text>  
                        <RatingGroup.Root readOnly count={5} ml={2} value={course.ratings.average_rating_MD} size="md" >
                            <RatingGroup.HiddenInput />
                            <RatingGroup.Control>
                                {Array.from({ length: 5 }).map((_, index) => (
                                <RatingGroup.Item key={index} index={index + 1}>
                                    <RatingGroup.ItemIndicator />
                                </RatingGroup.Item>
                                ))}
                            </RatingGroup.Control>
                        </RatingGroup.Root>
                        
                        <Text fontSize="lg">Assessment Difficulty:</Text>  
                        <RatingGroup.Root readOnly count={5} ml={2} value={course.ratings.average_rating_AD} size="md" >
                            <RatingGroup.HiddenInput />
                            <RatingGroup.Control>
                                {Array.from({ length: 5 }).map((_, index) => (
                                <RatingGroup.Item key={index} index={index + 1}>
                                    <RatingGroup.ItemIndicator />
                                </RatingGroup.Item>
                                ))}
                            </RatingGroup.Control>
                        </RatingGroup.Root>
                        

                    </VStack>
                    </div>
                    )}
                <Box borderBottom="1px solid gray" my={4} />

                {/* Reviews Section */}
                <Heading as="h2" size="md" mt={5} mb={3}>Leave a Review</Heading>
                <VStack mt={4} position="relative" alignItems="start" bg="white" borderColor="gray.100" borderWidth="1px" p={4} borderRadius="md">

                    <Heading as="h2" size="sm" mt={1} mb={1}>Engagement:</Heading>
                    <RatingInput rating={ratingE} size="lg"/>
                                
                    <Heading as="h2" size="sm" mt={1} mb={1}>Material Difficulty:</Heading>
                    <RatingInput rating={ratingMD} size="lg"/>

                    <Heading as="h2" size="sm" mt={1} mb={1}>Assessment Difficulty:</Heading>
                    <RatingInput rating={ratingAD} size="lg"/>

                    <Field.Root 
                        invalid={isError}
                    >
                        <Textarea
                            placeholder="Write a review..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            isDisabled={isPostingReview}
                            errorText={isError ? message : ""}
                            
                        />
                        <Field.ErrorText>{message}</Field.ErrorText>
                    </Field.Root>
                    <HStack>
                        <Button
                        bg="white"
                        color="black"
                        borderWidth="1px"
                        borderColor="black"
                        onClick={() => {
                            setReview('');
                            ratingAD.setValue(0);
                            ratingMD.setValue(0);
                            ratingE.setValue(0);
                            setIsError(false);
                            setMessage("");
                        }}
                        aria-label="Add Review"
                        text="Add Review"
                        mt={2}
                    >
                        Reset
                    </Button>
                    <Button
                        alignContent={"end"}
                        onClick={handleAddReview}
                        aria-label="Add Review"
                        text="Add Review"
                        isLoading={isPostingReview}
                        mt={2}
                    >
                        Add Review
                    </Button>
                    </HStack>
                </VStack>

                <Heading as="h2" size="md" mt={5} mb={3}>Reviews</Heading>
                <VStack spacing={3} align="stretch">
                    {course.reviews.length > 0 ? (
                    course.reviews.map((r, index) => (
                            <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg="white" borderColor="gray.100">
                                <Text fontWeight="bold">{r.author}</Text>
                                <RatingGroup.Root readOnly count={5} value={Math.floor((r.ratingE + r.ratingMD + r.ratingAD ) / 3) } size="sm" >
                                    <RatingGroup.HiddenInput />
                                    <RatingGroup.Label mr={2}>Overall Rating:</RatingGroup.Label>
                                    <RatingGroup.Control>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                        <RatingGroup.Item key={index} index={index + 1}>
                                            <RatingGroup.ItemIndicator />
                                        </RatingGroup.Item>
                                        ))}
                                    </RatingGroup.Control>
                                </RatingGroup.Root>
                                <Text fontSize="sm" color="gray.500">{formatDate(r.created_at)}</Text>
                                <Text mt={2}>{r.content}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text fontStyle="italic" color="gray.500">Be the first to leave a review.</Text>
                    )}
                </VStack>
                
            </Box> 
            </Flex>
    );
}
};

export default CoursePage;