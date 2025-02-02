import React, { useState } from 'react';
import EmailInput from "./EmailInput";
import VerifyCode from "./VerifyCode";
import PasswordSetup from "./PasswordSetup";
import '../App.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toggleForm = () => setIsLogin(!isLogin);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in with email: ${email}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        {isLogin ? (
          // Login Form
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="University Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        ) : (
          // Registration Flow (Email → Verification → Password)
          <>
            {!email ? (
              <>
                <p className="text-gray-600 text-sm text-center mb-6">
                  Enter your UofT email address to receive a verification code.
                </p>
                <EmailInput onSuccess={(enteredEmail) => setEmail(enteredEmail)} />
              </>
            ) : !isVerified ? (
              <>
                <p className="text-gray-600 text-sm text-center mb-6">
                  Check your email for the 6-digit verification code.
                </p>
                <VerifyCode email={email} onSuccess={() => setIsVerified(true)} />
              </>
            ) : !isRegistered ? (
              <>
                <p className="text-gray-600 text-sm text-center mb-6">
                  Set your username and password to complete registration.
                </p>
                <PasswordSetup email={email} onSuccess={() => setIsRegistered(true)} />
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎉 Registration Successful!
                </h2>
                <p className="text-gray-600">Your account has been created. You can now log in.</p>
              </div>
            )}
          </>
        )}

        {/* Toggle between Login and Registration */}
        <p onClick={toggleForm} className="text-blue-600 text-sm mt-4 text-center cursor-pointer hover:underline">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;

