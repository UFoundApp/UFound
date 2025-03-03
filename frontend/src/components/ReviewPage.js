import React, { useEffect, useState, useRef } from "react";
import { Box, Text, VStack, Link, Spinner } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const ReviewPage = () => {
  const [courses, setCourses] = useState([]); // Store courses
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(true); // Check if more courses exist
  const [page, setPage] = useState(0); // Track current page
  const loaderRef = useRef(null); // Reference to loader element

  // Function to fetch courses with pagination
  async function fetchCourses() {
    if (!hasMore || loading) return; // Stop fetching if no more data

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/courses?skip=${page * 10}&limit=10`);
      const data = await response.json();

      if (data.length === 0) {
        setHasMore(false); // No more courses left to load
      } else {
        setCourses((prev) => [...prev, ...data]); // Append new courses
        setPage((prev) => prev + 1); // Move to the next page
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
    setLoading(false);
  }

  // Infinite Scroll Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchCourses();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, []);

  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold">Course Reviews</Text>
      <VStack spacing={4} mt={4} align="stretch">
        {courses.map((course) => (
          <Link as={RouterLink} to={`/course/${course._id}`} key={course._id}>
          <Box p={4} border="1px" borderColor="gray.300" borderRadius="md" _hover={{ bg: "gray.100" }}>
            <Text fontWeight="bold">{course.title}</Text>
            <Text fontSize="sm" color="gray.600">{course.description}</Text>
          </Box>
        </Link>        
        ))}
      </VStack>

      {/* Loader for infinite scrolling */}
      <div ref={loaderRef} style={{ height: "50px", marginTop: "10px" }}>
        {loading && <Spinner />}
      </div>
    </Box>
  );
};

export default ReviewPage;
