import React, { useEffect, useState } from "react";
import { Box, Text, VStack, Link, Spinner, Heading, Flex } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // Function to fetch ONLY the next batch of professors
  async function fetchNextBatch() {
    if (loading) return;

    setLoading(true);
    try {
      console.log(`Fetching batch ${page + 1} of professors...`);
      
      // ONLY fetch the next 20 professors, not all of them
      const response = await fetch(`http://localhost:8000/api/professors?page=${page}&limit=20`);
      const data = await response.json();

      console.log(`Received ${data.length} professors in batch ${page + 1}`);

      if (data.length === 0) {
        setHasMore(false);
      } else {
        // Append just this batch to our existing list
        setProfessors(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching professors batch:", error);
    }
    setLoading(false);
    setInitialLoading(false);
  }

  // Initial data load - just load the first batch
  useEffect(() => {
    fetchNextBatch();
  }, []);

  // Handle scroll event for the entire window
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to near the bottom of the page
      if (
        !loading &&
        hasMore &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
      ) {
        console.log("User scrolled to bottom, loading next batch...");
        fetchNextBatch();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  if (initialLoading) {
    return (
      <Flex justify="center" align="center" height="50vh">
        <Spinner size="xl" thickness="4px" color="blue.500" />
      </Flex>
    );
  }

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

      {/* Main Content - Center aligned with margins for sidebars */}
      <Box 
        flex="1"
        ml={{ base: 0, md: '25%' }}
        mr={{ base: 0, md: '25%' }}
        bg="gray.50"
        minH="calc(100vh - 60px)"
      >
        <Box p={4} maxW="900px" mx="auto" bg="gray.50">
          <Heading as="h1" size="xl" mb={6}>
            Professors
          </Heading>
          
          {professors.length === 0 ? (
            <Text fontSize="lg" color="gray.500" textAlign="center" mt={10}>
              No professors found.
            </Text>
          ) : (
            <VStack spacing={4} align="stretch" pb={4}>
              {professors.map((professor) => (
                <Link 
                  as={RouterLink} 
                  to={`/professors/${professor._id}`} 
                  key={professor.id}
                >
                  <Box 
                    width="100%"
                    p={4} 
                    border="1px" 
                    borderColor="gray.300" 
                    borderRadius="md" 
                    _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    boxShadow="sm"
                    bg="white"
                  >
                    <Text fontWeight="bold" fontSize="lg">{professor.name}</Text>
                    <Text fontSize="md" color="gray.600">{professor.department}</Text>
                    {professor.ratings && (
                      <Text fontSize="sm" color="gray.500">
                        Rating: ⭐ {professor.ratings.toFixed(1)}/5
                      </Text>
                    )}
                    <Text fontSize="sm" color="gray.500">
                      Current Courses: {professor.current_courses.length}
                    </Text>
                  </Box>
                </Link>
              ))}
              
              {loading && (
                <Flex justify="center" p={4}>
                  <Spinner size="md" color="blue.500" />
                  <Text ml={2} color="gray.500">Loading batch {page + 1}...</Text>
                </Flex>
              )}
            </VStack>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default Professors;