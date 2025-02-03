import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, logout } from "./AuthPageUtil";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login"); // Redirect if not logged in
    } else {
      setUser(getUser()); // Get user details
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 Logged In!</h2>
        {user ? (
          <>
            <p className="text-gray-600 text-lg">Welcome, <strong>{user.username}</strong>!</p>
            <p className="text-gray-500">{user.email}</p>
            <button
              onClick={() => {
                logout();
                navigate("/login"); // Redirect to login page
              }}
              className="mt-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
