import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/firebaseConfig";
import { toast } from 'react-toastify';



function useScrollLock(lock) {
  const prev = useRef("");
  useEffect(() => {
    if (lock) {
      prev.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev.current; };
    }
  }, [lock]);
}

function useFocusTrap(active, containerRef) {
  console.log("active, containerRef",active,containerRef)
  useEffect(() => {
    if (!active || !containerRef.current) return;

    // focus first focusable element on open
    const el = containerRef.current;
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(el.querySelectorAll(selector)).filter((n) => !n.hasAttribute('disabled'));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const previouslyFocused = document.activeElement;
    first && first.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        // do nothing (blocking modal) – you can allow closing on Esc if you want
        e.preventDefault();
      }
      if (e.key === "Tab" && focusables.length > 1) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [active, containerRef]);
}

// --- Modal rendered in a portal to <body> ---
function BlockingModal({ open, children }) {
  useScrollLock(open);
  const contentRef = useRef(null);
  useFocusTrap(open, contentRef);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay/backdrop: blocks interaction with page */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      {/* Centered content; responsive widths */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl bg-white p-5 shadow-xl outline-none"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function EmergencyFlow({ uid, onNavigateToEmergencySettings }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasContacts, setHasContacts] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [preference, setPreference] = useState("email"); // "sms" | "email" | "both"
  // const { setMsg, ToastEl } = useToast();

  async function loadSettings() {
    setLoading(true);
    try {
      const ref  = doc(db, "users", String(uid), "profile", "emergencyContact");
      const snap = await getDoc(ref);
      console.log('snap is',snap.data())
      // const snap = await getDoc(doc(db, "users", uid, "profile", "emergencyContact"));
      
      if (!snap.exists()) {
        setHasContacts(false);
        console.log("came in snap doesnt exist")
        return;
      }
      const data = snap.data() || {};

      
      if(data){
        setHasContacts(true)
      }
      else{
        setHasContacts(false)
      }
      
      setRecipients(data);
    } finally {
      setLoading(false);
    }
  }

  const onClickButton = async () => {
    
    await loadSettings();
    setOpen(true);
  };

  const callFunction = async () => {
    setSending(true);
    try {
      const sendEmergencyAlert = httpsCallable(functions, "sendEmergencyAlert");
      await sendEmergencyAlert({}); // server reads contacts by uid
      toast.success("Your Emergency email was sent successfully!")
      setOpen(false);
    } catch (e) {
      const code = e && e.code ? String(e.code) : String(e.message || "");
      if (code.includes("failed-precondition")) {
        alert("No emergency contact set. Please add one and try again.");
        onNavigateToEmergencySettings();
      } else {
        alert(e?.message || "Failed to send alert");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Sidebar button (responsive target size) */}
      <button
  onClick={onClickButton}
  className="w-full flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl border bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
  aria-label="Emergency"
  title="Emergency"
>
  
  <span aria-hidden="true" className="text-base md:text-lg leading-none">🆘</span>
  <span className="hidden sm:inline text-sm md:text-base font-medium whitespace-nowrap">
    Emergency
  </span>
</button>

   

  <BlockingModal open={open}>
  {loading ? (
    <div className="text-sm text-slate-600" >Loading…</div>
  ) : hasContacts ? (
<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-lg" data-nav='emergency' >
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {/* Orange alert icon */}
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-orange-600"
        >
          <path d="M12 2 1 21h22L12 2zm0 4.77 7.53 13.23H4.47L12 6.77zM11 10v5h2v-5h-2zm0 6v2h2v-2h-2z" />
        </svg>
      </div>
      <h2 className="text-lg md:text-xl font-semibold text-red-600">
        Send emergency alert?
      </h2>
    </div>
    <button className="text-slate-400 hover:text-slate-600" onClick={()=>setOpen(false)}>✕</button>
  </div>
  <p className="text-slate-600 mb-3">We will notify your contact</p>
<div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
  {/* NAME chip + value */}
  <div className="flex items-center gap-2 min-w-0">
    <span className="inline-flex items-center rounded-md border border-[#1e3a8a] bg-[#1e3a8a] text-white text-[10px] font-semibold px-2 py-0.5">
      NAME:
    </span>
    <span
      className="truncate text-sm font-semibold text-slate-900"
      title={recipients?.fullName || recipients?.relationship || "Contact"}
    >
      {recipients?.fullName || recipients?.relationship || "Contact"}
    </span>
  </div>
  <div className="mt-2 flex items-center gap-2 min-w-0">
    <span
      className={`inline-flex items-center rounded-md border text-[10px] font-semibold px-2 py-0.5 ${
        ((recipients?.contactmethod || "email").toLowerCase() === "sms" ||
          (recipients?.contactmethod || "email").toLowerCase() === "text")
          ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
          : "border-[#1e3a8a] bg-[#1e3a8a] text-white"
      }`}
    >
      {((recipients?.contactmethod || "email").toLowerCase() === "sms" ||
        (recipients?.contactmethod || "email").toLowerCase() === "text")
        ? "SMS"
        : "EMAIL:"}
    </span>
    <span
      className="truncate text-sm font-medium text-slate-800"
      title={
        ((recipients?.contactmethod || "email").toLowerCase() === "sms" ||
          (recipients?.contactmethod || "email").toLowerCase() === "text")
          ? (recipients?.phone || "")
          : (recipients?.email || "")
      }
    >
      {((recipients?.contactmethod || "email").toLowerCase() === "sms" ||
        (recipients?.contactmethod || "email").toLowerCase() === "text")
        ? (recipients?.phone || "—")
        : (recipients?.email || "—")}
    </span>
  </div>
</div>
  <div className="mt-5 flex justify-end gap-3">
    <button onClick={()=>setOpen(false)}className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      No
    </button>
    <button onClick={callFunction} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
      Yes
    </button>
  </div>
</div>
  ) : (
    <div>
      <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#1e3a8a]">No emergency contact set</h3>
      <p className="text-sm text-slate-600 mb-4">
        Add a contact (phone or email) and try again.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
        <button
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1e3a8a] text-white hover:bg-[#19306f]"
          onClick={() => { setOpen(false); onNavigateToEmergencySettings(); }}
        >
          Go to Emergency Contact
        </button>
      </div>
    </div>
  )}
</BlockingModal>
    </>
  );
}
