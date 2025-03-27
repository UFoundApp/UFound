import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
} from "@chakra-ui/react";
import {
  TabsRoot,
  TabList,
  TabTrigger,
  TabContent
} from "@ark-ui/react/tabs";
import axios from "axios";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { Button } from "@chakra-ui/react";

const AdminFlaggedPage = () => {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedComments, setFlaggedComments] = useState([]);
  const [flaggedCourseReviews, setFlaggedCourseReviews] = useState([]);
  const [flaggedProfessorReviews, setFlaggedProfessorReviews] = useState([]);

  useEffect(() => {
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

    fetchData();
  }, []);

  return (
    <Flex flex="1" bg="gray.50">
      {/* Left Sidebar */}
      <Box
        as="aside"
        width={{ base: '0', md: '25%' }}
        display={{ base: 'none', md: 'block' }}
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
        ml={{ base: 0, md: '27%' }}
        mr={{ base: 0, md: '5%' }}
        mt={6}
        mb={6}
        bg="gray.50"
        minH="calc(100vh - 60px)"
      >
        <Heading size="lg" mb={6}>Flagged Content (Admin)</Heading>

        <TabsRoot defaultValue="posts" variant="line">
        <TabList as={Flex} gap={4} flexWrap="wrap" mb={4}>
        <TabTrigger value="posts" px={4} py={2} borderRadius="md" _hover={{ bg: "gray.100" }}>
            <LuUser />
            <Text ml={2}>Flagged Posts</Text>
        </TabTrigger>
        <TabTrigger value="comments" px={4} py={2} borderRadius="md" _hover={{ bg: "gray.100" }}>
            <LuFolder />
            <Text ml={2}>Flagged Comments</Text>
        </TabTrigger>
        <TabTrigger value="courseReviews" px={4} py={2} borderRadius="md" _hover={{ bg: "gray.100" }}>
            <LuSquareCheck />
            <Text ml={2}>Course Reviews</Text>
        </TabTrigger>
        <TabTrigger value="professorReviews" px={4} py={2} borderRadius="md" _hover={{ bg: "gray.100" }}>
            <LuSquareCheck />
            <Text ml={2}>Professor Reviews</Text>
        </TabTrigger>
        </TabList>
        
          {/* Posts */}
            <TabContent value="posts">
            {flaggedPosts.length === 0 ? (
                <Text>No flagged posts.</Text>
            ) : (
                flaggedPosts.map((post) => (
                <Box key={post._id} p={4} bg="white" borderRadius="md" borderWidth="1px" mb={4}>
                    <Text fontWeight="bold">{post.title}</Text>
                    <Text mt={1}>{post.content}</Text>
                    <Button size="sm" colorScheme="red" mr={2} onClick={() => axios.delete(`http://localhost:8000/api/admin/posts/${post._id}`).then(() => window.location.reload())}>Delete</Button>
                    <Button size="sm" colorScheme="blue" onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post._id}/unflag`).then(() => window.location.reload())}>Unflag</Button>

                    {post.reports && post.reports.length > 0 && (
                    <Box mt={4} borderTop="1px solid #e2e8f0" pt={2}>
                        <Text fontWeight="semibold" mb={2}>Reports:</Text>
                        {post.reports.map((report, idx) => (
                        <Box key={idx} mb={2}>
                            <Text fontSize="sm" color="gray.600">Reported by: {report.user_name}</Text>
                            <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                        ))}
                    </Box>
                    )}
                </Box>
                ))
            )}
            </TabContent>

            {/* Comments */}
            <TabContent value="comments">
            {flaggedComments.length === 0 ? (
              <Text>No flagged comments.</Text>
            ) : (
              flaggedComments.map(({ post_id, comment }) => (
                <Box key={comment.id} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="white">
                  <Text>{comment.content}</Text>
                  <Button size="sm" colorScheme="red" mr={2} onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post_id}/comments/${comment.id}/delete`).then(() => window.location.reload())}>Delete</Button>
                  <Button size="sm" colorScheme="blue" onClick={() => axios.post(`http://localhost:8000/api/admin/posts/${post_id}/comments/${comment.id}/unflag`).then(() => window.location.reload())}>Unflag</Button>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Author: {comment.author_name} · {new Date(comment.created_at).toLocaleDateString()}
                  </Text>
                  {comment.reports && comment.reports.length > 0 && (
                    <Box mt={4} borderTop="1px solid #e2e8f0" pt={2}>
                      <Text fontWeight="semibold" mb={2}>Reports:</Text>
                      {comment.reports.map((report, rIdx) => (
                        <Box key={rIdx} mb={2}>
                          <Text fontSize="sm" color="gray.600">Reported by: {report.user_name}</Text>
                          <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </TabContent>



          {/* Course Reviews */}
            <TabContent value="courseReviews">
            {flaggedCourseReviews.length === 0 ? (
                <Text>No flagged course reviews.</Text>
            ) : (
                flaggedCourseReviews.map((review) => (
                <Box key={review._id} p={4} borderWidth="1px" borderRadius="md" mb={4} bg="white">
                    <Text fontWeight="bold" mb={1}>Course: {review.course_title}</Text>
                    <Text>{review.content}</Text>
                    <Button size="sm" colorScheme="red" mr={2} onClick={() => axios.delete(`http://localhost:8000/api/admin/courses/${review.course_id}/reviews/${review.review_index}`).then(() => window.location.reload())}>Delete</Button>
                    <Button size="sm" colorScheme="blue" onClick={() => axios.post(`http://localhost:8000/api/admin/courses/${review.course_id}/reviews/${review.review_index}/unflag`).then(() => window.location.reload())}>Unflag</Button>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                    Author: {review.author} · {new Date(review.created_at).toLocaleDateString()}
                    </Text>

                    {review.reports && review.reports.length > 0 && (
                    <Box mt={4} borderTop="1px solid #e2e8f0" pt={2}>
                        <Text fontWeight="semibold" mb={2}>Reports:</Text>
                        {review.reports.map((r, idx) => (
                        <Box key={idx} mb={2}>
                            <Text fontSize="sm" color="gray.600">Reported by: {r.user_name}</Text>
                            <Text fontSize="sm" color="red.500">Reason: {r.reason}</Text>
                        </Box>
                        ))}
                    </Box>
                    )}
                </Box>
                ))
            )}
            </TabContent>

            {/* Professor Reviews */}
            <TabContent value="professorReviews">
            {flaggedProfessorReviews.length === 0 ? (
                <Text>No flagged professor reviews.</Text>
            ) : (
                flaggedProfessorReviews.map((review) => (
                <Box key={review._id} p={4} bg="white" borderRadius="md" borderWidth="1px" mb={4}>
                    <Text fontWeight="bold" mb={1}>Professor: {review.professor_name}</Text>
                    <Text>{review.content}</Text>
                    <Button size="sm" colorScheme="red" mr={2} onClick={() => axios.delete(`http://localhost:8000/api/admin/professors/reviews/${review._id}`).then(() => window.location.reload())}>Delete</Button>
                    <Button size="sm" colorScheme="blue" onClick={() => axios.post(`http://localhost:8000/api/admin/professors/reviews/${review._id}/unflag`).then(() => window.location.reload())}>Unflag</Button>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                    Author: {review.author} · {new Date(review.created_at).toLocaleDateString()}
                    </Text>

                    {review.reports && review.reports.length > 0 && (
                    <Box mt={4} borderTop="1px solid #e2e8f0" pt={2}>
                        <Text fontWeight="semibold" mb={2}>Reports:</Text>
                        {review.reports.map((report, idx) => (
                        <Box key={idx} mb={2}>
                            <Text fontSize="sm" color="gray.600">Reported by: {report.user_name}</Text>
                            <Text fontSize="sm" color="red.500">Reason: {report.reason}</Text>
                        </Box>
                        ))}
                    </Box>
                    )}
                </Box>
                ))
            )}
            </TabContent>



        </TabsRoot>
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
        bg="gray.50"
        pr={4}
      >
        <RightSidebar />
      </Box>
    </Flex>
  );
};

export default AdminFlaggedPage;
