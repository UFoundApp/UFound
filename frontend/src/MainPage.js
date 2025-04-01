// src/MainPage.js
import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Timeline from './components/Timeline';
import { useColorMode } from './theme/ColorModeContext';

const MainPage = () => {
    const { colorMode } = useColorMode();
    
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

            {/* Timeline - Center aligned with margins for sidebars */}
            <Box 
                flex="1"
                ml={{ base: 0, md: '25%' }}
                mr={{ base: 0, md: '25%' }}
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                minH="calc(100vh - 60px)"
            >
                <Box p={4} maxW="900px" mx="auto" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
                    <Timeline />
                </Box>
            </Box>

            {/* Right Sidebar Area - Fixed */}
            <Box
                as="aside"
                width={{ base: '0', md: '25%' }}
                display={{ base: 'none', md: 'block' }}
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
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