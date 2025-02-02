import { useState } from "react";
import axios from "axios";


function VerifyCode({ email, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (code.length !== 6 || isNaN(code)) {
      setMessage("Enter a valid 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/verify-code", {
        email,
        code,
      });
      setMessage(response.data.message);
      onSuccess(); // Proceed to the next step (e.g., password setup)
    } catch (error) {
      setMessage(error.response?.data?.detail || "Invalid or expired verification code.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Your Verification Code</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength="6"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
          required
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
        {message && <p className="mt-2 text-center text-red-600">{message}</p>}
      </form>
    </div>
  );
}

export default VerifyCode;
