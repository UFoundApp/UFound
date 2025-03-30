import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "./AuthPageUtil";

function Home() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        navigate("/home"); // Redirect to dashboard
      } else {
        navigate("/login"); // or keep user on a login page
      }
    };

    checkAuth();
  }, [navigate]);

  return null; // No UI needed while redirecting
}

export default Home;
