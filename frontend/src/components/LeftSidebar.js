// src/components/LeftSidebar.js
import React from 'react';
import { Box, Stack, Button, Text } from '@chakra-ui/react';
import { FaRss, FaBuilding, FaPoll, FaLayerGroup, FaStar, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../theme/ColorModeContext';


const LeftSidebar = () => {
    const navigate = useNavigate();
    const { colorMode } = useColorMode();

    return (
        <Box
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            height="85vh"
            p={4}
            pl={14}
            width="100%"
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: colorMode === 'light' ? 'gray.200' : 'gray.600',
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
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                    onClick={() => navigate("/home")}
                >
                    Feed
                </Button>
                
                <Button
                    leftIcon={<FaBuilding />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                    My School
                </Button>

                <Button
                    leftIcon={<FaPoll />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                    Polls
                </Button>

                <Button
                    leftIcon={<FaLayerGroup />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                    Posts
                </Button>

                <Button
                    leftIcon={<FaStar />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                    Featured Content
                </Button>

                <Button
                    leftIcon={<FaChartLine />}
                    justifyContent="flex-start"
                    variant="ghost"
                    width="100%"
                    py={6}
                    color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
                    _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                    Trending
                </Button>

                {/* Industries Section */}
                <Box as="hr" my={4} borderColor="gray.200" />
                <Text fontWeight="bold" color="gray.600" px={4} pt={2}>
                    Reviews
                </Text>
                <Stack spacing={1} align="stretch" pl={4}>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color={colorMode === 'light' ? 'gray.600' : 'gray.200'}>Courses</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color={colorMode === 'light' ? 'gray.600' : 'gray.200'}>Health Plan</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color={colorMode === 'light' ? 'gray.600' : 'gray.200'}>Professors</Button>
                    <Button variant="ghost" justifyContent="flex-start" py={2} color={colorMode === 'light' ? 'blue.500' : 'blue.300'}>
                        Show more
                    </Button>
                </Stack>

                {/* Job Groups Section */}
                <Box as="hr" my={4} borderColor="gray.200" />

            </Stack>
        </Box>
    );
};

export default LeftSidebar;