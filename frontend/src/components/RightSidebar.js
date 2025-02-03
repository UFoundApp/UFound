// src/components/RightSidebar.js
import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const RightSidebar = () => {
    return (
        <Box
            bg="gray.50"  // Very light grey background
            height="100%"
            p={4}
        >
            <Text fontWeight="bold" color="gray.700">
                Right Sidebar
            </Text>
            {/* Additional content can go here */}
        </Box>
    );
};

export default RightSidebar;