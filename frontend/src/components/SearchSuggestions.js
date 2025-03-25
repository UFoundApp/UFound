import React from 'react';
import { Box, VStack, Text, Flex, Icon } from '@chakra-ui/react';
import { FaSearch, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

const SearchSuggestions = ({ suggestions, onSelect, type, query }) => {
  if (!suggestions.length) return null;

  const getHighlightedText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query?.toLowerCase() ? 
        <Text as="span" key={index} fontWeight="bold" color="blue.500">{part}</Text> : 
        part
    );
  };

  // Take only first 4 suggestions
  const displaySuggestions = suggestions.slice(0, 4);

  return (
    <Box
      position="absolute"
      top="100%"
      left="0"
      right="0"
      bg="white"
      boxShadow="lg"
      borderRadius="md"
      mt={1}
      maxH="480px"
      overflowY="auto"
      zIndex={1000}
    >
      <VStack align="stretch" spacing={0}>
        {/* Display first 4 suggestions */}
        {displaySuggestions.map((suggestion, index) => (
          <Box
            key={index}
            p={3}
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            onClick={() => onSelect(suggestion, false)}
            borderBottom="1px"
            borderColor="gray.100"
          >
            <Flex align="center" gap={2}>
              <Icon 
                as={type === 'posts' ? FaSearch : 
                    type === 'courses' ? FaGraduationCap : 
                    FaChalkboardTeacher} 
                color="gray.500"
              />
              {type === 'posts' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {getHighlightedText(suggestion.title)}
                  </Text>
                  {suggestion.content && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {suggestion.content.substring(0, 100)}...
                    </Text>
                  )}
                </Box>
              )}
              {type === 'courses' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {getHighlightedText(suggestion.title)}
                  </Text>
                  {suggestion.description && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {suggestion.description.substring(0, 100)}...
                    </Text>
                  )}
                </Box>
              )}
              {type === 'professors' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {getHighlightedText(suggestion.name)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {suggestion.department}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>
        ))}

        {/* Add "Search..." as the fifth item */}
        <Box
          p={3}
          _hover={{ bg: 'gray.50' }}
          cursor="pointer"
          onClick={() => onSelect(query, true)} // Pass true for search action
          borderBottom="1px"
          borderColor="gray.100"
        >
          <Flex align="center" gap={2}>
            <Icon as={FaSearch} color="gray.500" />
            <Text fontSize="sm" color="gray.600">
              Search "{query}"...
            </Text>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};

export default SearchSuggestions; 