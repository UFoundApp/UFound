export const getUser = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      credentials: "include",  // Ensures cookies are sent
    });

    if (response.ok) {
      const data = await response.json();
      console.log("User is authenticated:", data);
      return data;
    } else {
      console.warn("User is NOT authenticated. Server response:", await response.json());
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const isLoggedIn = async () => {
  try {
    // Step 1: Check if the user is authenticated with the current access token
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("User is logged in with access token:", data);
      return true; // Access token is valid, no need to refresh
    }

    console.warn("⚠️ Access token invalid or expired. Checking refresh token...");

    // Step 2: Check if a refresh token exists
    const refreshResponse = await fetch("http://127.0.0.1:8000/auth/check-refresh", {
      credentials: "include",
    });

    if (refreshResponse.status === 204) {
      console.warn("🔹 No refresh token found. Cannot refresh access token.");
      return false; // No refresh token, and access token is invalid, so user is not logged in
    }

    // Step 3: Attempt to refresh the access token
    const refreshSuccess = await refreshAccessToken();
    if (!refreshSuccess) {
      console.warn("⚠️ Failed to refresh access token.");
      return false;
    }

    // Step 4: Retry authentication with the new access token
    const retryResponse = await fetch("http://127.0.0.1:8000/auth/me", {
      credentials: "include",
    });

    if (retryResponse.ok) {
      const data = await retryResponse.json();
      console.log("User is logged in after refresh:", data);
      return true;
    }

    console.warn("⚠️ Retry failed after refresh.");
    return false;

  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};


export const logout = async () => {
  await fetch("http://127.0.0.1:8000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "/login";
};

export const refreshAccessToken = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

export const updateStoredUsername = async (newUsername) => {
  try {
    const userData = await getUser(); // ✅ Ensure `getUser()` resolves before using its data
    if (userData) {
      userData.username = newUsername;
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("✅ Username updated in local storage:", newUsername);
    }
  } catch (error) {
    console.error("⚠️ Error updating username:", error);
  }
};