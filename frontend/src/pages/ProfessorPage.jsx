import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Heading,
    Text,
    Link,
    VStack,
    Spinner,
    Container,
    Separator,
    Flex,
    Button,
    Textarea,
    HStack,
    RatingGroup,
    useRatingGroup,
    Tag,
    Progress,
    Icon
} from "@chakra-ui/react";
import { FiBarChart2 } from "react-icons/fi"; // Example bar-chart icon
import LeftSidebar from "../components/LeftSidebar";
import { getUser } from "../components/AuthPageUtil";
import axios from "axios";

import ReportDialog from "../Posts/Reporting";  
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

import { useContext } from "react";
import { AlertContext } from '../components/ui/AlertContext';

// DonutChart: uses the numeric rating (out of 5) for the fill,
// shows "X.X/5" in the center, and "Overall Rating" below.
const DonutChart = ({ value, size = "150px", thickness = "15px" }) => {
    // Convert rating (out of 5) to 0–100 for the donut fill
    const percentage = value ? (value / 5) * 100 : 0;
    // Calculate fill angle for conic-gradient
    const angle = (percentage / 100) * 360;

    return (
        <Box position="relative" width={size} height={size}>
            {/* Outer circle with gradient fill */}
            <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                borderRadius="50%"
                bg={`conic-gradient(#3182ce 0deg, #3182ce ${angle}deg, #e2e8f0 ${angle}deg 360deg)`}
            />
            {/* Inner white circle to create the donut hole */}
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width={`calc(${size} - ${thickness} * 2)`}
                height={`calc(${size} - ${thickness} * 2)`}
                borderRadius="50%"
                bg="white"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                {/* Show the rating out of 5 */}
                <Text fontSize="xl" fontWeight="bold" lineHeight="1">
                    {value ? value.toFixed(1) : "N/A"}/5
                </Text>
                {/* Label underneath */}
                <Text fontSize="sm" color="gray.600">
                    Overall Rating
                </Text>
            </Box>
        </Box>
    );
};


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
    const clarityRatingGroup = useRatingGroup({ count: 5, defaultValue: 3 });
    const engagementRatingGroup = useRatingGroup({ count: 5, defaultValue: 3 });
    const strictnessRatingGroup = useRatingGroup({ count: 5, defaultValue: 3 });
    const [isProcessingLike, setIsProcessingLike] = useState(false);
    const [likeMessages, setLikeMessages] = useState({});
    const [user, setUser] = useState(null);
    const isUofT = user?.is_uoft === true;
    const disableReviewUI = user && !isUofT;   
    const [reviewLikeDisabled, setReviewLikeDisabled] = useState({});
    const { showAlert } = useContext(AlertContext);

    
    useEffect(() => {
        const loadUser = async () => {
            const u = await getUser();
            setUser(u);
        };
        loadUser();
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            const u = await getUser();
            setUser(u);
        };
        loadUser();
        if (!professorId) return; 
        fetch(`http://127.0.0.1:8000/api/professors/${professorId}/page`)
            .then((response) => response.json())
            .then((data) => {
                setProfessor(data);
                const r = data.ratings;
                setOverallRating(r.overall);
                setClarity(r.clarity);
                setEngagement(r.engagement);
                setStrictness(r.strictness);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching professor:", error);
                setLoading(false);
            });
    }, [professorId]);

    const handleSubmitReview = async () => {
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
                engagement: engagementRatingGroup.value,
            };

            const updatedProfessor = { ...professor };
            updatedProfessor.reviews.push(reviewData);
            setProfessor(updatedProfessor);

            // POST to backend
            await axios.post(
                `http://127.0.0.1:8000/api/professors/${professorId}/reviews`,
                reviewData, {
                  withCredentials: true,
            });

            // Re-fetch updated professor info
            const refreshed = await axios.get(
                `http://127.0.0.1:8000/api/professors/${professorId}/page`
            );
            setProfessor(refreshed.data);

            // Update rating states
            const r = refreshed.data.ratings;
            setOverallRating(r.overall);
            setClarity(r.clarity);
            setEngagement(r.engagement);
            setStrictness(r.strictness);

            // Reset
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
        // If already disabled for this review, show alert
        if (reviewLikeDisabled[reviewId]) {
          showAlert("warning", "surface", "Please wait", "Please wait before attempting to like/unlike");
          return;
        }
        // Mark review as disabled for liking/unliking
        setReviewLikeDisabled(prev => ({ ...prev, [reviewId]: true }));
    
        const currentUser = await getUser();
        if (!currentUser) {
          setReviewMessage("You must be logged in to like a review.");
          setReviewLikeDisabled(prev => ({ ...prev, [reviewId]: false }));
          return;
        }
        setIsProcessingLike(true);
        try {
          // Send the like request
          const response = await axios.post(
            `http://127.0.0.1:8000/api/professors/reviews/${reviewId}/like`,
            { user_id: currentUser.id },
            { withCredentials: true }
          );
          // Update the review within professor reviews list
          const updatedProfessor = { ...professor };
          const reviewIndex = updatedProfessor.reviews.findIndex(r => r._id === reviewId);
          if (reviewIndex !== -1) {
            updatedProfessor.reviews[reviewIndex] = response.data;
            setProfessor(updatedProfessor);
            // Optionally clear like messages after some time
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
          setReviewMessage("Failed to like review. Please try again.");
        } finally {
          setIsProcessingLike(false);
          // Re-enable after a controlled delay
          setTimeout(() => {
            setReviewLikeDisabled(prev => ({ ...prev, [reviewId]: false }));
          }, 500); // You can change this value to control the delay
        }
      };
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
          await axios.delete(`http://localhost:8000/api/professors/reviews/${reviewId}`, {
            withCredentials: true, // ensures cookies/token are sent
          });
          // Remove the deleted review from local state
          setProfessor((prev) => ({
            ...prev,
            reviews: prev.reviews.filter((r) => r._id !== reviewId),
          }));
        } catch (error) {
          console.error("Failed to delete review:", error);
          setReviewMessage("Failed to delete review.");
        }
      };

    if (loading) return <Spinner size="xl" mt="20px" />;
    if (!professor) return <Text fontSize="xl" mt="20px">Professor not found.</Text>;

    // We'll show the total number of reviews in the donut area
    const totalReviews = professor?.reviews?.length || 0;

    return (
        <Flex flex="1" bg="gray.50">
            {/* Left Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: "0", md: "25%" }}
                display={{ base: "none", md: "block" }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                left="0"
            >
                <Box width="80%" ml="auto">
                    <LeftSidebar />
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                flex="1"
                ml={{ base: 0, md: "25%" }}
                bg="gray.50"
                minH="calc(100vh - 60px)"
            >
                <Container maxW="1300px" py={6} px={6}>
                    {/* Header: Professor Info & Ratings */}
                    <Flex justify="space-between" align="center">
                        {/* Professor Info (Left) */}
                        <Box>
                            <Heading size="xl">{professor.name}</Heading>
                            <Text fontSize="lg" color="gray.600">
                                {professor.department}
                            </Text>
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
                        <Box w="500px">
                            <Flex align="center" p={4} bg="white" borderRadius="md" boxShadow="md">
                                {/* Donut + number of reviews on the left */}
                                <Box mr={6} textAlign="center">
                                    <DonutChart value={overallRating} size="150px" thickness="15px" />
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                                    </Text>
                                </Box>

                                {/* Sub-ratings area with bigger bars + label on top */}
                                <VStack spacing={6} flex="1" align="stretch">
                                    {/* Clarity */}
                                    <Box>
                                        {/* Label row (label + icon on left, percentage on right) */}
                                        <Flex align="center" justify="space-between" mb={1}>
                                            <HStack spacing={1}>
                                                <Text fontWeight="semibold" fontSize="sm">
                                                    Clarity
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.700">
                                                {clarity
                                                    ? Math.round((clarity / 5) * 100) + "%"
                                                    : "0%"}
                                            </Text>
                                        </Flex>
                                        {/* Larger progress bar below */}
                                        <Progress.Root
                                            value={clarity ? (clarity / 5) * 100 : 0}
                                            colorScheme="blue"
                                            size="md"
                                            borderRadius="md"
                                        >
                                            <Progress.Track>
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>
                                    </Box>

                                    {/* Engagement */}
                                    <Box>
                                        <Flex align="center" justify="space-between" mb={1}>
                                            <HStack spacing={1}>
                                                <Text fontWeight="semibold" fontSize="sm">
                                                    Engagement
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.700">
                                                {engagement
                                                    ? Math.round((engagement / 5) * 100) + "%"
                                                    : "0%"}
                                            </Text>
                                        </Flex>
                                        <Progress.Root
                                            value={engagement ? (engagement / 5) * 100 : 0}
                                            colorScheme="blue"
                                            size="md"
                                            borderRadius="md"
                                        >
                                            <Progress.Track>
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>
                                    </Box>

                                    {/* Strictness */}
                                    <Box>
                                        <Flex align="center" justify="space-between" mb={1}>
                                            <HStack spacing={1}>
                                                <Text fontWeight="semibold" fontSize="sm">
                                                    Strictness
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.700">
                                                {strictness
                                                    ? Math.round((strictness / 5) * 100) + "%"
                                                    : "0%"}
                                            </Text>
                                        </Flex>
                                        <Progress.Root
                                            value={strictness ? (strictness / 5) * 100 : 0}
                                            colorScheme="blue"
                                            size="md"
                                            borderRadius="md"
                                        >
                                            <Progress.Track>
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>
                                    </Box>
                                </VStack>
                            </Flex>
                        </Box>
                    </Flex>

                    <Separator my={4} />

                    {/* Current & Past Courses */}
                    <Flex>
                        {/* Current Courses */}
                        <Box flex={1} mr={4}>
                            <Heading size="md" mb={2}>
                                Current Courses
                            </Heading>
                            {professor?.current_courses?.length > 0 ? (
                                <VStack spacing={2} align="stretch">
                                    {professor.current_courses.map((course, index) => (
                                        <Tag.Root
                                            key={index}
                                            colorScheme="blue"
                                            p={2}
                                            borderRadius="md"
                                        >
                                            <RouterLink to={`/course/${course._id?.$oid || course._id}`}>
                                                <Tag.Label cursor="pointer">{course.title}</Tag.Label>
                                            </RouterLink>
                                        </Tag.Root>
                                    ))}
                                </VStack>
                            ) : (
                                <Text>No current courses.</Text>
                            )}
                        </Box>

                        {/* Past Courses */}
                        <Box flex={1}>
                            <Heading size="md" mb={2}>
                                Past Courses
                            </Heading>
                            {professor?.past_courses?.length > 0 ? (
                                <VStack spacing={2} align="stretch">
                                    {professor.past_courses.map((course, index) => (
                                        <Tag.Root
                                            key={index}
                                            colorScheme="green"
                                            p={2}
                                            borderRadius="md"
                                        >
                                            <RouterLink to={`/course/${course._id?.$oid || course._id}`}>
                                                <Tag.Label cursor="pointer">{course.title}</Tag.Label>
                                            </RouterLink>
                                        </Tag.Root>
                                    ))}
                                </VStack>
                            ) : (
                                <Text>No past courses.</Text>
                            )}
                        </Box>
                    </Flex>

                    <Separator my={4} />

                    {/* Reviews Header */}
                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Student Reviews</Heading>
                        {disableReviewUI && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                            Only UofT-verified students can leave reviews.
                        </Text>
                        )}
                        <Button 
                            colorScheme="blue" 
                            onClick={() => {
                                if (!disableReviewUI) {
                                    setShowReviewForm(!showReviewForm);
                                }
                            }}
                            isDisabled={disableReviewUI}
                            opacity={disableReviewUI ? 0.6 : 1}
                            cursor={disableReviewUI ? "not-allowed" : "pointer"}
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
                                    <Text mb={2} fontWeight="medium">
                                        Overall Rating
                                    </Text>
                                    <RatingGroup.RootProvider
                                        value={overallRatingGroup}
                                        colorPalette="black"
                                        size="lg"
                                    >
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
                                    <Text mb={2} fontWeight="medium">
                                        Clarity (1-5)
                                    </Text>
                                    <RatingGroup.RootProvider
                                        value={clarityRatingGroup}
                                        colorPalette="black"
                                        size="md"
                                    >
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
                                    <Text mb={2} fontWeight="medium">
                                        Engagement (1-5)
                                    </Text>
                                    <RatingGroup.RootProvider
                                        value={engagementRatingGroup}
                                        colorPalette="black"
                                        size="md"
                                    >
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
                                    <Text mb={2} fontWeight="medium">
                                        Strictness (1-5)
                                    </Text>
                                    <RatingGroup.RootProvider
                                        value={strictnessRatingGroup}
                                        colorPalette="black"
                                        size="md"
                                    >
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
                                    <Text mb={2} fontWeight="medium">
                                        Review Content
                                    </Text>
                                    <Textarea
                                        value={reviewContent}
                                        onChange={(e) => setReviewContent(e.target.value)}
                                        placeholder="Share your experience with this professor..."
                                        size="md"
                                        rows={4}
                                    />
                                </Box>

                                {reviewMessage && <Text color="red.500">{reviewMessage}</Text>}

                                <HStack spacing={4} justify="flex-end">
                                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
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

                    {/* Reviews List */}
                    {professor?.reviews?.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {professor.reviews.map((review, index) => (
                                <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="white" position="relative">
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="md" fontWeight="bold">
                                            ⭐ {review.overall_rating}/5
                                        </Text>
                                        <HStack spacing={2}>
                                        {review.likes.includes(user?.id) ? (
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
                                            {user?.username === review.author && (
                                            <Button
                                            colorPalette="red"
                                            size="xs"
                                            onClick={() => handleDeleteReview(review._id)}
                                            >
                                            Delete
                                            </Button>
                                        )}
                                        </HStack>
                                    </Flex>
                                    {likeMessages && likeMessages[review._id] && (
                                        <Text color="green.500" fontSize="sm" mt={1}>
                                            {likeMessages[review._id]}
                                        </Text>
                                    )}
                                    {review.course_id && (
                                        <Text fontSize="sm" color="gray.500">
                                            Course: {review.course_id}
                                        </Text>
                                    )}
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
                                    <Text fontSize="sm">Strictness: {review.strictness}/5</Text>
                                    <Text fontSize="sm">Clarity: {review.clarity}/5</Text>
                                    <Text fontSize="sm">Engagement: {review.engagement}/5</Text>
                                </Box>
                            ))}
                        </VStack>
                    ) : (
                        <Text>No reviews yet.</Text>
                    )}
                </Container>
            </Box>
        </Flex>
    );
};

export default ProfessorPage;
