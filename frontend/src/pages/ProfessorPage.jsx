import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box, Heading, Text, Link, VStack, Spinner, Container, Separator, Flex,
    Button, Textarea, HStack, RatingGroup, useRatingGroup
} from "@chakra-ui/react";
import { Tag } from "@chakra-ui/react";  // ✅ Updated import
import { Progress } from "@chakra-ui/react";  // ✅ Updated import
import LeftSidebar from "../components/LeftSidebar";
import { getUser } from "../components/AuthPageUtil";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons
import ReportDialog from "../Posts/Reporting";  


const ProfessorPage = () => {
    const { professorId } = useParams();
    const [professor, setProfessor] = useState(null);
    const [overallRating, setOverallRating] = useState(null);
    const [clarity, setClarity] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [strictness, setStrictness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewContent, setReviewContent] = useState("");
    const overallRatingGroup = useRatingGroup({ count: 5, defaultValue: 3 });
    const clarityRatingGroup = useRatingGroup({ count: 10, defaultValue: 3 });
    const engagementRatingGroup = useRatingGroup({ count: 10, defaultValue: 3 });
    const strictnessRatingGroup = useRatingGroup({ count: 10, defaultValue: 3 });
    const [isProcessingLike, setIsProcessingLike] = useState(false);
    const [likeMessages, setLikeMessages] = useState({});

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/professors/${professorId}/page`)
            .then(response => response.json())
            .then(data => {
                setProfessor(data);
                if (data.reviews.length > 0) {
                    const totalReviews = data.reviews.length;
                    const avgOverall = data.reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews;
                    const avgClarity = data.reviews.reduce((sum, r) => sum + r.clarity, 0) / totalReviews;
                    const avgEngagement = data.reviews.reduce((sum, r) => sum + r.engagement, 0) / totalReviews;
                    const avgStrictness = data.reviews.reduce((sum, r) => sum + r.strictness, 0) / totalReviews;
                    setOverallRating(avgOverall);
                    setClarity(avgClarity);
                    setEngagement(avgEngagement);
                    setStrictness(avgStrictness);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching professor:", error);
                setLoading(false);
            });
    }, [professorId]);

    const handleSubmitReview = async () => {
        const user = getUser();
        if (!user) {
            setReviewMessage("You must be logged in to leave a review.");
            return;
        }

        if (!reviewContent.trim()) {
            setReviewMessage("Review content cannot be empty.");
            return;
        }

        setIsSubmitting(true);
        try {
            const reviewData = {
                professor_id: professorId,
                course_id: null,
                content: reviewContent,
                author: user.username || "Anonymous",
                created_at: new Date().toISOString(),
                likes: [],
                overall_rating: overallRatingGroup.value,
                strictness: strictnessRatingGroup.value,
                clarity: clarityRatingGroup.value,
                engagement: engagementRatingGroup.value
            };
            await axios.post(`http://127.0.0.1:8000/api/professors/${professorId}/reviews`, reviewData);
            // Update the professor data with the new review
            const updatedProfessor = { ...professor };
            updatedProfessor.reviews.push(reviewData);
            setProfessor(updatedProfessor);
            
            // Recalculate ratings
            const totalReviews = updatedProfessor.reviews.length;
            const avgOverall = updatedProfessor.reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews;
            const avgClarity = updatedProfessor.reviews.reduce((sum, r) => sum + r.clarity, 0) / totalReviews;
            const avgEngagement = updatedProfessor.reviews.reduce((sum, r) => sum + r.engagement, 0) / totalReviews;
            const avgStrictness = updatedProfessor.reviews.reduce((sum, r) => sum + r.strictness, 0) / totalReviews;
            
            setOverallRating(avgOverall);
            setClarity(avgClarity);
            setEngagement(avgEngagement);
            setStrictness(avgStrictness);
            
            setReviewContent("");
            setShowReviewForm(false);
            setReviewMessage("");
        } catch (error) {
            console.error("Error submitting review:", error);
            setReviewMessage("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeReview = async (reviewId) => {
    const user = await getUser();

        if (!user) {
            // User must be logged in to like a review
            setReviewMessage("You must be logged in to like a review.");
            return;
        }
        
        setIsProcessingLike(true);
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/professors/reviews/${reviewId}/like`,
                { user_id: user.id }
            );
            
            // Update the professor data with the updated review
            const updatedProfessor = { ...professor };
            const reviewIndex = updatedProfessor.reviews.findIndex(r => r._id === reviewId);
            if (reviewIndex !== -1) {
                updatedProfessor.reviews[reviewIndex] = response.data;
                setProfessor(updatedProfessor);
                // Clear the message after 3 seconds
                setTimeout(() => {
                    setLikeMessages(prev => {
                        const newMessages = { ...prev };
                        delete newMessages[reviewId];
                        return newMessages;
                    });
                }, 3000);
            }
        } catch (error) {
            console.error("Error liking review:", error);
            setReviewMessage("FaileFd to like review. Please try again.");
        } finally {
            setIsProcessingLike(false);
        }
    };

    if (loading) return <Spinner size="xl" mt="20px" />;
    if (!professor) return <Text fontSize="xl" mt="20px">Professor not found.</Text>;

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

            {/* Main Content - Center aligned with margins for sidebar */}
            <Box 
                flex="1"
                ml={{ base: 0, md: '25%' }}
                bg="gray.50"
                minH="calc(100vh - 60px)"
            >
                <Container maxW="1300px" py={6} px={6}>
                    {/* ✅ Header: Professor Info & Ratings */}
                    <Flex justify="space-between" align="center">
                        {/* Professor Info (Left) */}
                        <Box>
                            <Heading size="xl">{professor.name}</Heading>
                            <Text fontSize="lg" color="gray.600">{professor.department}</Text>
                            {professor.profile_link && (
                                <Link
                                    href={professor.profile_link}
                                    isExternal
                                    color="blue.500"
                                    mt={2}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View University Profile
                                </Link>
                            )}
                        </Box>

                        {/* Ratings (Right) */}
                        <Box w="250px">
                            <Text fontSize="lg" fontWeight="bold">Overall Rating: ⭐ {overallRating ? overallRating.toFixed(1) : "N/A"}/5</Text>
                            <Box mt={2}>
                                <Text fontSize="sm">Clarity</Text>
                                <Progress.Root value={clarity ? (clarity / 10) * 100 : 0}>
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                            </Box>
                            <Box mt={2}>
                                <Text fontSize="sm">Engagement</Text>
                                <Progress.Root value={engagement ? (engagement / 10) * 100 : 0}>
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                            </Box>
                            <Box mt={2}>
                                <Text fontSize="sm">Strictness</Text>
                                <Progress.Root value={strictness ? (strictness / 10) * 100 : 0}>
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                            </Box>
                        </Box>
                    </Flex>

                    <Separator my={4} />

                    {/* Current & Past Courses Side by Side */}
                    <Flex>
                        {/* Current Courses (Left) */}
                        <Box flex={1} mr={4}>
                            <Heading size="md" mb={2}>Current Courses</Heading>
                            {professor.current_courses.length > 0 ? (
                                <VStack spacing={2} align="stretch">
                                    {professor.current_courses.map((course, index) => (
                                        <Tag.Root key={index} colorScheme="blue" p={2} borderRadius="md">
                                            <Tag.Label>{course.title}</Tag.Label>
                                        </Tag.Root>
                                    ))}
                                </VStack>
                            ) : <Text>No current courses.</Text>}
                        </Box>

                        {/* Past Courses (Right) */}
                        <Box flex={1}>
                            <Heading size="md" mb={2}>Past Courses</Heading>
                            {professor.past_courses.length > 0 ? (
                                <VStack spacing={2} align="stretch">
                                    {professor.past_courses.map((course, index) => (
                                        <Tag.Root key={index} colorScheme="green" p={2} borderRadius="md">
                                            <Tag.Label>{course.title}</Tag.Label>
                                        </Tag.Root>
                                    ))}
                                </VStack>
                            ) : <Text>No past courses.</Text>}
                        </Box>
                    </Flex>

                    <Separator my={4} />

                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Student Reviews</Heading>
                        <Button 
                            colorScheme="blue" 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                        >
                            {showReviewForm ? "Cancel" : "Leave a Review"}
                        </Button>
                    </Flex>

                    {/* Review Form */}
                    {showReviewForm && (
                        <Box 
                            p={5} 
                            border="1px" 
                            borderColor="gray.200" 
                            borderRadius="md" 
                            bg="white" 
                            mb={6}
                            boxShadow="md"
                        >
                            <VStack spacing={4} align="stretch">
                                <Heading size="sm">Write Your Review</Heading>
                                
                                <Box>
                                    <Text mb={2} fontWeight="medium">Overall Rating</Text>
                                    <RatingGroup.RootProvider value={overallRatingGroup} colorPalette="black" size="lg">
                                        <RatingGroup.HiddenInput />
                                        <RatingGroup.Control>
                                            {overallRatingGroup.items.map((index) => (
                                                <RatingGroup.Item key={index} index={index}>
                                                    <RatingGroup.ItemIndicator />
                                                </RatingGroup.Item>
                                            ))}
                                        </RatingGroup.Control>
                                    </RatingGroup.RootProvider>
                                </Box>
                                
                                <Box>
                                    <Text mb={2} fontWeight="medium">Clarity (1-10)</Text>
                                    <RatingGroup.RootProvider value={clarityRatingGroup} colorPalette="black" size="md">
                                        <RatingGroup.HiddenInput />
                                        <RatingGroup.Control>
                                            {clarityRatingGroup.items.map((index) => (
                                                <RatingGroup.Item key={index} index={index}>
                                                    <RatingGroup.ItemIndicator />
                                                </RatingGroup.Item>
                                            ))}
                                        </RatingGroup.Control>
                                    </RatingGroup.RootProvider>
                                </Box>
                                
                                <Box>
                                    <Text mb={2} fontWeight="medium">Engagement (1-10)</Text>
                                    <RatingGroup.RootProvider value={engagementRatingGroup} colorPalette="black" size="md">
                                        <RatingGroup.HiddenInput />
                                        <RatingGroup.Control>
                                            {engagementRatingGroup.items.map((index) => (
                                                <RatingGroup.Item key={index} index={index}>
                                                    <RatingGroup.ItemIndicator />
                                                </RatingGroup.Item>
                                            ))}
                                        </RatingGroup.Control>
                                    </RatingGroup.RootProvider>
                                </Box>
                                
                                <Box>
                                    <Text mb={2} fontWeight="medium">Strictness (1-10)</Text>
                                    <RatingGroup.RootProvider value={strictnessRatingGroup} colorPalette="black" size="md">
                                        <RatingGroup.HiddenInput />
                                        <RatingGroup.Control>
                                            {strictnessRatingGroup.items.map((index) => (
                                                <RatingGroup.Item key={index} index={index}>
                                                    <RatingGroup.ItemIndicator />
                                                </RatingGroup.Item>
                                            ))}
                                        </RatingGroup.Control>
                                    </RatingGroup.RootProvider>
                                </Box>
                                
                                <Box>
                                    <Text mb={2} fontWeight="medium">Review Content</Text>
                                    <Textarea
                                        value={reviewContent}
                                        onChange={(e) => setReviewContent(e.target.value)}
                                        placeholder="Share your experience with this professor..."
                                        size="md"
                                        rows={4}
                                    />
                                </Box>
                                
                                {reviewMessage && (
                                    <Text color="red.500">{reviewMessage}</Text>
                                )}
                                
                                <HStack spacing={4} justify="flex-end">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowReviewForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        colorScheme="blue" 
                                        onClick={handleSubmitReview}
                                        isLoading={isSubmitting}
                                    >
                                        Submit Review
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    )}

                    {professor.reviews.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {professor.reviews.map((review, index) => (
                                <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="white" position="relative">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="md" fontWeight="bold">⭐ {review.overall_rating}/5</Text>
                                        <HStack spacing={2}>
                                            {review.likes.includes(getUser()?.id) ? (
                                            <FaHeart 
                                                color="red" 
                                                cursor="pointer" 
                                                onClick={() => handleLikeReview(review._id)}
                                            />
                                            ) : (
                                            <FaRegHeart 
                                                cursor="pointer" 
                                                onClick={() => handleLikeReview(review._id)}
                                            />
                                            )}
                                            <Text>{review.likes.length}</Text>

                                            {/* Add the ReportDialog button */}
                                            <ReportDialog 
                                            endpoint={`http://localhost:8000/api/professors/reviews/${review._id}/report`}
                                            postId={review._id}
                                            type="professor"
                                            setMessage={setReviewMessage}
                                            setIsError={() => {}} // optional, you can modify this to match your error handling
                                            />
                                        </HStack>
                                    </Flex>
                                    {likeMessages && likeMessages[review._id] && (
                                        <Text color="green.500" fontSize="sm" mt={1}>
                                            {likeMessages[review._id]}
                                        </Text>
                                    )}
                                    {review.course_id && <Text fontSize="sm" color="gray.500">Course: {review.course_id}</Text>}
                                    <Text mt={2}>{review.content}</Text>
                                    <Text fontSize="sm" color="gray.500" mt={2}>
                                    By{" "}
                                    <Link to={`/profile/${review.author}`}>
                                        <Text as="span" fontWeight="medium" color="blue.500" _hover={{ textDecoration: "underline" }}>
                                        {review.author}
                                        </Text>
                                    </Link>{" "}
                                    | {new Date(review.created_at).toLocaleDateString()}
                                    </Text>
                                    <Separator my={2} />
                                    <Text fontSize="sm">Strictness: {review.strictness}/10</Text>
                                    <Text fontSize="sm">Clarity: {review.clarity}/10</Text>
                                    <Text fontSize="sm">Engagement: {review.engagement}/10</Text>
                                </Box>
                            ))}
                        </VStack>
                    ) : <Text>No reviews yet.</Text>}
                </Container>
            </Box>
        </Flex>
    );
};

export default ProfessorPage;
