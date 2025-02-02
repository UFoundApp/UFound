import { useState } from "react";
import axios from "axios";

function EmailInput({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate email format
    if (!email.endsWith("@mail.utoronto.ca")) {
      setMessage("Only @mail.utoronto.ca emails are allowed.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/send-verification-code", { email });
      setMessage(response.data.message);
      onSuccess(email); // Proceed to verification step
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to send verification email.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Your UofT Email</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@mail.utoronto.ca"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Verification Code"}
        </button>
        {message && <p className="mt-2 text-center text-red-600">{message}</p>}
      </form>
    </div>
  );
}

export default EmailInput;

