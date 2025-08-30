// src/components/ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import QuickExitButton from "../pages/QuickExitButton";
import { Calendar } from "lucide-react";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const oobCode = params.get("oobCode");
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          setVerified(true);
          setCode(oobCode);
        })
        .catch(() => {
          setMessage("Invalid or expired reset link.");
        });
    } else {
      setMessage("Missing reset code.");
    }
  }, [auth, params]);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await confirmPasswordReset(auth, code, newPassword);
      setMessage("✅ Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("❌ Error resetting password: " + err.message);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  return (
    // <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center px-4 py-6 gap-6">
    <div className="min-h-screen bg-gray-200 flex flex-col items-center px-4 py-6 gap-6">
      <QuickExitButton/>



      {/* <header className={`w-full max-w-[680px] mx-auto pt-2 pb-4 `}> */}
      <header className="w-full max-w-[680px] mx-auto px-4 pt-2 pb-4">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* logo block untouched */}
            <div className="w-12 h-12 aspect-square rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center ring-1 ring-indigo-200/60 shadow-sm shrink-0">
              <img
                src="/translogo.png"
                alt="SafeHaven logo"
                className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Reset Password
              </h1>
              <p className="text-sm text-gray-600">Enter your new password</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
      </div>
    </header>
    <div className="w-full max-w-[680px] mx-auto px-4">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 relative">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#1e3a8a]">Reset Password</h2>
        {verified ? (
          <form onSubmit={handleReset} className="space-y-5">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white py-2 rounded-lg hover:bg-[#1e3a8a] transition"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <p className="text-center text-red-600 font-medium">{message}</p>
        )}
        {message && verified && (
          <p className="text-center text-sm text-gray-700 mt-4">{message}</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default ResetPassword;
