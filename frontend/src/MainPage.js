// src/MainPage.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';

const MainPage = () => {
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

            {/* Timeline - Center aligned with margins for sidebars */}
            <Box 
                flex="1"
                ml={{ base: 0, md: '25%' }}
                mr={{ base: 0, md: '25%' }}
                bg="gray.50"
                minH="calc(100vh - 60px)"
            >
                <Box p={4} maxW="900px" mx="auto" bg="gray.50">
                    <Timeline />
                </Box>
            </Box>

            {/* Right Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                right="0"
            >
                {/* Actual Sidebar Content - Moved inward */}
                <Box width="80%" mr="auto">
                    <RightSidebar />
                </Box>
            </Box>
        </Flex>
    );
};

export default MainPage;