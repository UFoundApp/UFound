// src/components/TopNav.js
import React from 'react';
import { Flex, Input, Button, Text } from '@chakra-ui/react';

const TopNav = () => {
    return (
        <Flex
            bg="white"
            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
            p={4}
            alignItems="center"
            justifyContent="space-between"
            borderBottom="1px"
            borderColor="gray.200"
            position="relative"
            zIndex={1}
        >
            {/* Logo */}
            <Text
                fontSize="2xl"
                fontWeight="bold"
                fontFamily="'Poppins', sans-serif"
                color="primary"
                cursor="pointer"
            >
                UFound
            </Text>

            {/* Search Bar */}
            <Input 
                placeholder="Search" 
                maxW="400px"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _hover={{ bg: "gray.100" }}
                _focus={{ 
                    bg: "white",
                    borderColor: "primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-primary)"
                }}
            />

            {/* Navigation Links */}
            <Flex alignItems="center" gap={4}>
                <Button variant="ghost" color="gray.600" _hover={{ color: "primary" }}>
                    Community
                </Button>
                <Button variant="ghost" color="gray.600" _hover={{ color: "primary" }}>
                    Reviews
                </Button>
                <Button variant="ghost" color="gray.600" _hover={{ color: "primary" }}>
                    Forum
                </Button>
                <Button variant="ghost" color="gray.600" _hover={{ color: "primary" }}>
                    Profile
                </Button>
            </Flex>

            {/* Auth Buttons */}
            <Flex alignItems="center" gap={3}>
                <Button variant="ghost" color="gray.700">Sign in</Button>
                <Button 
                    bg="primary"
                    color="white"
                    _hover={{ bg: "primary", opacity: 0.9 }}
                >
                    Sign up
                </Button>
            </Flex>
        </Flex>
    );
};

export default TopNav;