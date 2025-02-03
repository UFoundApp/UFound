// src/components/RightSidebar.js
import React from 'react';
import { Box, Text, VStack, Flex, Icon } from '@chakra-ui/react';
import { FaDiscord, FaGit, FaFileAlt } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faCoffee, 
    faWifi, 
    faBook, 
    faUtensils, 
    faMusic,
    faGraduationCap,
    faComments,
    faLocationDot,
    faStar
} from '@fortawesome/free-solid-svg-icons';

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

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <Icon as={FaDiscord} color="gray.600" boxSize={5} mt={1} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Anyone else having trouble with campus WiFi today?
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                42 upvotes · 28 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faGraduationCap} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Prof ghosted the entire class on exam day 💀
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                342 likes · 156 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faLocationDot} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                To whoever left their AirPods in Lib 2nd floor...
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                89 likes · 23 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faUsers} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Spotted: Couple breaking up in front of Starbucks 👀
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                567 likes · 234 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faWifi} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Why is the CS department wifi always down? 😤
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                245 likes · 78 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faBook} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Secret study spot thread 🤫 Drop yours below
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                892 likes · 445 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faComments} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Anyone else see that squirrel steal someone's sandwich? 😂
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                756 likes · 89 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faCoffee} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Hot take: North Hall coffee --- Starbucks
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                445 likes · 234 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faStar} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Which TA is actually giving out A's in MATH201? 👀
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                678 likes · 321 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faUtensils} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Dining hall serving pizza for the 5th day straight 💀
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                523 likes · 167 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: 'gray.100' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faMusic} color="gray.600" size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color="gray.700" fontSize="sm">
                                Someone's doing karaoke in the library at 2AM 😭
                            </Text>
                            <Text color="gray.500" fontSize="xs" mt={1}>
                                934 likes · 445 comments
                            </Text>
                        </Box>
                    </Flex>
                </VStack>
            </Box>
        </Box>
    );
};

export default RightSidebar;