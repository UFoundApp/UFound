import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  Field,
  Button,
  RatingGroup,
  useRatingGroup,
} from '@chakra-ui/react';
import LeftSidebar from './LeftSidebar';
import RatingInput from './RatingInput';
import { FaPlusCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../components/AuthPageUtil';
import ReportDialog from '../Posts/Reporting.jsx';
import dayjs from 'dayjs';
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
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [alertConfirm, setAlertConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { colorMode } = useColorMode();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessingLike, setIsProcessingLike] = useState(false);
  const isUofT = currentUser?.is_uoft === true;
  const disableReviewUI = currentUser && !isUofT;
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUser();
      setCurrentUser(userData);
    }
    fetchUser();
  }, []);

  const fetchCourse = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/courses/${courseId}`);
      setOverallRating(
        Math.floor(
          (response.data.ratings.average_rating_E +
            response.data.ratings.average_rating_MD +
            response.data.ratings.average_rating_AD) / 3
        )
      );
      console.log(response.data);
      setCourse(response.data);
    } catch (error) {
      setMessage("Failed to load course.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const sendReview = async ({ newReview }) => {
    try {
      await axios.post(`http://localhost:8000/api/courses/${courseId}/review`, newReview);
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
  }, [courseId, fetchCourse]);

  const handleAddReview = async () => {
    if (!review.trim()) {
      setMessage("Review cannot be empty.");
      setIsError(true);
      return;
    }

    if (ratingE.value === 0 || ratingMD.value === 0 || ratingAD.value === 0) {
      setMessage("Rating cannot be empty.");
      setIsError(true);
      return;
    }

    const user = await getUser();
    if (!user.username && !user.email) {
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
      author: user.username || "Anonymous",
    };


    const handleDeleteReview = async (reviewIndex) => {
        setIsDeletingReview(true);

        try {
            // Wait for the user to confirm the action
            const confirmed = await showAlert(
                'warning',
                'surface',
                'Are you sure?',
                'This action cannot be undone.',
                'popup',
                async () => {
                setAlertConfirm(true); // This will run when "Yes" is clicked
                }
            );
        
            // If confirmed is true (i.e., user clicked "Yes"), proceed with deletion
            if (confirmed) {
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
            } else {
                console.log("User canceled the deletion.");
            }
        } catch (error) {
            console.error("Failed to delete review:", error.response?.data || error.message);
            setMessage("Failed to delete review.");
            setIsError(true);
        } finally {
            setIsDeletingReview(false);
            setTimeout(() => setMessage(""), 3000);
        }

    setIsPostingReview(true);
    await sendReview({ newReview });
    await fetchCourse();
  };


  const handleDeleteReview = async (reviewIndex) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/courses/${courseId}/reviews/${reviewIndex}`, {
        withCredentials: true,
      });
      // Update the course state by filtering out the deleted review
      setCourse((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((_, idx) => idx !== reviewIndex),
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
    );
  } else {
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
          <Heading
            as="h1"
            size="lg"
            mb={3}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            {course.title}
          </Heading>
          <Text
            fontSize="md"
            color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
            mb={4}
          >
            {course.description}
          </Text>

          <Box
            borderBottom="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
            my={4}
          />

          {/* Course Details */}
          <Text
            fontSize="md"
            fontWeight="bold"
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Prerequisites:
          </Text>
          <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {course.prerequisites || "None"}
          </Text>

          <Text
            fontSize="md"
            fontWeight="bold"
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Exclusions:
          </Text>
          <Text mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {course.exclusion || "None"}
          </Text>

          <Text
            fontSize="md"
            fontWeight="bold"
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Distribution:
          </Text>
          <Text mb={4} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
            {course.distribution || "N/A"}
          </Text>

          <Box
            borderBottom="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
            my={4}
          />

          {/* Professors Section */}
          <Heading
            as="h2"
            size="md"
            mb={3}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Professors
          </Heading>
          <VStack spacing={2} align="stretch">
            {course.professors.length > 0 ? (
              course.professors.map((prof, index) => (
                <Link key={index} to={`/professors/${prof.id}`}>
                  <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                    bg={colorMode === 'light' ? 'white' : 'gray.700'}
                    _hover={{
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.600',
                      cursor: "pointer",
                    }}
                  >
                    <Text
                      fontWeight="bold"
                      color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    >
                      {prof.name}
                    </Text>
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                      {prof.department}
                    </Text>
                  </Box>
                </Link>
              ))
            ) : (
              <Text
                fontStyle="italic"
                color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
              >
                No professors listed.
              </Text>
            )}
          </VStack>
          <Box
            borderBottom="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
            my={4}
          />

          {overallRating === 0 ? (
            <Text
              fontStyle="italic"
              color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
            >
              No reviews yet
            </Text>
          ) : (
            <div>
              <HStack>
                <Heading
                  as="h2"
                  size="md"
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                >
                  Overall Rating:
                </Heading>
                <RatingGroup.Root
                  readOnly
                  colorPalette="yellow"
                  count={5}
                  value={overallRating}
                  size="lg"
                >
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
                <Text
                  fontSize="lg"
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                >
                  Engagement:
                </Text>
                <RatingGroup.Root
                  readOnly
                  count={5}
                  ml={2}
                  value={course.ratings.average_rating_E}
                  size="md"
                >
                  <RatingGroup.HiddenInput />
                  <RatingGroup.Control>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingGroup.Item key={index} index={index + 1}>
                        <RatingGroup.ItemIndicator />
                      </RatingGroup.Item>
                    ))}
                  </RatingGroup.Control>
                </RatingGroup.Root>

                <Text
                  fontSize="lg"
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                >
                  Material Difficulty:
                </Text>
                <RatingGroup.Root
                  readOnly
                  count={5}
                  ml={2}
                  value={course.ratings.average_rating_MD}
                  size="md"
                >
                  <RatingGroup.HiddenInput />
                  <RatingGroup.Control>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingGroup.Item key={index} index={index + 1}>
                        <RatingGroup.ItemIndicator />
                      </RatingGroup.Item>
                    ))}
                  </RatingGroup.Control>
                </RatingGroup.Root>

                <Text
                  fontSize="lg"
                  color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                >
                  Assessment Difficulty:
                </Text>
                <RatingGroup.Root
                  readOnly
                  count={5}
                  ml={2}
                  value={course.ratings.average_rating_AD}
                  size="md"
                >
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
          <Box
            borderBottom="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
            my={4}
          />

          {/* Reviews Section */}
          <Heading
            as="h2"
            size="md"
            mt={5}
            mb={3}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Leave a Review
          </Heading>
          {disableReviewUI && (
            <Text fontSize="sm" color="red.500" mb={2}>
              Only UofT-verified students can leave course reviews.
            </Text>
          )}
          <VStack
            mt={4}
            position="relative"
            alignItems="start"
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'}
            borderWidth="1px"
            p={4}
            borderRadius="md"
            opacity={disableReviewUI ? 0.5 : 1}
            pointerEvents={disableReviewUI ? "none" : "auto"}
          >
            <Heading as="h2" size="sm" mt={1} mb={1}>
              Engagement:
            </Heading>
            <RatingInput rating={ratingE} size="lg" isDisabled={disableReviewUI} />

            <Heading as="h2" size="sm" mt={1} mb={1}>
              Material Difficulty:
            </Heading>
            <RatingInput rating={ratingMD} size="lg" isDisabled={disableReviewUI} />

            <Heading as="h2" size="sm" mt={1} mb={1}>
              Assessment Difficulty:
            </Heading>
            <RatingInput rating={ratingAD} size="lg" isDisabled={disableReviewUI} />

            <Field.Root invalid={isError}>
              <Textarea
                placeholder="Write a review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                isDisabled={isPostingReview}
                errorText={isError ? message : ""}
                bg={colorMode === 'light' ? 'white' : 'gray.600'}
                color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.500'}
                _placeholder={{
                  color: colorMode === 'light' ? 'gray.400' : 'gray.300',
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
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.500',
                }}
              >
                Reset
              </Button>
              <Button
                alignContent={"end"}
                onClick={handleAddReview}
                aria-label="Add Review"
                loading={isPostingReview}
                isDisabled={isPostingReview || disableReviewUI}
                loadingText="Adding Review"
                mt={2}
                bg={colorMode === 'light' ? 'blue.500' : 'blue.400'}
                color="white"
                _hover={{
                  bg: colorMode === 'light' ? 'blue.600' : 'blue.500',
                }}
              >
                Add Review
              </Button>
            </HStack>
          </VStack>

          <Heading
            as="h2"
            size="md"
            mt={5}
            mb={3}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          >
            Reviews
          </Heading>
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
                    <HStack spacing={2}>
                      {r.likes?.includes(currentUser?.id) ? (
                        <FaHeart
                          color="red"
                          cursor="pointer"
                          onClick={async () => {
                            if (isProcessingLike) return;
                            setIsProcessingLike(true);
                            try {
                              await axios.post(
                                `http://127.0.0.1:8000/api/courses/reviews/${courseId}/${index}/unlike`,
                                {},
                                { withCredentials: true }
                              );
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
                              await axios.post(
                                `http://127.0.0.1:8000/api/courses/reviews/${courseId}/${index}/like`,
                                {},
                                { withCredentials: true }
                              );
                              await fetchCourse();
                            } catch (err) {
                              if (err.response?.status === 401 || err.response?.status === 403) {
                                showAlert(
                                  "error",
                                  "solid",
                                  "Unauthorized",
                                  "Only UofT students can like reviews."
                                );
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
                      {currentUser?.is_uoft && (
                        <ReportDialog
                          endpoint={`http://localhost:8000/api/courses/reviews/${courseId}/${index}/report`}
                        />
                      )}
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
                  <Link to={`/profile/${r.author}`}>
                    <Text
                      fontWeight="bold"
                      _hover={{ textDecoration: "underline", color: "blue.500" }}
                      color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    >
                      {r.author}
                    </Text>
                  </Link>
                  <RatingGroup.Root
                    readOnly
                    count={5}
                    value={Math.floor((r.ratingE + r.ratingMD + r.ratingAD) / 3)}
                    size="sm"
                  >
                    <RatingGroup.HiddenInput />
                    <RatingGroup.Label
                      mr={2}
                      color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                    >
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
                  <Text
                    fontSize="sm"
                    color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
                  >
                    {new Date(r.created_at).toLocaleString()}
                  </Text>
                  <Text
                    mt={2}
                    color={colorMode === 'light' ? 'gray.700' : 'gray.300'}
                  >
                    {r.content}
                  </Text>
                </Box>
              ))
            ) : (
              <Text
                fontStyle="italic"
                color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
              >
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