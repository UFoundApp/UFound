import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import EmailInput from "./EmailInput";
import VerifyCode from "./VerifyCode";
import axios from "axios";
import PasswordSetup from "./PasswordSetup";
import '../App.css';
import { isLoggedIn } from './AuthPageUtil'; // Import isLoggedIn function

function ResetPassword() {

  const [resetPasswordState, setResetPasswordState] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isPassUpdated, setIsPassUpdated] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // Initialize navigation


  const toggleForm = () => setIsLogin(!isLogin);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/update-password", {
        identifier: email, // Can be email or username
        password: password
      });

      alert("Login Successful!");
      console.log("User Info:", response.data);

      // Store user session
      localStorage.setItem("user", JSON.stringify(response.data));

      // Redirect user to dashboard
      navigate("/dashboard");

    } catch (error) {
      if (error.response) {
        alert(` ${error.response.data.detail}`); // Show backend error messages
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Reset Password
        </h2>
        
            <>
            {!email ? (
                <>
                <p className="text-gray-600 text-sm text-center mb-6">
                    Enter your UofT email address to receive a verification code.
                </p>
                <EmailInput onSuccess={(enteredEmail) => setEmail(enteredEmail)} resetPasswordState={resetPasswordState} />
                </>
            ) : !isVerified ? (
                <>
                <p className="text-gray-600 text-sm text-center mb-6">
                    Check your email for the 6-digit verification code.
                </p>
                <VerifyCode email={email} onSuccess={() => setIsVerified(true)} />
                </>
            ) : !isPassUpdated ? (
                <>
                <p className="text-gray-600 text-sm text-center mb-6">
                    Set up a new password for your account and update username.
                </p>
                <PasswordSetup email={email} onSuccess={() => setIsPassUpdated(true)} resetPasswordState={resetPasswordState} />
                </>
            ) : (
                <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                   Password Updated!
                </h2>
                <p className="text-gray-600">Your password was updated</p>
                <button onClick={() => navigate("/")}>Go to Login</button>
                </div>
            )}
            </>

        {/* Toggle between Login and Registration */}
        <p onClick={toggleForm} className="text-blue-600 text-sm mt-4 text-center cursor-pointer hover:underline">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;