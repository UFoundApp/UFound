import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  Spinner,
  Tabs
} from "@chakra-ui/react";
import axios from "axios";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { getUser } from './AuthPageUtil';
import { useColorMode } from '../theme/ColorModeContext';

const AdminFlaggedPage = () => {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedComments, setFlaggedComments] = useState([]);
  const [flaggedCourseReviews, setFlaggedCourseReviews] = useState([]);
  const [flaggedProfessorReviews, setFlaggedProfessorReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  useEffect(() => {
    async function checkAdminAndFetch() {
      const user = await getUser();
      if (!user?.is_admin) {
        navigate("/", { replace: true });
      } else {
        await fetchData();
        setLoading(false);
      }
    }

    const fetchData = async () => {
      try {
        const [posts, comments, courseReviews, profReviews] = await Promise.all([
          axios.get("http://localhost:8000/api/admin/flagged/posts"),
          axios.get("http://localhost:8000/api/admin/flagged/comments"),
          axios.get("http://localhost:8000/api/admin/flagged/course-reviews"),
          axios.get("http://localhost:8000/api/admin/flagged/professor-reviews"),
        ]);

        setFlaggedPosts(posts.data);
        setFlaggedComments(comments.data);
        setFlaggedCourseReviews(courseReviews.data);
        setFlaggedProfessorReviews(profReviews.data);
      } catch (err) {
        console.error("Failed to fetch flagged content:", err);
      }
    };

    checkAdminAndFetch();
  }, [navigate]);

  if (loading) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        direction="column"
      >
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
        <Heading size="md" color={colorMode === 'light' ? 'gray.700' : 'gray.200'}>
          Verifying Admin Access...
        </Heading>
        <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
          Hang tight while we load the admin panel.
        </Text>
      </Flex>
    );
  }
  
  return (
    <Flex flex="1" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
      {/* Left Sidebar */}
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

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: 0, md: '27%' }}
        mr={{ base: 0, md: '20%' }}
        mt={6}
        mb={6}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        minH="calc(100vh - 60px)"
      >
        <Heading size="lg" mb={6} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
          Flagged Content (Admin)
        </Heading>

        <Tabs.Root defaultValue="posts" variant="line">

          <Tabs.List 
            as={Flex} 
            gap={4} 
            flexWrap="wrap" 
            mb={6}
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            p={3}
            borderRadius="lg"
            boxShadow="sm"
          >
            <Tabs.Trigger 
              value="posts" 
              px={4} 
              py={3}
              borderRadius="md" 
              bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
              _hover={{ 
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
              _selected={{
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                color: 'blue.500',
                boxShadow: 'sm'
              }}
              color={colorMode === 'light' ? 'gray.700' : 'gray.100'}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              minW="150px"
              justifyContent="center"
            >
              <Box as={LuUser} fontSize="18px" />
              <Text ml={2} fontWeight="medium">Flagged Posts</Text>
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="comments" 
              px={4} 
              py={3}
              borderRadius="md" 
              bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
              _hover={{ 
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
              _selected={{
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                color: 'blue.500',
                boxShadow: 'sm'
              }}
              color={colorMode === 'light' ? 'gray.700' : 'gray.100'}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              minW="150px"
              justifyContent="center"
            >
              <Box as={LuFolder} fontSize="18px" />
              <Text ml={2} fontWeight="medium">Flagged Comments</Text>
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="courseReviews" 
              px={4} 
              py={3}
              borderRadius="md" 
              bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
              _hover={{ 
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
              _selected={{
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                color: 'blue.500',
                boxShadow: 'sm'
              }}
              color={colorMode === 'light' ? 'gray.700' : 'gray.100'}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              minW="150px"
              justifyContent="center"
            >
              <Box as={LuSquareCheck} fontSize="18px" />
              <Text ml={2} fontWeight="medium">Course Reviews</Text>
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="professorReviews" 
              px={4} 
              py={3}
              borderRadius="md" 
              bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
              _hover={{ 
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
              _selected={{
                bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
                color: 'blue.500',
                boxShadow: 'sm'
              }}
              color={colorMode === 'light' ? 'gray.700' : 'gray.100'}
              transition="all 0.2s"
              display="flex"
              alignItems="center"
              minW="150px"
              justifyContent="center"
            >
              <Box as={LuSquareCheck} fontSize="18px" />
              <Text ml={2} fontWeight="medium">Professor Reviews</Text>
            </Tabs.Trigger>
          </Tabs.List>
        
          {/* Posts */}
          <Tabs.Content value="posts">

            {flaggedPosts.length === 0 ? (
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                No flagged posts.
              </Text>
            ) : (
              flaggedPosts.map((post) => (
                <Box 
                  key={post._id} 
                  p={4} 
                  bg={colorMode === 'light' ? 'white' : 'gray.700'} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                  mb={4}
                >
                  <Text fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
                    {post.title}
                  </Text>
                  <Text mt={1} color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
                    {post.content}
                  </Text>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    mr={2} 
                    onClick={() => axios.delete(`http://localhost:8000/api/admin/posts/${post._id}`).then(() => window.location.reload())}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post._id}/unflag`).then(() => window.location.reload())}
                  >
                    Unflag
                  </Button>

                  {post.reports && post.reports.length > 0 && (
                    <Box 
                      mt={4} 
                      borderTop="1px solid" 
                      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} 
                      pt={2}
                    >
                      <Text 
                        fontWeight="semibold" 
                        mb={2}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                      >
                        Reports:
                      </Text>
                      {post.reports.map((report, idx) => (
                        <Box key={idx} mb={2}>
                          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                            Reported by: <Link to={`/profile/${report.user_name}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{report.user_name}</Link> 
                          </Text>
                          <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}

          </Tabs.Content>

          {/* Comments */}
          <Tabs.Content value="comments">

            {flaggedComments.length === 0 ? (
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                No flagged comments.
              </Text>
            ) : (
              flaggedComments.map(({ post_id, comment }) => (
                <Box 
                  key={comment.id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  mb={4} 
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                >
                  <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
                    {comment.content}
                  </Text>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    mr={2} 
                    onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post_id}/comments/${comment.id}/delete`).then(() => window.location.reload())}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post_id}/comments/${comment.id}/unflag`).then(() => window.location.reload())}
                  >
                    Unflag
                  </Button>

                  {comment.author_name.toLowerCase() === "anonymous" ? (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                      Author: {comment.author_name} · {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                      Author: <Link to={`/profile/${comment.author_name}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{comment.author_name}</Link> · {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  )}

                  {comment.reports && comment.reports.length > 0 && (
                    <Box 
                      mt={4} 
                      borderTop="1px solid" 
                      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} 
                      pt={2}
                    >
                      <Text 
                        fontWeight="semibold" 
                        mb={2}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                      >
                        Reports:
                      </Text>
                      {comment.reports.map((report, rIdx) => (
                        <Box key={rIdx} mb={2}>
                          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                            Reported by: <Link to={`/profile/${report.user_name}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{report.user_name}</Link> 
                          </Text>
                          <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Tabs.Content>


          {/* Course Reviews */}
          <Tabs.Content value="courseReviews">

            {flaggedCourseReviews.length === 0 ? (
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                No flagged course reviews.
              </Text>
            ) : (
              flaggedCourseReviews.map((review) => (
                <Box 
                  key={review._id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  mb={4} 
                  bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                >
                  <Text 
                    fontWeight="bold" 
                    mb={1}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                  >
                    Course: {review.course_title}
                  </Text>
                  <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
                    {review.content}
                  </Text>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    mr={2} 
                    onClick={() => axios.delete(`http://localhost:8000/api/admin/courses/${review.course_id}/reviews/${review.review_index}`).then(() => window.location.reload())}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => axios.post(`http://localhost:8000/api/admin/courses/${review.course_id}/reviews/${review.review_index}/unflag`).then(() => window.location.reload())}
                  >
                    Unflag
                  </Button>
                   
                  {review.author.toLowerCase() === "anonymous" ? (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                      Author: {review.author} · {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                      Author: <Link to={`/profile/${review.author}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{review.author}</Link> · {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  )}

                  {review.reports && review.reports.length > 0 && (
                    <Box 
                      mt={4} 
                      borderTop="1px solid" 
                      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} 
                      pt={2}
                    >
                      <Text 
                        fontWeight="semibold" 
                        mb={2}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                      >
                        Reports:
                      </Text>
                      {review.reports.map((r, idx) => (
                        <Box key={idx} mb={2}>
                          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                            Reported by: <Link to={`/profile/${r.user_name}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{r.user_name}</Link> 
                          </Text>
                          <Text fontSize="sm" color="red.500">Reason: {r.reason}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}

          </Tabs.Content>

          {/* Professor Reviews */}
          <Tabs.Content value="professorReviews">

            {flaggedProfessorReviews.length === 0 ? (
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                No flagged professor reviews.
              </Text>
            ) : (
              flaggedProfessorReviews.map((review) => (
                <Box 
                  key={review._id} 
                  p={4} 
                  bg={colorMode === 'light' ? 'white' : 'gray.700'} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
                  mb={4}
                >
                  <Text 
                    fontWeight="bold" 
                    mb={1}
                    color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                  >
                    Professor: {review.professor_name}
                  </Text>
                  <Text color={colorMode === 'light' ? 'gray.700' : 'gray.300'}>
                    {review.content}
                  </Text>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    mr={2} 
                    onClick={() => axios.delete(`http://localhost:8000/api/admin/professors/reviews/${review._id}`).then(() => window.location.reload())}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => axios.post(`http://localhost:8000/api/admin/professors/reviews/${review._id}/unflag`).then(() => window.location.reload())}
                  >
                    Unflag
                  </Button>

                  {review.author.toLowerCase() === "anonymous" ? (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                      Author: {review.author} · {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                      Author: <Link to={`/profile/${review.author}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{review.author}</Link> · {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  )}

                  {review.reports && review.reports.length > 0 && (
                    <Box 
                      mt={4} 
                      borderTop="1px solid" 
                      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} 
                      pt={2}
                    >
                      <Text 
                        fontWeight="semibold" 
                        mb={2}
                        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
                      >
                        Reports:
                      </Text>
                      {review.reports.map((report, idx) => (
                        <Box key={idx} mb={2}>
                          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={2}>
                            Reported by: <Link to={`/profile/${report.user_name}`} style={{ color: colorMode === 'light' ? "#3182ce" : "#63B3ED" }}>{report.user_name}</Link> 
                          </Text>
                          <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}

          </Tabs.Content>
        </Tabs.Root>
      </Box>

      {/* Right Sidebar */}
      <Box
        as="aside"
        width={{ base: '0', md: '18%' }}
        display={{ base: 'none', md: 'block' }}
        position="fixed"
        right="0"
        top="60px"
        height="calc(100vh - 60px)"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        pr={4}
      >
        <RightSidebar />
      </Box>
    </Flex>
  );
};

export default AdminFlaggedPage;
