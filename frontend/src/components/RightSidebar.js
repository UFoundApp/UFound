// src/components/RightSidebar.js
import React from 'react';
import { Box, Text, VStack, Flex, Icon } from '@chakra-ui/react';
import { FaDiscord, FaGit, FaFileAlt } from 'react-icons/fa';

const RightSidebar = () => {
    return (
        <Box
            bg="gray.50"
            height="85vh"
            p={4}
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
                    background: 'gray.200',
                    borderRadius: '24px',
                },
            }}
        >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="bold" color="gray.700">
                    RECENT POSTS
                </Text>
                <Text color="blue.500" fontSize="sm" cursor="pointer">
                    Clear
                </Text>
            </Flex>

            <Box
                bg="white"
                borderRadius="xl"
                boxShadow="sm"
                p={3}
                border="1px"
                borderColor="gray.200"
            >
                <VStack spacing={2} align="stretch">
                    {/* Post items */}
                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <Icon as={FaDiscord} color="gray.600" boxSize={5} mt={1} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                CTRL + SHIFT + I not opening console anymore?
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                6 upvotes · 22 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <Icon as={FaGit} color="gray.600" boxSize={5} mt={1} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Branch changing is not reflecting changes in code
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                14 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <Icon as={FaFileAlt} color="gray.600" boxSize={5} mt={1} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                How do I run an application as administrator
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                3 upvotes · 2 comments
                            </Text>
                        </Box>
                    </Flex>
                </VStack>
            </Box>
        </Box>
    );
};

export default RightSidebar;