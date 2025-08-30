import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isUnlocked } from "../stealth/stealth";

export default function LoginGate({ children }) {
  const loc = useLocation();
 
  if (!isUnlocked()) {
    // remember what they wanted to open
    sessionStorage.setItem("sh.lastTarget", loc.pathname + loc.search);
    return <Navigate to="/" replace />; // your quotes page at "/"
  }
  return children;
}
