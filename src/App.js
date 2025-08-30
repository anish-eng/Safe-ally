
// ************new updated code of App.jsx incorporating safety lock
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import DisguisedQuotes from "./components/DisguisedQuotes";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Journal from "./pages/Journal";
import FileVault from "./pages/FileVault";
import HelpResources from "./pages/HelpResources";
import EscapePlan from "./pages/EscapePlan.jsx";
import JournalList from "./pages/JournalList.jsx";
import FloatingChat from "./pages/FloatingChat.jsx";
import OnboardingPage from "./pages/OnBoarding.jsx";
import ProfileUpdatePage from "./pages/EditProfile.jsx";

// import LoginGate from "./components/LoginProtect";
import LoginGate from "./components/LoginProtect.jsx";
// import ProtectedStealthRoute from "./components/ProtectStealth";
import ProtectedStealthRoute from "./components/ProtectStealth.jsx";
// import { unlock } from "./stealth";  // ⟵ use this in onUnlock
import { unlock } from "./stealth/stealth.js";

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const navigate = useNavigate();

  // Called by your quotes page's secret gesture
  const handleUnlock = () => {
    unlock(30 * 60 * 1000); 
    const target = sessionStorage.getItem("sh.lastTarget") || "/dashboard";
    navigate(target, { replace: true });
  };

  return (
    <Routes>
      {/* Decoy / quotes page */}
      <Route path="/" element={<DisguisedQuotes onUnlock={handleUnlock} />} />

      {/* Public pages — gated by stealth (hidden when locked) */}
      <Route path="/login" element={<LoginGate><Login /></LoginGate>} />
      <Route path="/register" element={<LoginGate><Register /></LoginGate>} />
      <Route path="/forgot-password" element={<LoginGate><ForgotPassword /></LoginGate>} />

      {/* Public page you kept open (no gate) */}
      <Route path="/reset-password" element={<LoginGate><ResetPassword /></LoginGate>} />

      {/* Protected app */}
      <Route
        path="/dashboard"
        element={
          <ProtectedStealthRoute>
            <ProtectedRoutes>
              <FloatingChat/>
              <DashboardLayout />
            </ProtectedRoutes>
          </ProtectedStealthRoute>
        }
      >
        <Route index element={<Journal />} />
        <Route path="files" element={<FileVault />} />
        <Route path="help" element={<HelpResources />} />
        <Route path="escape" element={<EscapePlan />} />
        <Route path="view" element={<JournalList />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="profile" element={<ProfileUpdatePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;




