import React from "react";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import OnboardingPage from "../pages/OnBoarding";
import {db} from "../firebase/firebaseConfig";
import { useEffect,useState } from "react";
import EmergencyFlow from "../pages/EmergencyButton";
import QuickExitButton from "../pages/QuickExitButton";

const FEATURE_BY_HREF = {
  "/dashboard": "journal",
  "/dashboard/view": "journal",
  "/dashboard/files": "vault",
  "/dashboard/profile": "contacts",
  "/dashboard/onboarding": "emergency",
  "/dashboard/help": "help", // optional
};

const DashboardLayout = () => {
  const tabs = [
    { name: "Info & Help", icon: "🛡️", href: "/dashboard/help" },
    { name: "Create an Entry", icon: "📝", href: "/dashboard" },
    { name: "View Journal Entry", icon: "📖", href: "/dashboard/view" },
    { name: "File Vault", icon: "🗂️", href: "/dashboard/files" },
    { name: "Add/Edit Emergency Contact", icon:"✏️",href: "/dashboard/onboarding" },
    { name: "Send Emergency message",icon: "🆘", href: "/dashboard/onboarding" },
    { name: "Edit/Add Profile details", icon:"👤",href: "/dashboard/profile" }
    
  ];
  const location = useLocation();
  const { logout } = useAuth();

  const auth = getAuth();
  const user=auth.currentUser
  const userId = auth.currentUser.uid;
  // Get user ID from mock auth
 
  const navigate = useNavigate();
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const provs = user?.providerData.map(p => p.providerId); 
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      setOnboardingComplete(userDoc.exists() && userDoc.data()?.onboardingComplete);
    };
    fetchData();
  }, [user]);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen">
   
      <div className="w-16 md:w-64 bg-[#1e3a8a] text-white flex flex-col py-6 md:py-6 px-2 md:px-4 shadow-md flex-shrink-0 sticky top-0 h-screen overflow-y-auto">

<div className="mb-6 md:mb-10 flex items-center justify-center md:justify-start gap-2">
  <div className="w-12 h-12 aspect-square rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center ring-1 ring-indigo-200/60 shadow-sm shrink-0">
    <img
      src="/translogo.png"
      alt="Safe Ally logo"
      className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
      draggable="false"
    />
  </div>
  <span className="hidden md:inline text-2xl font-bold tracking-wide">
    Safe Ally
  </span>
</div>


  <nav className="space-y-1 md:space-y-2 flex-1">
    {tabs.map((tab) => {
     if (tab.name === "Send Emergency message") {
      
      if (!user?.uid) {
        return (
          <button
            key="emergency-placeholder"
            className="w-full flex items-center gap-0 md:gap-3 px-0 md:px-4 py-3 rounded-xl font-medium border opacity-50 cursor-not-allowed"
            disabled
            title="Loading user…"
          >
            <span className="text-xl w-full md:w-auto flex justify-center md:justify-start">⚠️</span>
            <span className="hidden md:inline truncate">Send Emergency message</span>
          </button>
        );
      }

      return (
        <div key="emergency">
          <EmergencyFlow
            uid={user.uid}
            onNavigateToEmergencySettings={() => navigate("/dashboard/onboarding")}
          />
        </div>
      );
    }
      const isActive = location.pathname === tab.href;
      return (
        <NavLink
          key={tab.name}
          to={tab.href}
          data-nav={FEATURE_BY_HREF[tab.href] || undefined} 
          className={`group flex items-center gap-0 md:gap-3 px-0 md:px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/40 ${
            isActive
              ? "bg-white text-[#1e3a8a] shadow-sm"
              : "hover:bg-[#2a44a6] text-white"
          }`}
        >
          <span className="text-xl w-full md:w-auto flex justify-center md:justify-start">
            {tab.icon}
          </span>
          <span className="hidden md:inline truncate">{tab.name}</span>
        </NavLink>
      );
    })}
  </nav>

  <button
    onClick={handleLogout}
    className="mt-2 md:mt-auto flex items-center gap-0 md:gap-3 px-0 md:px-4 py-3 rounded-xl font-medium transition-all hover:bg-red-500 text-white w-full text-left focus:outline-none focus:ring-2 focus:ring-white/40"
  >
    <span className="text-xl w-full md:w-auto flex justify-center md:justify-start">🚪</span>
    <span className="hidden md:inline">Logout</span>
  </button>
</div>


      {/* Content Area */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <ToastContainer  closeOnClick position="bottom-center" autoClose={3000} />

        <Outlet /> 
      </div>
      <QuickExitButton />
    </div>
  );
};

export default DashboardLayout;











