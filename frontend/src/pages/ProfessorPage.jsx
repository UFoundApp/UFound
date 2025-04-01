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
import { useColorMode } from "../theme/ColorModeContext";
import { useContext } from "react";
import { AlertContext } from "../components/ui/AlertContext";

// DonutChart: uses the numeric rating (out of 5) for the fill,
// shows "X.X/5" in the center, and "Overall Rating" below.
const DonutChart = ({ value, size = "150px", thickness = "15px" }) => {
  const { colorMode } = useColorMode();
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
        bg={`conic-gradient(#3182ce 0deg, #3182ce ${angle}deg, ${
          colorMode === "light" ? "#e2e8f0" : "#2D3748"
        } ${angle}deg 360deg)`}
      />
      {/* Inner circle to create the donut hole */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width={`calc(${size} - ${thickness} * 2)`}
        height={`calc(${size} - ${thickness} * 2)`}
        borderRadius="50%"
        bg={colorMode === "light" ? "white" : "gray.700"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          lineHeight="1"
          color={colorMode === "light" ? "gray.800" : "gray.100"}
        >
          {value ? value.toFixed(1) : "N/A"}/5
        </Text>
        <Text
          fontSize="sm"
          color={colorMode === "light" ? "gray.600" : "gray.400"}
        >
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
  const { colorMode } = useColorMode();
  const { showAlert } = useContext(AlertContext);

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

      // POST review to backend
      await axios.post(
        `http://127.0.0.1:8000/api/professors/${professorId}/reviews`,
        reviewData,
        { withCredentials: true }
      );

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

      // Reset form
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
    const currentUser = await getUser();
    if (!currentUser) {
      setReviewMessage("You must be logged in to like a review.");
      return;
    }
    if (!currentUser?.is_uoft) {
      showAlert(
        "error",
        "solid",
        "Restricted",
        "Only UofT students can like reviews."
      );
      return;
    }
    setIsProcessingLike(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/professors/reviews/${reviewId}/like`,
        { user_id: currentUser.id },
        { withCredentials: true }
      );
      // Update local review data
      const updatedProfessor = { ...professor };
      const reviewIndex = updatedProfessor.reviews.findIndex(
        (r) => r._id === reviewId
      );
      if (reviewIndex !== -1) {
        updatedProfessor.reviews[reviewIndex] = response.data;
        setProfessor(updatedProfessor);
        setTimeout(() => {
          setLikeMessages((prev) => {
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
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/professors/reviews/${reviewId}`, {
        withCredentials: true,
      });
      // Remove deleted review from state
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

  const totalReviews = professor?.reviews?.length || 0;

  return (
    <Flex flex="1" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
      {/* Left Sidebar */}
      <Box
        as="aside"
        width={{ base: "0", md: "25%" }}
        display={{ base: "none", md: "block" }}
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
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
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
        minH="calc(100vh - 60px)"
      >
        <Container maxW="1300px" py={6} px={6}>
          {/* Professor Info & Ratings Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading
                size="xl"
                color={colorMode === "light" ? "gray.800" : "gray.100"}
              >
                {professor.name}
              </Heading>
              <Text
                fontSize="lg"
                color={colorMode === "light" ? "gray.600" : "gray.300"}
              >
                {professor.department}
              </Text>
              {professor.profile_link && (
                <Link
                  href={professor.profile_link}
                  isExternal
                  color={colorMode === "light" ? "blue.500" : "blue.300"}
                  mt={2}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View University Profile
                </Link>
              )}
            </Box>
            <Box w="500px">
              <Flex
                align="center"
                p={4}
                bg={colorMode === "light" ? "white" : "gray.700"}
                borderRadius="md"
                boxShadow="md"
              >
                <Box mr={6} textAlign="center">
                  <DonutChart
                    value={overallRating}
                    size="150px"
                    thickness="15px"
                  />
                  <Text
                    fontSize="xs"
                    color={colorMode === "light" ? "gray.500" : "gray.400"}
                    mt={2}
                  >
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </Text>
                </Box>
                <VStack spacing={6} flex="1" align="stretch">
                  {/* Clarity */}
                  <Box>
                    <Flex align="center" justify="space-between" mb={1}>
                      <HStack spacing={1}>
                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          color={colorMode === "light" ? "gray.700" : "gray.200"}
                        >
                          Clarity
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
                      >
                        {clarity ? Math.round((clarity / 5) * 100) + "%" : "0%"}
                      </Text>
                    </Flex>
                    <Progress.Root
                      value={clarity ? (clarity / 5) * 100 : 0}
                      colorScheme="blue"
                      size="md"
                      borderRadius="md"
                    >
                      <Progress.Track
                        bg={colorMode === "light" ? "gray.100" : "gray.600"}
                      >
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                  {/* Engagement */}
                  <Box>
                    <Flex align="center" justify="space-between" mb={1}>
                      <HStack spacing={1}>
                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          color={colorMode === "light" ? "gray.700" : "gray.200"}
                        >
                          Engagement
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
                      >
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
                      <Progress.Track
                        bg={colorMode === "light" ? "gray.100" : "gray.600"}
                      >
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                  {/* Strictness */}
                  <Box>
                    <Flex align="center" justify="space-between" mb={1}>
                      <HStack spacing={1}>
                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          color={colorMode === "light" ? "gray.700" : "gray.200"}
                        >
                          Strictness
                        </Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color={colorMode === "light" ? "gray.700" : "gray.300"}
                      >
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
                      <Progress.Track
                        bg={colorMode === "light" ? "gray.100" : "gray.600"}
                      >
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                </VStack>
              </Flex>
            </Box>
          </Flex>

          <Separator
            my={4}
            borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          />

          {/* Current & Past Courses */}
          <Flex>
            <Box flex={1} mr={4}>
              <Heading
                size="md"
                mb={2}
                color={colorMode === "light" ? "gray.800" : "gray.100"}
              >
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
                      bg={colorMode === "light" ? "blue.50" : "blue.900"}
                    >
                      <RouterLink
                        to={`/course/${course._id?.$oid || course._id}`}
                      >
                        <Tag.Label
                          cursor="pointer"
                          color={colorMode === "light" ? "blue.700" : "blue.200"}
                        >
                          {course.title}
                        </Tag.Label>
                      </RouterLink>
                    </Tag.Root>
                  ))}
                </VStack>
              ) : (
                <Text color={colorMode === "light" ? "gray.500" : "gray.400"}>
                  No current courses.
                </Text>
              )}
            </Box>
            <Box flex={1}>
              <Heading
                size="md"
                mb={2}
                color={colorMode === "light" ? "gray.800" : "gray.100"}
              >
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
                      bg={colorMode === "light" ? "green.50" : "green.900"}
                    >
                      <RouterLink
                        to={`/course/${course._id?.$oid || course._id}`}
                      >
                        <Tag.Label
                          cursor="pointer"
                          color={colorMode === "light" ? "green.700" : "green.200"}
                        >
                          {course.title}
                        </Tag.Label>
                      </RouterLink>
                    </Tag.Root>
                  ))}
                </VStack>
              ) : (
                <Text color={colorMode === "light" ? "gray.500" : "gray.400"}>
                  No past courses.
                </Text>
              )}
            </Box>
          </Flex>

          <Separator
            my={4}
            borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          />

          {/* Reviews Section */}
          <Flex justify="space-between" align="center" mb={4}>
            <Heading
              size="md"
              color={colorMode === "light" ? "gray.800" : "gray.100"}
            >
              Student Reviews
            </Heading>
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
              bg={colorMode === "light" ? "blue.500" : "blue.400"}
              color="white"
              _hover={{
                bg: colorMode === "light" ? "blue.600" : "blue.500"
              }}
            >
              {showReviewForm ? "Cancel" : "Leave a Review"}
            </Button>
          </Flex>

          {/* Review Form */}
          {showReviewForm && (
            <Box
              p={5}
              border="1px"
              borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
              borderRadius="md"
              bg={colorMode === "light" ? "white" : "gray.700"}
              mb={6}
              boxShadow="md"
            >
              <VStack spacing={4} align="stretch">
                <Heading
                  size="sm"
                  color={colorMode === "light" ? "gray.800" : "gray.100"}
                >
                  Write Your Review
                </Heading>
                <Box>
                  <Text
                    mb={2}
                    fontWeight="medium"
                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                  >
                    Overall Rating
                  </Text>
                  <RatingGroup.RootProvider
                    value={overallRatingGroup}
                    colorPalette={colorMode === "light" ? "black" : "yellow"}
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
                  <Text
                    mb={2}
                    fontWeight="medium"
                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                  >
                    Clarity (1-5)
                  </Text>
                  <RatingGroup.RootProvider
                    value={clarityRatingGroup}
                    colorPalette={colorMode === "light" ? "black" : "yellow"}
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
                  <Text
                    mb={2}
                    fontWeight="medium"
                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                  >
                    Engagement (1-5)
                  </Text>
                  <RatingGroup.RootProvider
                    value={engagementRatingGroup}
                    colorPalette={colorMode === "light" ? "black" : "yellow"}
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
                  <Text
                    mb={2}
                    fontWeight="medium"
                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                  >
                    Strictness (1-5)
                  </Text>
                  <RatingGroup.RootProvider
                    value={strictnessRatingGroup}
                    colorPalette={colorMode === "light" ? "black" : "yellow"}
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
                  <Text
                    mb={2}
                    fontWeight="medium"
                    color={colorMode === "light" ? "gray.700" : "gray.200"}
                  >
                    Review Content
                  </Text>
                  <Textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your experience with this professor..."
                    size="md"
                    rows={4}
                    bg={colorMode === "light" ? "white" : "gray.600"}
                    color={colorMode === "light" ? "gray.800" : "gray.100"}
                    borderColor={colorMode === "light" ? "gray.200" : "gray.500"}
                    _placeholder={{
                      color:
                        colorMode === "light" ? "gray.400" : "gray.300"
                    }}
                  />
                </Box>
                {reviewMessage && <Text color="red.500">{reviewMessage}</Text>}
                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    color={colorMode === "light" ? "gray.600" : "gray.200"}
                    borderColor={
                      colorMode === "light" ? "gray.300" : "gray.500"
                    }
                    _hover={{
                      bg: colorMode === "light" ? "gray.50" : "gray.600"
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSubmitReview}
                    isLoading={isSubmitting}
                    bg={colorMode === "light" ? "blue.500" : "blue.400"}
                    color="white"
                    _hover={{
                      bg: colorMode === "light" ? "blue.600" : "blue.500"
                    }}
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
                <Box
                  key={index}
                  p={4}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "gray.200" : "gray.600"
                  }
                  borderRadius="md"
                  bg={colorMode === "light" ? "white" : "gray.700"}
                  position="relative"
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={
                        colorMode === "light" ? "gray.800" : "gray.100"
                      }
                    >
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
                          color={
                            colorMode === "light" ? "inherit" : "gray.300"
                          }
                        />
                      )}
                      <Text
                        color={
                          colorMode === "light" ? "gray.600" : "gray.300"
                        }
                      >
                        {review.likes.length}
                      </Text>
                      {user?.is_uoft && (
                        <ReportDialog
                          endpoint={`http://localhost:8000/api/professors/reviews/${review._id}/report`}
                          postId={review._id}
                          type="professor"
                          setMessage={setReviewMessage}
                          setIsError={() => {}}
                        />
                      )}
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
                    <Text
                      fontSize="sm"
                      color={
                        colorMode === "light" ? "gray.500" : "gray.400"
                      }
                    >
                      Course: {review.course_id}
                    </Text>
                  )}
                  <Text
                    mt={2}
                    color={
                      colorMode === "light" ? "gray.700" : "gray.300"
                    }
                  >
                    By{" "}
                    <Link to={`/profile/${review.author}`}>
                      <Text
                        as="span"
                        fontWeight="medium"
                        color={
                          colorMode === "light" ? "blue.500" : "blue.300"
                        }
                        _hover={{ textDecoration: "underline" }}
                      >
                        {review.author}
                      </Text>
                    </Link>{" "}
                    | {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                  <Separator
                    my={2}
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.600"
                    }
                  />
                  <Text
                    fontSize="sm"
                    color={
                      colorMode === "light" ? "gray.600" : "gray.300"
                    }
                  >
                    Strictness: {review.strictness}/5
                  </Text>
                  <Text
                    fontSize="sm"
                    color={
                      colorMode === "light" ? "gray.600" : "gray.300"
                    }
                  >
                    Clarity: {review.clarity}/5
                  </Text>
                  <Text
                    fontSize="sm"
                    color={
                      colorMode === "light" ? "gray.600" : "gray.300"
                    }
                  >
                    Engagement: {review.engagement}/5
                  </Text>
                  <Text
                    mt={3}
                    color={colorMode === "light" ? "gray.800" : "gray.200"}
                  >
                    {review.content}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text
              color={colorMode === "light" ? "gray.500" : "gray.400"}
            >
              No reviews yet.
            </Text>
          )}
        </Container>
      </Box>
    </Flex>
  );
};

export default ProfessorPage;