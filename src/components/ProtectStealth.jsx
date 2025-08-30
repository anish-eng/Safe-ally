import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isUnlocked } from "../stealth/stealth";

export default function ProtectedStealthRoute({ children }) {
    console.log("children",children)
  const loc = useLocation();
  console.log("unlocked is",isUnlocked)
  if (!isUnlocked()) {
    sessionStorage.setItem("sh.lastTarget", loc.pathname + loc.search);
    return <Navigate to="/" replace />;
  }
  return children;
}