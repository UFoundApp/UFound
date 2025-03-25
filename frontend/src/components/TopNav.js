import React, { useEffect, useState } from "react";
import { Flex, Input, Button, Text, Box } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "./AuthPageUtil";
import SearchSuggestions from "./SearchSuggestions";
import axios from 'axios';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";
  const isResetPasswordPage = location.pathname === "/reset-password";
  const searchPosts = location.pathname === "/home";
  const searchProfessors = location.pathname === "/professors";
  const searchCourses = location.pathname === "/courses";

  // State to store auth status and username
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [type, setType] = React.useState("posts");
  const [text, setText] = React.useState("");

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

  // Add useEffect to watch for route changes
  useEffect(() => {
    // Clear search text when route changes (except for search results page)
    if (!location.pathname.includes('/search')) {
      setText('');
      setShowSuggestions(false);
    }
  }, [location.pathname]); // Only trigger when pathname changes

  const handleAuth = (type) => {
    navigate("/login", { state: { isLogin: type === "signin" } });
  };

  const handleSearch = (e, type) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${encodeURIComponent(text) + "&type=" + type}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchSuggestions = async (searchText, type) => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/search/suggestions`, {
        params: { 
          query: searchText,
          type: type
        }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (type === 'posts') {
      navigate(`/view-post/${suggestion._id}`);
    } else if (type === 'courses') {
      navigate(`/course/${suggestion._id}`);
    } else if (type === 'professors') {
      navigate(`/professors/${suggestion._id}`);
    }
    setShowSuggestions(false);
    setText('');
  };

  return (
    <Flex
      bg="white"
      boxShadow="0 2px 4px rgba(0,0,0,0.2)"
      p={4}
      alignItems="center"
      justifyContent={isResetPasswordPage ? "flex-start" : "space-between"}
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
      {!isAuthPage && !isResetPasswordPage && (
        <>
          {/* Search Input */}
          {searchPosts && (
            <Box position="relative" width="400px">
              <Input
                placeholder="Search Posts"
                width="100%"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                onChange={(e) => {
                  setText(e.target.value);
                  setType("posts");
                  fetchSuggestions(e.target.value, "posts");
                  setShowSuggestions(true);
                }}
                value={text}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e, type);
                    setShowSuggestions(false);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                _hover={{ bg: "gray.100" }}
                _focus={{
                  bg: "gray.50",
                  borderColor: "primary",
                  boxShadow: "none",
                  outline: "none"
                }}
              />
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={handleSuggestionSelect}
                  type="posts"
                />
              )}
            </Box>
          )}
          {searchProfessors && (
            <Box position="relative" width="400px">
              <Input
                placeholder="Search Professors"
                width="100%"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                onChange={(e) => {
                  setText(e.target.value);
                  setType("professors");
                  fetchSuggestions(e.target.value, "professors");
                  setShowSuggestions(true);
                }}
                value={text}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e, type);
                    setShowSuggestions(false);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                _hover={{ bg: "gray.100" }}
                _focus={{
                  bg: "gray.50",
                  borderColor: "primary",
                  boxShadow: "none",
                  outline: "none"
                }}
              />
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={handleSuggestionSelect}
                  type="professors"
                />
              )}
            </Box>
          )}
          {searchCourses && (
            <Box position="relative" width="400px">
              <Input
                placeholder="Search Courses"
                width="100%"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                onChange={(e) => {
                  setText(e.target.value);
                  setType("courses");
                  fetchSuggestions(e.target.value, "courses");
                  setShowSuggestions(true);
                }}
                value={text}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e, type);
                    setShowSuggestions(false);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                _hover={{ bg: "gray.100" }}
                _focus={{
                  bg: "gray.50",
                  borderColor: "primary",
                  boxShadow: "none",
                  outline: "none"
                }}
              />
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={handleSuggestionSelect}
                  type="courses"
                />
              )}
            </Box>
          )}
          {!searchCourses && !searchPosts && !searchProfessors && (
            <Input
              placeholder="Search..."
              maxW="400px"
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              onChange={(e) => setText(e.target.value)}
              value={text}
              onKeyDown={(e) => {
                handleSearch(e, type);
              }}
              _hover={{ bg: "gray.100" }}
              _focus={{
                bg: "gray.50",
                borderColor: "primary",
                boxShadow: "none",
                outline: "none"
              }}
            />
          )}

          {/* Navigation Links */}
          <Flex alignItems="center" gap={4}>
            <Button
              variant="ghost"
              color="gray.600"
              _hover={{ color: "primary" }}
              onClick={() => navigate("/home")}
            >
              Community
            </Button>
            <Button
              variant="ghost"
              color="gray.600"
              _hover={{ color: "primary" }}
              onClick={() => navigate("/courses")}
            >
              Courses
            </Button>
            <Button
              variant="ghost"
              color="gray.600"
              _hover={{ color: "primary" }}
              onClick={() => navigate("/professors")}
            >
              Professors
            </Button>
            <Button
              variant="ghost"
              color="gray.600"
              _hover={{ color: "primary" }}
              onClick={() => navigate("/create-post")}
            >
              Write a post
            </Button>
          </Flex>

          {/* Auth Buttons */}
          <Flex alignItems="center" gap={3}>
            {loading ? (
              <Text color="gray.500">Loading...</Text> // ✅ Display loading state
            ) : authenticated ? (
              <>
                <Button
                  variant="ghost"
                  color="gray.700"
                  onClick={() =>
                    navigate(username ? `/profile/${username}` : "/login")
                  }
                >
                  {username ? username : "Profile"}
                </Button>
                <Button variant="ghost" color="gray.700" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  color="gray.700"
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
