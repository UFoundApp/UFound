import React, { useEffect, useState, useCallback } from "react";
import { Flex, Input, Button, Text, Box } from "@chakra-ui/react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "./AuthPageUtil";
import SearchSuggestions from "./SearchSuggestions";
import axios from "axios";
import { debounce } from "lodash";
import { useColorMode } from "../theme/ColorModeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const TopNav = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get("type");
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Update search type conditions
  const searchPosts =
    (location.pathname === "/search" && currentType === "posts") ||
    location.pathname === "/home" ||
    location.pathname.includes("/view-post/");

  const searchProfessors =
    (location.pathname === "/search" && currentType === "professors") ||
    location.pathname === "/professors" ||
    location.pathname.includes("/professors/");

  const searchCourses =
    (location.pathname === "/search" && currentType === "courses") ||
    location.pathname === "/courses" ||
    location.pathname.includes("/course/");

  // State to store auth status and username
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [type, setType] = useState("posts");
  const [text, setText] = useState("");

  // Re-check auth status whenever the route changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        const user = await getUser();
        if (user) {
          setUsername(user.username);
          setAuthenticated(true);
        }
      }
      setLoading(false); // Finish loading after auth check
    };
    checkAuthStatus();
  }, [location]);

  // Clear search text when route changes (except for search results page)
  useEffect(() => {
    if (!location.pathname.includes("/search")) {
      setText("");
      setShowSuggestions(false);
    }
  }, [location.pathname]);

  // Clear suggestions when search type changes
  useEffect(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, [searchPosts, searchProfessors, searchCourses]);

  const handleAuth = (type) => {
    navigate("/login", { state: { isLogin: type === "signin" } });
  };

  const handleSearch = (e, type) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(text)}&type=${type}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSuggestionSelect = (suggestion, isSearchAction = false) => {
    if (isSearchAction) {
      navigate(`/search?q=${encodeURIComponent(suggestion)}&type=${type}`);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(false);
    setText("");

    // Handle regular suggestion selection
    if (type === "posts") {
      navigate(`/view-post/${suggestion._id}`);
    } else if (type === "courses") {
      navigate(`/course/${suggestion._id}`);
    } else if (type === "professors") {
      navigate(`/professors/${suggestion._id}`);
    }
  };

  // Debounce the fetchSuggestions function
  const debouncedFetchSuggestions = useCallback(
    debounce((searchText, type) => {
      if (!searchText.trim()) {
        setSuggestions([]);
        return;
      }

      axios
        .get(`http://127.0.0.1:8000/api/search/suggestions`, {
          params: {
            query: searchText,
            type: type,
          },
        })
        .then((response) => {
          setSuggestions(response.data);
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        });
    }, 300),
    []
  );

  // Use the debounced function
  const fetchSuggestions = (searchText, type) => {
    debouncedFetchSuggestions(searchText, type);
  };

  // Update onChange handlers for each search input
  const handleSearchChange = (e, searchType) => {
    const value = e.target.value;
    setText(value);
    setType(searchType);
    if (value.trim()) {
      setShowSuggestions(true);
      fetchSuggestions(value, searchType);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <Flex
      bg={colorMode === "light" ? "white" : "gray.800"}
      boxShadow="0 2px 4px rgba(0,0,0,0.2)"
      p={4}
      alignItems="center"
      justifyContent={
        location.pathname === "/login" || location.pathname === "/reset-password"
          ? "flex-start"
          : "space-between"
      }
      borderBottom="1px"
      borderColor="gray.200"
      position="relative"
      zIndex={1}
    >
      {/* Logo - always visible */}
      <Text
        fontSize="2xl"
        fontWeight="bold"
        fontFamily="'Poppins', sans-serif"
        color="primary"
        cursor="pointer"
        onClick={() => navigate("/home")}
      >
        UFound
      </Text>

      {/* Only show these elements if NOT on the auth or reset password page */}
      {!location.pathname.includes("/login") &&
        !location.pathname.includes("/reset-password") && (
          <>
            {/* Search Input */}
            {(searchPosts ||
              searchProfessors ||
              searchCourses ||
              (!searchCourses && !searchPosts && !searchProfessors)) && (
              <Box position="relative" width="400px">
                <Input
                  placeholder={
                    searchPosts
                      ? "Search posts..."
                      : searchProfessors
                      ? "Search professors..."
                      : searchCourses
                      ? "Search courses..."
                      : "Search..."
                  }
                  width="100%"
                  bg={colorMode === "light" ? "gray.100" : "gray.700"}
                  color={colorMode === "light" ? "gray.800" : "gray.100"}
                  border="1px"
                  borderColor={
                    colorMode === "light" ? "gray.300" : "gray.600"
                  }
                  boxShadow="sm"
                  value={text}
                  onChange={(e) =>
                    handleSearchChange(
                      e,
                      searchPosts
                        ? "posts"
                        : searchProfessors
                        ? "professors"
                        : searchCourses
                        ? "courses"
                        : "posts"
                    )
                  }
                  onFocus={() => {
                    if (text.trim()) {
                      setShowSuggestions(true);
                      fetchSuggestions(text, type);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e, type);
                      setShowSuggestions(false);
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  _placeholder={{
                    color:
                      colorMode === "light" ? "gray.500" : "gray.400",
                  }}
                  _hover={{
                    borderColor:
                      colorMode === "light" ? "gray.400" : "gray.500",
                  }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "none",
                  }}
                />

                {/* Search Suggestions - Single Instance */}
                {showSuggestions && suggestions.length > 0 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    mt={2}
                    zIndex={1000}
                  >
                    <SearchSuggestions
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      type={type}
                      query={text}
                      colorMode={colorMode}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Navigation Links */}
            <Flex alignItems="center" gap={4}>
              <Button
                variant="ghost"
                color={colorMode === "light" ? "gray.600" : "white"}
                _hover={{ color: "primary" }}
                onClick={() => navigate("/home")}
              >
                Community
              </Button>
              <Button
                variant="ghost"
                color={colorMode === "light" ? "gray.600" : "white"}
                _hover={{ color: "primary" }}
                onClick={() => navigate("/courses")}
              >
                Courses
              </Button>
              <Button
                variant="ghost"
                color={colorMode === "light" ? "gray.600" : "white"}
                _hover={{ color: "primary" }}
                onClick={() => navigate("/professors")}
              >
                Professors
              </Button>
              <Button
                variant="ghost"
                color="white"
                bg="primary"
                _hover={{ color: "gray.500" }}
                onClick={() => navigate("/create-post")}
              >
                Write a post
              </Button>
              <Button
                variant="ghost"
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                color={colorMode === "light" ? "gray.600" : "white"}
                _hover={{
                  color:
                    colorMode === "light" ? "primary" : "secondary",
                }}
              >
                {colorMode === "light" ? <FaMoon /> : <FaSun />}
              </Button>
            </Flex>

            {/* Auth Buttons */}
            <Flex alignItems="center" gap={3}>
              {loading ? (
                <Text color="gray.500">Loading...</Text>
              ) : authenticated ? (
                <>
                  <Button
                    variant="ghost"
                    color={colorMode === "light" ? "gray.700" : "white"}
                    onClick={() =>
                      navigate(
                        username ? `/profile/${username}` : "/login"
                      )
                    }
                  >
                    {username ? username : "Profile"}
                  </Button>
                  <Button
                    variant="ghost"
                    color={colorMode === "light" ? "gray.700" : "white"}
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    color={colorMode === "light" ? "gray.700" : "gray.300"}
                    onClick={() => handleAuth("signin")}
                  >
                    Sign in
                  </Button>
                  <Button
                    bg="primary"
                    color="white"
                    _hover={{ bg: "primary", opacity: 0.9 }}
                    onClick={() => handleAuth("signup")}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Flex>
          </>
        )}
    </Flex>
  );
};

export default TopNav;
