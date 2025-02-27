export const getUser = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      credentials: "include",  //  Must include credentials to send cookies
    });

    const data = await response.json();
    console.log("🔹 Auth Me Response:", data);

    if (response.ok) {
      return data;
    } else {
      console.error("❌ User is NOT authenticated. Server response:", data);
      return null;
    }
  } catch (error) {
    console.error("⚠️ Error fetching user:", error);
    return null;
  }
};



export const isLoggedIn = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ User is logged in:", data);
      return true;
    } 
    
    // ❌ Token might have expired, try refreshing it
    console.warn("⚠️ Access token may have expired. Trying refresh...");
    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      console.log("🔄 Token refreshed. Checking login again...");
      return await isLoggedIn(); // ✅ Re-check authentication after refresh
    }

    console.error("❌ User is NOT authenticated. Refresh token expired.");
    return false;
  } catch (error) {
    console.error("⚠️ Error checking login status:", error);
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

    if (response.ok) {
      console.log("✅ Token refreshed successfully.");
      return true; // Token refreshed
    } else {
      console.warn("❌ Refresh token expired. User must log in again.");
      return false; // Refresh failed, user must log in again
    }
  } catch (error) {
    console.error("⚠️ Error refreshing token:", error);
    return false;
  }
};


export const updateStoredUsername = (newUsername) => {
  const userData = getUser();
  if (userData) {
    userData.username = newUsername;
    localStorage.setItem('user', JSON.stringify(userData));
  }
};