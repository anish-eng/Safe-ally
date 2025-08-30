import React from "react";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import OnboardingPage from "../pages/OnBoarding";
import { auth,db} from "../firebase/firebaseConfig";
import { useEffect,useState } from "react";

const DashboardLayout = () => {
  const tabs = [
    { name: "Create an Entry", icon: "📝", href: "/dashboard" },
    { name: "File Vault", icon: "🗂️", href: "/dashboard/files" },
    { name: "Info & Help", icon: "🛡️", href: "/dashboard/help" },
    { name: "Escape Plan", icon: "🏃‍♀️", href: "/dashboard/escape" },
    { name: "View Journal Entry", icon: "📖", href: "/dashboard/view" },
    { name: "Add/Edit Emergency Contact", icon: "🛟", href: "/dashboard/onboarding" }
  ];

  

  const location = useLocation();
  const { logout } = useAuth();

  const { currentUser} = useAuth();
  const navigate = useNavigate();
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       const userRef = doc(db, "users", user.uid);
  //       const userDoc = await getDoc(userRef);
  //       const onboardingDone = userDoc.exists() && userDoc.data()?.onboardingComplete;
  
  //       if (!onboardingDone) {
  //         navigate("/onboarding");
  //       } else {
  //         navigate("/dashboard");
  //       }
  //     }
  //   });
  
  //   return () => unsubscribe();
  // }, []);


  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      setOnboardingComplete(userDoc.exists() && userDoc.data()?.onboardingComplete);
    };
    fetchData();
  }, [currentUser]);
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
      {/* Sidebar */}
      {/* <div className="w-64 bg-[#1e3a8a] text-white flex flex-col py-6 px-4 shadow-md flex-shrink-0">
        <h1 className="text-2xl font-bold mb-10 text-center tracking-wide">SafeHaven</h1>
        <nav className="space-y-2 flex-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#1e3a8a] shadow-sm"
                    : "hover:bg-[#2a44a6] text-white"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all hover:bg-red-500 text-white w-full text-left"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div> */}

      {/* Content Area */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <ToastContainer  closeOnClick position="bottom-center" autoClose={3000} />
        <Outlet /> {/* 🔥 This is where pages like FileVault appear */}
      </div>
    </div>
  );
};

export default DashboardLayout;



// import React, { useEffect, useState, useMemo } from "react";
// import { useLocation, NavLink, Outlet, useNavigate } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import { doc, getDoc } from "firebase/firestore";
// import { useAuth } from "../context/AuthContext";
// import { db } from "../firebase/firebaseConfig";
// import OnboardingPage from "../pages/OnBoarding";

// const DashboardLayout = () => {
//   const tabs = useMemo(
//     () => [
//       { name: "Create an Entry", icon: "📝", href: "/dashboard" },
//       { name: "File Vault", icon: "🗂️", href: "/dashboard/files" },
//       { name: "Info & Help", icon: "🛡️", href: "/dashboard/help" },
//       { name: "Escape Plan", icon: "🏃‍♀️", href: "/dashboard/escape" },
//       { name: "View Journal Entry", icon: "📖", href: "/dashboard/view" },
//     ],
//     []
//   );

//   const location = useLocation();
//   const navigate = useNavigate();
//   const { currentUser, logout } = useAuth();
//   const [onboardingComplete, setOnboardingComplete] = useState(null); // null = loading

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       if (!currentUser) {
//         if (mounted) setOnboardingComplete(false);
//         return;
//       }
//       const snap = await getDoc(doc(db, "users", currentUser.uid));
//       if (!mounted) return;
//       setOnboardingComplete(!!(snap.exists() && snap.data()?.onboardingComplete));
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [currentUser]);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate("/");
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-[#1e3a8a] text-white flex flex-col py-6 px-4 shadow-md flex-shrink-0">
//         <h1 className="text-2xl font-bold mb-10 text-center tracking-wide">SafeHaven</h1>
//         <nav className="space-y-2 flex-1">
//           {tabs.map((tab) => {
//             const isActive = location.pathname === tab.href;
//             return (
//               <NavLink
//                 key={tab.name}
//                 to={tab.href}
//                 className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
//                   isActive ? "bg-white text-[#1e3a8a] shadow-sm" : "hover:bg-[#2a44a6] text-white"
//                 }`}
//               >
//                 <span className="text-xl">{tab.icon}</span>
//                 <span>{tab.name}</span>
//               </NavLink>
//             );
//           })}
//         </nav>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all hover:bg-red-500 text-white w-full text-left"
//         >
//           <span className="text-xl">🚪</span>
//           <span>Logout</span>
//         </button>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
//         <ToastContainer closeOnClick position="bottom-center" autoClose={3000} />

//         {onboardingComplete === null && (
//           <div className="text-gray-500">Loading…</div>
//         )}

//         {onboardingComplete === false && (
//           <div className="max-w-2xl mx-auto">
//             <OnboardingPage embedded />
//           </div>
//         )}

//         {onboardingComplete === true && (
//           <Outlet /> // Show the normal dashboard content when onboarding is complete
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;







