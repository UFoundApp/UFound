import { useState } from "react";
import axios from "axios";

function PasswordSetup({ email, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate input
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (username.length < 3) {
      setMessage("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/register", {
        email,
        username,
        password,
        confirm_password: confirmPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => onSuccess(), 1000); // Transition to next step
    } catch (error) {
      setMessage(error.response?.data?.detail || "Registration failed.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Your Account</h2>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          required
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {message && <p className="mt-2 text-center text-red-600">{message}</p>}
      </form>
    </div>
  );
}

export default PasswordSetup;

