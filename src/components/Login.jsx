


import React, { useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection, query, where, limit, getDocs,
   serverTimestamp
} from "firebase/firestore";
import { Calendar,Eye,EyeOff } from "lucide-react";
import { useNavigate ,Link} from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // your Firestore config
import QuickExitButton from "../pages/QuickExitButton";

const Login = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const auth = getAuth();
  const [showPwd, setShowPwd] = useState(false);



const canonicalEmail = (e = "") => e.trim().toLowerCase();

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const checkOnboardingAndRedirect = async (user) => {
  console.log("user checkOnboarding",user)
  const raw = user?.email || "";
  const emailLC = canonicalEmail(raw);
  console.log("emailLC",emailLC)
  if (!emailLC) { navigate("/dashboard/onboarding");
    
     return; }

  const usersCol = collection(db, "users");

  // 1) Try exact (legacy docs may have been saved with original case)
  let snap = await getDocs(query(usersCol, where("email", "==", raw), limit(1)));
   console.log("snap exists, is it empty",snap,snap.empty)
  if (snap.empty && raw !== emailLC) {
    snap = await getDocs(query(usersCol, where("email", "==", emailLC), limit(1)));
  }

  if (!snap.empty) {
    const data = snap.docs[0].data();
    console.log("there is an existing documentcalready",data)

    navigate(data?.onboardingComplete ? "/dashboard" : "/dashboard/onboarding");
    return;
  }

  
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: emailLC,                    // store lowercased going forward
      displayName: user.displayName || "",
      onboardingComplete: false,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  navigate("/dashboard/onboarding");
};

  // 🔐 Email login handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await checkOnboardingAndRedirect(user);
    } catch (error) {
      setErr("Invalid credentials! Signup if you haven't registered yet.");
    }
  };

  // 🔐 Google login handler
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await checkOnboardingAndRedirect(user);
    } catch (error) {
      setErr("Google login failed.");
    }
  };
return (
  <div className="min-h-screen bg-gray-200">
    {/* Quick Exit stays fixed */}
    <QuickExitButton />
    {/* Header card — SAME WIDTH */}
    <header className={`w-full max-w-[680px] mx-auto px-4 pt-6 pb-4 `}>
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6">
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
                Login to Safe Ally
              </h1>
              <p className="text-sm text-gray-600">Enter your details or use Google to login</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
      </div>
    </header>

    {/* Main content (welcome + form) — SAME WIDTH */}
    <main className={`w-full max-w-[680px] mx-auto px-4`}>
      {/* Optional welcome copy; remove if you want the form higher */}
      

      {/* Login card — SAME WIDTH & style as header */}
      <section className="mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          {/* your existing form exactly as-is */}
          <h3 className="text-4xl font-bold text-center text-[#1e3a8a] mb-8">Log In</h3>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
         

<div className="relative">
  <input
    type={showPwd ? "text" : "password"}
    name="password"
    placeholder="Password"
    autoComplete="current-password"
    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
  <button
    type="button"
    onClick={() => setShowPwd((v) => !v)}
    aria-label={showPwd ? "Hide password" : "Show password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center text-gray-500 hover:text-gray-700"
  >
    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
</div>
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white py-3 rounded-lg text-lg hover:bg-[#1e3a8a] transition"
            >
              Log In
            </button>
          </form>

          {err && (
            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center font-medium shadow">
              {err}
            </div>
          )}

          <div className="flex items-center justify-center my-6">
            <div className="border-t w-1/4"></div>
            <span className="mx-4 text-gray-600">OR</span>
            <div className="border-t w-1/4"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#8789C0] text-white py-3 rounded-lg text-lg hover:bg-[#8789C0] transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6 bg-white rounded-full p-1"
            />
            Continue with Google
          </button>

          <div className="mt-8 flex flex-col items-center space-y-2 text-sm sm:text-base text-gray-700 font-medium">
            <Link to="/forgot-password" className="text-[#1e3a8a] hover:text-[#1e3a8a] hover:underline transition duration-200">
              Forgot Password?
            </Link>
            <Link to="/register" className="text-[#1e3a8a] hover:text-[#1e3a8a] hover:underline transition duration-200">
              Don’t have an account? <span className="font-semibold">Register</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  </div>
);

};

export default Login;
