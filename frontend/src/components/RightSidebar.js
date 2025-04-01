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
import { useColorMode } from '../theme/ColorModeContext';

const RightSidebar = () => {
    const { colorMode } = useColorMode();
    
    return (
        <Box
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            height="85vh"
            p={4}
            width="100%"
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                    display: 'none',
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
            <Flex justify="space-between" align="center" mb={4}>
                <Text 
                    fontWeight="bold" 
                    color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                >
                    RECENT POSTS
                </Text>
                <Text 
                    color="blue.500" 
                    fontSize="sm" 
                    cursor="pointer"
                >
                    Clear
                </Text>
            </Flex>

            <Box
                bg={colorMode === 'light' ? 'white' : 'gray.700'}
                borderRadius="xl"
                boxShadow="sm"
                p={3}
                border="1px"
                borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            >
                <VStack spacing={2} align="stretch">

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faComments} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Anyone else having trouble with campus WiFi today?
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontSize="xs" noOfLines={2}>
                                Been trying to connect to UofT-Secure for the past hour...
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                42 likes · 28 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faGraduationCap} color={colorMode === 'light' ? '#4A5568' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Prof ghosted the entire class on exam day 💀
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontSize="xs" noOfLines={2}>
                                We all showed up for the final exam at SS1083 and waited for 30 mins...
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                342 likes · 156 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faLocationDot} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                To whoever left their AirPods in Lib 2nd floor...
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                89 likes · 23 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faUsers} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Spotted: Couple breaking up in front of Starbucks 👀
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                567 likes · 234 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faWifi} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Why is the CS department wifi always down? 😤
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                245 likes · 78 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faBook} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Secret study spot thread 🤫 Drop yours below
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                892 likes · 445 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faComments} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Anyone else see that squirrel steal someone's sandwich? 😂
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                756 likes · 89 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faCoffee} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Hot take: North Hall coffee --- Starbucks
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                445 likes · 234 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faStar} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Which TA is actually giving out A's in MATH201? 👀
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                678 likes · 321 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faUtensils} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Dining hall serving pizza for the 5th day straight 💀
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
                                523 likes · 167 comments
                            </Text>
                        </Box>
                    </Flex>

                    <Flex 
                        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                    >
                        <FontAwesomeIcon icon={faMusic} color={colorMode === 'light' ? 'gray.600' : '#A0AEC0'} size="lg" style={{ marginTop: '4px' }} />
                        <Box ml={3}>
                            <Text color={colorMode === 'light' ? 'gray.700' : 'gray.200'} fontSize="sm">
                                Someone's doing karaoke in the library at 2AM 😭
                            </Text>
                            <Text color={colorMode === 'light' ? 'gray.500' : 'gray.500'} fontSize="xs" mt={1}>
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