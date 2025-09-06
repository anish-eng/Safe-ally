// RegisterPage.jsx
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate,Link } from "react-router-dom";
// import { FiLogOut } from "react-icons/fi";
import QuickExitButton from "../pages/QuickExitButton";
import { db } from "../firebase/firebaseConfig";
import { Calendar,Eye,EyeOff} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success,setSuccess]=useState("")
  const [showPwd, setShowPwd] = useState(false);
//  const[location,]
 
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    const name=e.target.elements[0].value
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;
    // done in order to get actual form value
    const location=e.target.elements.namedItem('location').value
    console.log("location value",e.target.elements)
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Step 2: Immediately create their Firestore document
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
    
      if (!docSnap.exists()) {
        console.log()
        await setDoc(userRef, {
          email: user.email,
          displayName: name,        // You can collect from form if needed
          onboardingComplete: false,
          location:location,
          createdAt: new Date(),
          
        });

      }
      
      setSuccess("Your account has been created successfully! Redirecting you to login")
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      // navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password must be at least 6 characters long.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <>
   
   <div className="min-h-screen bg-gray-200 flex flex-col items-center px-4 py-6">
    <header className={`w-full max-w-[680px] mx-auto pt-6 pb-4 `}>
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
                Register with Safe Ally
              </h1>
              <p className="text-sm text-gray-600">Enter your basic details </p>
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
      

   
          {/* <FiLogOut size={24} /> */}
          <QuickExitButton/>
     
        <h2 className="text-4xl font-bold text-center text-[#1e3a8a] mb-8">Register</h2>

        <form onSubmit={handleEmailRegister} className="space-y-5 mt-5">

        <input
            type="text"
            // onChange={(e)=>setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
       
          <div className="relative">
  <input
    type={showPwd ? "text" : "password"}
    placeholder="Password(must be atleast 6 characters)"
    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
  <button
    type="button"
    onClick={() => setShowPwd(v => !v)}
    aria-label={showPwd ? "Hide password" : "Show password"}
    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center text-gray-500 hover:text-gray-700"
  >
    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
</div>

          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="w-full bg-[#1e3a8a] text-white py-3 rounded-lg text-lg hover:bg-[#1e3a8a] transition"
          >
            Sign Up
          </button>
        </form>

        {success && (
          <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded text-sm text-center font-medium shadow">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm text-center font-medium shadow">
            {error}
          </div>
        )}
         


    
        <div className="mt-8 text-center text-sm text-blue-800">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
