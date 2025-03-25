import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';

const SearchSuggestions = ({ suggestions, onSelect, type }) => {
  if (!suggestions.length) return null;

  return (
    <Box
      position="absolute"
      top="100%"
      left="0"
      right="0"
      bg="white"
      boxShadow="md"
      borderRadius="md"
      mt={1}
      maxH="300px"
      overflowY="auto"
      zIndex={1000}
    >
      <VStack align="stretch" spacing={0}>
        {suggestions.map((suggestion, index) => (
          <Box
            key={index}
            p={3}
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            onClick={() => onSelect(suggestion)}
          >
            {type === 'posts' && (
              <Text fontSize="sm">{suggestion.title}</Text>
            )}
            {type === 'courses' && (
              <Text fontSize="sm">{suggestion.title}</Text>
            )}
            {type === 'professors' && (
              <Text fontSize="sm">{suggestion.name}</Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default SearchSuggestions; 