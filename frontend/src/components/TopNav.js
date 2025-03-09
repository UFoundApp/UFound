import React, { useEffect, useState } from "react";
import { Flex, Input, Button, Text } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, logout, getUser } from "./AuthPageUtil";

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

  const handleAuth = (type) => {
    navigate("/login", { state: { isLogin: type === "signin" } });
  };

  const [type, setType] = React.useState("posts");
  const [text, setText] = React.useState("");
  const handleSearch = (e, type) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${encodeURIComponent(text) + "&type=" + type}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
            <Input
              placeholder="Search Posts"
              maxW="400px"
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              onChange={(e) => setText(e.target.value)}
              value={text}
              onKeyDown={(e) => {
                setType("posts");
                handleSearch(e, type);
              }}
              _hover={{ bg: "gray.100" }}
              _focus={{
                bg: "white",
                borderColor: "primary",
                boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
              }}
            />
          )}
          {searchProfessors && (
            <Input
              placeholder="Search Professors"
              maxW="400px"
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              onChange={(e) => setText(e.target.value)}
              value={text}
              onKeyDown={(e) => {
                setType("professors");
                handleSearch(e, type);
              }}
              _hover={{ bg: "gray.100" }}
              _focus={{
                bg: "white",
                borderColor: "primary",
                boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
              }}
            />
          )}
          {searchCourses && (
            <Input
              placeholder="Search Courses"
              maxW="400px"
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              onChange={(e) => setText(e.target.value)}
              value={text}
              onKeyDown={(e) => {
                setType("courses");
                handleSearch(e, type);
              }}
              _hover={{ bg: "gray.100" }}
              _focus={{
                bg: "white",
                borderColor: "primary",
                boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
              }}
            />
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
                bg: "white",
                borderColor: "primary",
                boxShadow: "0 0 0 1px var(--chakra-colors-primary)",
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
