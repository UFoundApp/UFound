// src/components/LeftSidebar.js
import React from 'react';
import { Box, Stack, Button, Text } from '@chakra-ui/react';
import { FaRss, FaBuilding, FaPoll, FaLayerGroup, FaStar, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../theme/ColorModeContext';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  return (
    <Box
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      height="85vh"
      p={4}
      pl={14}
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
          background: colorMode === 'light' ? 'gray.200' : 'gray.600',
          borderRadius: '24px',
        },
      }}
    >
      <Stack spacing={2} align="stretch" direction="column">
        <Text fontWeight="bold" color="gray.600" px={4} pt={2}>
          Quick Links
        </Text>
        <Box as="hr" my={4} borderColor="gray.200" />

        {/* Main Navigation */}
        <Button
          leftIcon={<FaRss />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() => window.open("https://www.acorn.utoronto.ca/")}
        >
          Acorn
        </Button>
        <Button
          leftIcon={<FaChartLine />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() =>
            window.open("https://studentlife.utoronto.ca/service/mental-health-clinical-services/")
          }
        >
          Wellness
        </Button>
        <Button
          leftIcon={<FaPoll />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() => window.open("https://www.utoronto.ca/alerts")}
        >
          UTAlert
        </Button>
        <Button
          leftIcon={<FaBuilding />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          _hover={{ bg: 'gray.100' }}
          onClick={() =>
            window.open(
              "https://www.utoronto.ca/news/university-toronto-names-its-17th-president?utm_source=UofTHome&utm_medium=WebsiteBanner&utm_campaign=news_2025&utm_content=president_woodin"
            )
          }
        >
          UofT News
        </Button>
        <Button
          leftIcon={<FaLayerGroup />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() => window.open("https://www.utm.utoronto.ca/shuttle/")}
        >
          Shuttle Service
        </Button>
        <Button
          leftIcon={<FaStar />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() => window.open("https://www.utoronto.ca/campus-status")}
        >
          Campus Status
        </Button>
        <Button
          leftIcon={<FaStar />}
          justifyContent="flex-start"
          variant="ghost"
          width="100%"
          py={6}
          color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
          onClick={() => window.open("https://utm.calendar.utoronto.ca/")}
        >
          Acamic Calendar
        </Button>

        {/* Additional Section: Reviews */}
        <Box as="hr" my={4} borderColor="gray.200" />
        <Text fontWeight="bold" color="gray.600" px={4} pt={2}>
          Reviews
        </Text>
        <Stack spacing={1} align="stretch" pl={4}>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            py={2}
            color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          >
            Courses
          </Button>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            py={2}
            color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          >
            Health Plan
          </Button>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            py={2}
            color={colorMode === 'light' ? 'gray.600' : 'gray.200'}
          >
            Professors
          </Button>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            py={2}
            color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
          >
            Show more
          </Button>
        </Stack>

        <Box as="hr" my={4} borderColor="gray.200" />
      </Stack>
    </Box>
  );
};

export default LeftSidebar;