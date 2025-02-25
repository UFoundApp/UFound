import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box, Heading, Text, Link, VStack, SimpleGrid, Spinner, Container, Separator, Flex
} from "@chakra-ui/react";
import { Tag } from "@chakra-ui/react";  // ✅ Updated import
import { Progress } from "@chakra-ui/react";  // ✅ Updated import
import LeftSidebar from "../components/LeftSidebar";

const ProfessorPage = () => {
    const { professorId } = useParams();
    const [professor, setProfessor] = useState(null);
    const [overallRating, setOverallRating] = useState(null);
    const [clarity, setClarity] = useState(null);
    const [engagement, setEngagement] = useState(null);
    const [strictness, setStrictness] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Spinner size="xl" mt="20px" />;
    if (!professor) return <Text fontSize="xl" mt="20px">Professor not found.</Text>;

    return (
        <Flex>
            {/* ✅ Left Sidebar */}
            <Box w="345px">
                <LeftSidebar />
            </Box>

            {/* ✅ Main Content */}
            <Container maxW="1300px" py={6} ml="50px">
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

                <Heading size="md" mb={2}>Student Reviews</Heading>
                {professor.reviews.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                        {professor.reviews.map((review, index) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
                                <Text fontSize="md" fontWeight="bold">⭐ {review.overall_rating}/5</Text>
                                {review.course_id && <Text fontSize="sm" color="gray.500">Course: {review.course_id}</Text>}
                                <Text mt={2}>{review.content}</Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>By {review.author} | {new Date(review.created_at).toLocaleDateString()}</Text>
                                <Separator my={2} />
                                <Text fontSize="sm">Strictness: {review.strictness}/10</Text>
                                <Text fontSize="sm">Clarity: {review.clarity}/10</Text>
                                <Text fontSize="sm">Engagement: {review.engagement}/10</Text>
                            </Box>
                        ))}
                    </VStack>
                ) : <Text>No reviews yet.</Text>}
            </Container>
        </Flex>
    );
};

export default ProfessorPage;
