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
import LeftSidebar from './LeftSidebar';
import RatingInput from './RatingInput';
import { FaPlusCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import ReportDialog from '../Posts/Reporting.jsx';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AlertContext } from './ui/AlertContext';
import { useColorMode } from '../theme/ColorModeContext';

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
    const [user, setUser] = useState(null);
    const isUofT = user?.is_uoft === true;
    const disableReviewUI = user && !isUofT;
    const { colorMode } = useColorMode();

    const { showAlert } = useContext(AlertContext);

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
            showAlert("error", "surface", "Error", "An error occurred while loading course");
        } finally {
            setLoading(false);
        }
    }, [courseId]); 

    const sendReview = async ({newReview}) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/courses/${courseId}/review`, newReview, {
                withCredentials: true,
            });
            
            ratingE.setValue(0);
            ratingMD.setValue(0);
            ratingAD.setValue(0);
            setReview('');
            setMessage("Your review was posted successfully!");
            setIsError(false);
        } catch (error) {
            setMessage("Failed to post review.");
            setIsError(true);
            showAlert("error", "surface", "Error", "An error occurred while posting review");
        } finally {
            setIsPostingReview(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    useEffect(() => {
        if (!courseId) return;
        setLoading(true);
        fetchCourse();

        const loadUser = async () => {
            const u = await getUser();
            setUser(u);
        };
        loadUser();
    }, [courseId]);


    const handleAddReview = async () => {
        if (disableReviewUI) return;
        if (!review.trim()) {
            //console.log("Review is empty.");
            setMessage("Review cannot be empty.");
            setIsError(true);
            showAlert("error", "surface", "Error", "Review cannot be empty.");
            return;
        }

        if (ratingE.value === 0 || ratingMD.value === 0 || ratingAD.value === 0) {
            //console.log("Rating is empty.");
            setMessage("Rating cannot be empty.");
            setIsError(true);
            showAlert("error", "surface", "Error", "Rating cannot be empty.");
            return;
        }

        const user = await getUser();
        if (!user.username && !user.email) {
            //console.log("User not logged in.");
            setMessage("You must be logged in to add a review.");
            setIsError(true);
            showAlert("error", "surface", "Error", "You must be logged in to add a review.");
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
        <Flex flex="1" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
            {/* Left Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
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
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                minH="calc(100vh - 60px)"
            >
                
                <Heading as="h1" size="lg" mb={3} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
                    {course.title}
                </Heading>
                <Text fontSize="md" color={colorMode === 'light' ? 'gray.600' : 'gray.300'} mb={4}>
                    {course.description}
                </Text>

                <Box borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} my={4} />

                {/* Course Details */}
                <Text fontSize="md" fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Prerequisites:</Text>
                <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>{course.prerequisites || "None"}</Text>
                
                <Text fontSize="md" fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Exclusions:</Text>
                <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>{course.exclusion || "None"}</Text>
                
                <Text fontSize="md" fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Distribution:</Text>
                <Text mb={4} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>{course.distribution || "N/A"}</Text>

                <Box borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} my={4} />

                {/* Professors Section */}
                <Heading as="h2" size="md" mb={3} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Professors</Heading>
                <VStack spacing={2} align="stretch">
                    {course.professors.length > 0 ? (
                        course.professors.map((prof, index) => (
                            <Box 
                                key={index} 
                                p={3} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                                bg={colorMode === 'light' ? 'white' : 'gray.700'}
                            >
                                <Text fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>{prof.name}</Text>
                                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>{prof.department}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text fontStyle="italic" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>No professors listed.</Text>
                    )}
                </VStack>

                <Box borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} my={4} />
                
                { overallRating == 0 ? (
                    <Text fontStyle="italic" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>No reviews yet</Text>
                    ) : (
                    <div>
                    <HStack >
                        <Heading as="h2" size="md" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Overall Rating:</Heading>
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
                        
                        <Text fontSize="lg" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Engagement:</Text>    
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
                        
                        <Text fontSize="lg" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Material Difficulty:</Text>  
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
                        
                        <Text fontSize="lg" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Assessment Difficulty:</Text>  
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
                <Box borderBottom="1px solid" borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} my={4} />

                {/* Reviews Section */}
                <Heading as="h2" size="md" mt={5} mb={1} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Leave a Review</Heading>
                {disableReviewUI && (
                <Text color="red.500" fontSize="sm" mb={2}>
                    Only UofT-verified users can leave reviews.
                </Text>
                )}
                <VStack mt={4} position="relative" alignItems="start" bg={colorMode === 'light' ? 'white' : 'gray.700'} borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'} borderWidth="1px" p={4} borderRadius="md">

                    <Heading as="h2" size="sm" mt={1} mb={1} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Engagement:</Heading>
                    <RatingInput rating={ratingE} size="lg" isDisabled={disableReviewUI}/>
                                
                    <Heading as="h2" size="sm" mt={1} mb={1} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Material Difficulty:</Heading>
                    <RatingInput rating={ratingMD} size="lg" isDisabled={disableReviewUI}/>

                    <Heading as="h2" size="sm" mt={1} mb={1} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Assessment Difficulty:</Heading>
                    <RatingInput rating={ratingAD} size="lg" isDisabled={disableReviewUI}/>

                    <Field.Root 
                        invalid={isError}
                    >
                        <Textarea
                            placeholder="Write a review..."
                            value={review}
                            onChange={(e) => {
                                if (!disableReviewUI) setReview(e.target.value);
                            }}
                            isDisabled={isPostingReview || disableReviewUI}
                            errorText={isError ? message : ""}
                            bg={colorMode === 'light' ? 'white' : 'gray.600'}
                            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                            _placeholder={{
                                color: colorMode === 'light' ? 'gray.400' : 'gray.300'
                            }}
                        />
                        <Field.ErrorText>{message}</Field.ErrorText>
                    </Field.Root>
                    <HStack>
                        <Button
                        bg={colorMode === 'light' ? 'white' : 'gray.600'}
                        color={colorMode === 'light' ? 'black' : 'gray.100'}
                        borderWidth="1px"
                        borderColor={colorMode === 'light' ? 'black' : 'gray.400'}
                        onClick={() => {
                            setReview('');
                            ratingAD.setValue(0);
                            ratingMD.setValue(0);
                            ratingE.setValue(0);
                            setIsError(false);
                            setMessage("");
                        }}
                        aria-label="Reset"
                        mt={2}
                        _hover={{
                            bg: colorMode === 'light' ? 'gray.100' : 'gray.500'
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        isDisabled={disableReviewUI}
                        opacity={disableReviewUI ? 0.5 : 1}
                        cursor={disableReviewUI ? "not-allowed" : "pointer"}
                        alignContent={"end"}
                        onClick={handleAddReview}
                        aria-label="Add Review"
                        isLoading={isPostingReview}
                        mt={2}
                        bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                        color="white"
                        _hover={{
                            bg: colorMode === 'light' ? 'blue.600' : 'blue.500'
                        }}
                    >
                        Add Review
                    </Button>
                    </HStack>
                </VStack>

                <Heading as="h2" size="md" mt={5} mb={3} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>Reviews</Heading>
                <VStack spacing={3} align="stretch">
                    {course.reviews.length > 0 ? (
                    course.reviews.map((r, index) => (
                            <Box 
                                key={index} 
                                p={3} 
                                borderWidth="1px" 
                                borderRadius="md" 
                                bg={colorMode === 'light' ? 'white' : 'gray.700'} 
                                borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'} 
                                position="relative"
                            >
                                <Box position="absolute" top="8px" right="8px">
                                <ReportDialog endpoint={`http://localhost:8000/api/courses/reviews/${courseId}/${index}/report`} />
                                </Box>
                                <Link to={`/profile/${r.author}`}>
                                <Text 
                                    fontWeight="bold" 
                                    _hover={{ textDecoration: "underline", color: "blue.500" }}
                                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                                >
                                    {r.author}
                                </Text>
                                </Link>
                                <RatingGroup.Root readOnly count={5} value={Math.floor((r.ratingE + r.ratingMD + r.ratingAD ) / 3) } size="sm" >
                                    <RatingGroup.HiddenInput />
                                    <RatingGroup.Label mr={2} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
                                        Overall Rating:
                                    </RatingGroup.Label>
                                    <RatingGroup.Control>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                        <RatingGroup.Item key={index} index={index + 1}>
                                            <RatingGroup.ItemIndicator />
                                        </RatingGroup.Item>
                                        ))}
                                    </RatingGroup.Control>
                                </RatingGroup.Root>
                                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                                    {formatDate(r.created_at)}
                                </Text>
                                <Text mt={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
                                    {r.content}
                                </Text>
                            </Box>
                        ))
                    ) : (
                        <Text fontStyle="italic" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                            Be the first to leave a review.
                        </Text>
                    )}
                </VStack>
                
            </Box> 
            </Flex>
    );
}
};

export default CoursePage;