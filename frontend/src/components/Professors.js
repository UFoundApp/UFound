import React, { useEffect, useState } from "react";
import { Box, Text, VStack, Link, Spinner, Heading, Flex } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { useColorMode } from '../theme/ColorModeContext';

const Professors = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const { colorMode } = useColorMode();

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

      {/* Main Content - Center aligned with margins for sidebars */}
      <Box 
        flex="1"
        ml={{ base: 0, md: '25%' }}
        mr={{ base: 0, md: '25%' }}
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        minH="calc(100vh - 60px)"
      >
        <Box p={4} maxW="900px" mx="auto" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
          <Heading as="h1" size="xl" mb={6} color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
            Professors
          </Heading>
          
          {professors.length === 0 ? (
            <Text fontSize="lg" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} textAlign="center" mt={10}>
              No professors found.
            </Text>
          ) : (
            <VStack spacing={4} align="stretch" pb={4}>
              {professors.map((professor) => (
                <Link 
                  as={RouterLink} 
                  to={`/professors/${professor.id}`}
                  key={professor.id}
                >
                  <Box 
                    width="100%"
                    p={4} 
                    border="1px" 
                    borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} 
                    borderRadius="md" 
                    _hover={{ 
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.700', 
                      transform: "translateY(-2px)" 
                    }}
                    transition="all 0.2s"
                    boxShadow="sm"
                    bg={colorMode === 'light' ? 'white' : 'gray.700'}
                  >
                    <Text fontWeight="bold" fontSize="lg" color={colorMode === 'light' ? 'gray.800' : 'gray.100'}>
                      {professor.name}
                    </Text>
                    <Text fontSize="md" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
                      {professor.department}
                    </Text>
                    {professor.ratings && typeof professor.ratings.overall === "number" && (
                      <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                        Rating: ⭐ {professor.ratings.overall.toFixed(1)}/5
                      </Text>
                    )}
                    <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                      Current Courses: {professor.current_courses.length}
                    </Text>
                  </Box>
                </Link>
              ))}
              
              {loading && (
                <Flex justify="center" p={4}>
                  <Spinner size="md" color="blue.500" />
                  <Text ml={2} color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                    Loading batch {page + 1}...
                  </Text>
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