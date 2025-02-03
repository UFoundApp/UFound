import React from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "./AuthPageUtil";

function Home() {
  const navigate = useNavigate();
// place holder home page for to test login and logout
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🏠 Welcome to UFound</h1>
        <p className="text-gray-600 mb-6">A private platform for UofT Mississauga students.</p>

        {isLoggedIn() ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
