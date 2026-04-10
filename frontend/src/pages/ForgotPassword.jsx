import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import firebase, { firestore } from "../firebase/firebaseConfig.js"; // Ensure this is your auth instance
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // 1. Manually check if the user exists in your Firestore 'users' collection
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef,
        where("email", "==", email.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No account found with this email address.");
        setLoading(false);
        return; // Stop here
      }

      // 2. If user exists in DB, proceed with Firebase Auth reset
      await sendPasswordResetEmail(firebase, email);

      setMessage("Reset link sent! Please check your email inbox.");
      // Optional: Auto-close after 3 seconds so they can see the message
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 3000);
    } catch (err) {
      // Use the helper we discussed to map err.code
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = () => {
    setEmail("");
    setError("");
    setMessage("");
    setLoading(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Overlay to close when clicking outside */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleCleanup}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition"
              placeholder="name@company.com"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 font-medium">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold transition-all ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
