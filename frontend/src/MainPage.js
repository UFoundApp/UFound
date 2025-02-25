// src/MainPage.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';

const MainPage = () => {
    return (
        <Flex flex="1">
            {/* Left Sidebar - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '20%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                left="0"
            >
                <LeftSidebar />
            </Box>

            {/* Timeline - Center aligned with margins for sidebars */}
            <Box 
                flex="1"
                bg="white"
                ml={{ base: 0, md: '20%' }}
                mr={{ base: 0, md: '20%' }}
            >
                <Box p={4} maxW="800px" mx="auto">
                    <Timeline />
                </Box>
            </Box>

            {/* Right Sidebar - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '20%' }}
                display={{ base: 'none', md: 'block' }}
                bg="gray.50"
                height="calc(100vh - 60px)"
                position="fixed"
                right="0"
            >
                <RightSidebar />
            </Box>
        </Flex>
    );
};

export default MainPage;