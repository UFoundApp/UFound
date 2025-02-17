// src/components/LeftSidebar.js
import React from 'react';
import { Box, Stack, Button, Text } from '@chakra-ui/react';
import { FaRss, FaBuilding, FaPoll, FaLayerGroup, FaStar, FaChartLine } from 'react-icons/fa';

const LeftSidebar = () => {
    return (
        <Box
            bg="gray.50"  // Very light grey background
            height="85vh"  // Changed to viewport height
            p={4}
            pl={14}  // Added more left padding
            width="100%"
            overflowY="auto"  // Enable vertical scrolling when needed
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'gray.200',
                    borderRadius: '24px',
                },
            }}
        >
            <Stack spacing={2} align="stretch" direction="column">
                {/* Main Navigation */}
                <Button
                    leftIcon={<FaRss />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    Feed
                </Button>
                
                <Button
                    leftIcon={<FaBuilding />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    My School
                </Button>

                <Button
                    leftIcon={<FaPoll />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    Polls
                </Button>

                <Button
                    leftIcon={<FaLayerGroup />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    All Channels
                </Button>

                <Button
                    leftIcon={<FaStar />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    Featured Content
                </Button>

                <Button
                    leftIcon={<FaChartLine />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    _hover={{ bg: 'gray.100' }}
                >
                    Trending
                </Button>

                {/* Industries Section */}
                <Box as="hr" my={4} borderColor="gray.200" />
                <Text fontWeight="bold" color="gray.600" px={4} pt={2}>
                    Reviews
                </Text>
                <Stack spacing={1} align="stretch" pl={4}>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Tech</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Healthcare</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Hardware</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color="blue.500">
                        Show more
                    </Button>
                </Stack>

                {/* Job Groups Section */}
                <Box as="hr" my={4} borderColor="gray.200" />
                <Text fontWeight="bold" color="gray.600" px={4} pt={2}>
                    JOB GROUPS
                </Text>
                <Stack spacing={1} align="stretch" pl={4}>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Software Engineering</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Product Management</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2}>Finance</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color="blue.500">
                        Show more
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default LeftSidebar;