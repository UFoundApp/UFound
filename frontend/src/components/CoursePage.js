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
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import ReportDialog from '../Posts/Reporting.jsx';
import dayjs from 'dayjs';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';

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
    const [currentUser, setCurrentUser] = useState(null);
    const [isProcessingLike, setIsProcessingLike] = useState(false);
    const { showAlert } = useContext(AlertContext);

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setCurrentUser(userData);      
        }
        fetchUser();
    }, []);

    const isUofT = currentUser?.is_uoft === true;
    const disableReviewUI = currentUser && !isUofT;      

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

        if (!user.is_uoft) {
            showAlert("error", "solid", "Unauthorized", "Only UofT students can post course reviews.");
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

    const handleDeleteReview = async (reviewIndex) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/courses/${courseId}/reviews/${reviewIndex}`, {
                withCredentials: true,
            });
            // Update the course state by filtering out the deleted review
            setCourse(prev => ({
                ...prev,
                reviews: prev.reviews.filter((_, idx) => idx !== reviewIndex)
            }));
            setMessage("Review deleted successfully.");
            setIsError(false);
        } catch (error) {
            console.error("Failed to delete review:", error.response?.data || error.message);
            setMessage("Failed to delete review.");
            setIsError(true);
        }
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
                                <Link key={index} to={`/professors/${prof.id}`}>
                                    <Box 
                                        p={3} 
                                        borderWidth="1px" 
                                        borderRadius="md" 
                                        borderColor="gray.200" 
                                        _hover={{ bg: "gray.100", cursor: "pointer" }}
                                    >
                                        <Text fontWeight="bold">{prof.name}</Text>
                                        <Text fontSize="sm" color="gray.500">{prof.department}</Text>
                                    </Box>
                                </Link>
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
                {disableReviewUI && (
                    <Text fontSize="sm" color="red.500" mb={2}>
                        Only UofT-verified students can leave course reviews.
                    </Text>
                )}
                <VStack
                    mt={4}
                    position="relative"
                    alignItems="start"
                    bg="white"
                    borderColor="gray.100"
                    borderWidth="1px"
                    p={4}
                    borderRadius="md"
                    opacity={disableReviewUI ? 0.5 : 1}
                    pointerEvents={disableReviewUI ? "none" : "auto"}
                >

                    <Heading as="h2" size="sm" mt={1} mb={1}>Engagement:</Heading>
                    <RatingInput rating={ratingE} size="lg" isDisabled={disableReviewUI} />
                                
                    <Heading as="h2" size="sm" mt={1} mb={1}>Material Difficulty:</Heading>
                    <RatingInput rating={ratingMD} size="lg" isDisabled={disableReviewUI} />

                    <Heading as="h2" size="sm" mt={1} mb={1}>Assessment Difficulty:</Heading>
                    <RatingInput rating={ratingAD} size="lg" isDisabled={disableReviewUI} />

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
                            <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg="white" borderColor="gray.100" position="relative">
                                <Box position="absolute" top="8px" right="8px">
                                <HStack spacing={2}>
                                    {/* Like button */}
                                    {r.likes?.includes(currentUser?.id) ? (
                                        <FaHeart
                                            color="red"
                                            cursor="pointer"
                                            onClick={async () => {
                                                if (isProcessingLike) return;
                                                setIsProcessingLike(true);
                                                try {
                                                    await axios.post(`http://127.0.0.1:8000/api/courses/reviews/${courseId}/${index}/unlike`, {}, {
                                                        withCredentials: true,
                                                    });
                                                    await fetchCourse();
                                                } catch (err) {
                                                    console.error("Unlike error:", err);
                                                } finally {
                                                    setIsProcessingLike(false);
                                                }
                                            }}
                                        />
                                    ) : (
                                            <FaRegHeart
                                                cursor="pointer"
                                                onClick={async () => {
                                                    if (isProcessingLike) return;
                                                    setIsProcessingLike(true);
                                                    try {
                                                        await axios.post(`http://127.0.0.1:8000/api/courses/reviews/${courseId}/${index}/like`, {}, {
                                                            withCredentials: true,
                                                        });
                                                        await fetchCourse();
                                                    } catch (err) {
                                                        if (err.response?.status === 401 || err.response?.status === 403) {
                                                            showAlert("error", "solid", "Unauthorized", "Only UofT students can like reviews.");
                                                        } else {
                                                            console.error("Like error:", err);
                                                        }
                                                    } finally {
                                                        setIsProcessingLike(false);
                                                    }
                                                }}
                                            />

                                    )}
                                    <Text fontSize="sm">{r.likes?.length || 0}</Text>

                                    {/* Report button */}
                                    {currentUser?.is_uoft && (
                                        <ReportDialog endpoint={`http://localhost:8000/api/courses/reviews/${courseId}/${index}/report`} />
)}
                                    {/* Delete button */}
                                    {currentUser && currentUser.username === r.author && (
                                        <Button
                                            colorPalette="red"
                                            size="xs"
                                            onClick={() => handleDeleteReview(index)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </HStack>
                            </Box>
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
                                <Text fontSize="sm" color="gray.500">{new Date(r.created_at).toLocaleString()}</Text>
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