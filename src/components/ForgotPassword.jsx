// ForgotPassword.jsx
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail , fetchSignInMethodsForEmail} from "firebase/auth";
import QuickExitButton from "../pages/QuickExitButton";
import { Calendar } from "lucide-react";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        console.log('merhods',methods)
        console.log(methods.includes('google.com'))
        if (methods.includes('google.com')){
          setError("❌ You previously signed in using google, use it to login now");
          return;
        }
        if (methods.length === 0) {
          setError("❌ Email does not exist. Please check or register first.");
          return;
        }
      // await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Check your inbox.");
      setError("");
    } catch (err) {
      setMessage("");
      setError("❌ Failed to send reset email. Please check the email and try again.");
      console.error(err);
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

    <div className="min-h-screen bg-gray-200 flex flex-col items-center px-4 py-6 gap-6">
           
    <QuickExitButton/>
    {/* <div className="bg-[#ffd5c5] rounded-xl shadow-lg w-full max-w-2xl p-12"> */}

    <header className={`w-full max-w-[680px] mx-auto pt-2 pb-4 `}>
      <div className="w-full bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* logo block untouched */}
            <div className="w-12 h-12 aspect-square rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center ring-1 ring-indigo-200/60 shadow-sm shrink-0">
              <img
                src="/translogo.png"
                alt="Safe Ally logo"
                className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Forgot password
              </h1>
              <p className="text-sm text-gray-600">Enter your email address for a reset email</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
      </div>
    </header>
    {/* <div className="bg-[#ffd5c5] rounded-xl shadow-lg w-full max-w-lg p-10 relative"> */}
       <div className="w-full max-w-[680px] mx-auto
             bg-white rounded-2xl shadow-xl
             p-6 sm:p-8 relative mt-6">

  
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-[#1e3a8a] text-white py-3 rounded-lg hover:bg-[#1e3a8a] transition"
          >
            Send Reset Email
          </button>

          <div className="mt-8 text-center text-sm text-blue-800">
          Already have an account?{' '}
          <a href="/login" className="font-semibold hover:underline">
            Log In
          </a>
        </div>
        </form>



        {message && (
          <div className="mt-4 text-green-700 bg-green-100 px-4 py-2 rounded text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-700 bg-red-100 px-4 py-2 rounded text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
