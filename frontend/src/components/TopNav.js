// src/components/TopNav.js
import React from 'react';
import { Flex, Input, Button } from '@chakra-ui/react';

const TopNav = () => {
    return (
        <Flex
            bg="primary"   // Use "primary" (not "primary.500")
            color="white"
            p={4}
            alignItems="center"
            justifyContent="space-between"
        >
            {/* Search Bar */}
            <Input placeholder="Search" width="30%" bg="white" color="black" />

            {/* Center Buttons */}
            <Flex>
                <Button bg="secondary" color="white" mx={2}>Home</Button>
                <Button bg="secondary" color="white" mx={2}>About</Button>
            </Flex>

            {/* Sign-In/Log-In Options */}
            <Flex>
                <Button variant="outline" borderColor="white" color="white" mx={2}>Sign In</Button>
                <Button variant="outline" borderColor="white" color="white" mx={2}>Log In</Button>
            </Flex>
        </Flex>
    );
};

export default TopNav;