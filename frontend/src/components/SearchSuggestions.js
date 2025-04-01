import React from 'react';
import { Box, VStack, Text, Flex, Icon } from '@chakra-ui/react';
import { FaSearch, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

const SearchSuggestions = ({ suggestions, onSelect, type, query, colorMode }) => {
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
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      boxShadow="md"
      borderRadius="md"
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      overflow="hidden"
    >
      <VStack align="stretch" spacing={0} divider={
        <Box 
          w="100%" 
          h="1px" 
          bg={colorMode === 'light' ? 'gray.100' : 'gray.600'}
        />
      }>
        {/* Display first 4 suggestions */}
        {displaySuggestions.map((suggestion, index) => (
          <Box
            key={index}
            p={3}
            cursor="pointer"
            _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.600' }}
            onClick={() => onSelect(suggestion, false)}
            color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
            borderBottom={colorMode === 'light' ? '1px' : '1px solid gray.600'}
          >
            <Flex align="center" gap={2}>
              <Icon 
                as={type === 'posts' ? FaSearch : 
                    type === 'courses' ? FaGraduationCap : 
                    FaChalkboardTeacher} 
                color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
              />
              {type === 'posts' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {getHighlightedText(suggestion.title)}
                  </Text>
                  {suggestion.content && (
                    <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} noOfLines={1}>
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
                    <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} noOfLines={1}>
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
                  <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
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
          cursor="pointer"
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.600' }}
          onClick={() => onSelect(query, true)} // Pass true for search action
          color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
          borderBottom={colorMode === 'light' ? '1px' : '1px solid gray.600'}
        >
          <Flex align="center" gap={2}>
            <Icon as={FaSearch} color={colorMode === 'light' ? 'gray.500' : 'gray.400'} />
            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              Search "{query}"...
            </Text>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};

export default SearchSuggestions; 