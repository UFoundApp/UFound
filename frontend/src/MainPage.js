// src/MainPage.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';

const MainPage = () => {
    return (
        <Flex direction="column" height="100vh" overflow="hidden" position="fixed" width="100%">
            {/* Top Navigation
            <Box as="header">
                <TopNav />
            </Box> */}

            {/* Main Content */}
            <Flex as="main" flex="1" overflow="hidden">
                {/* Left Sidebar */}
                <Box
                    as="aside"
                    width={{ base: '0', md: '20%' }}
                    display={{ base: 'none', md: 'block' }}
                    bg="gray.50"
                >
                    <LeftSidebar />
                </Box>

                {/* Timeline */}
                <Box flex="1" overflowY="auto" p={4} bg="white">
                    <Timeline />
                </Box>

                {/* Right Sidebar */}
                <Box
                    as="aside"
                    width={{ base: '0', md: '20%' }}
                    display={{ base: 'none', md: 'block' }}
                    bg="gray.50"
                    p={4}
                >
                    <RightSidebar />
                </Box>
            </Flex>
        </Flex>
    );
};

export default MainPage;