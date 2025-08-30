// QuickExitButton.jsx
import React from "react";
import { lock } from "../stealth/stealth";

export default function QuickExitButton() {
  const applyExitState = () => {
    // TODO: your cookie/localStorage lock/unlock logic
    // localStorage.setItem("sh.lastExitAt", String(Date.now()));
  };



  const exitNow = () => {
    try { document.documentElement.setAttribute("data-exiting", ""); }
    finally {
      lock();  
      sessionStorage.removeItem("sh.lastTarget");                        
      window.location.replace("/");    
    }
  };

  return (
    <div
      className="fixed z-[9999] group
                 [top:calc(env(safe-area-inset-top,0px)+0.75rem)]
                 [right:calc(env(safe-area-inset-right,0px)+0.75rem)]"
    >
      <button
        onClick={exitNow}
        aria-label="Quick Exit to quotes page"
        aria-describedby="qe-tooltip"
        className="inline-flex items-center gap-2 rounded-full
                   bg-red-600 text-white font-bold
                   px-4 sm:px-5 py-2.5 sm:py-3
                   text-sm sm:text-base
                   shadow-lg ring-2 ring-red-300/40
                   hover:opacity-95 active:scale-[.98]
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
         Quick Exit
      </button>

      {/* Tooltip */}
      <div
        id="qe-tooltip"
        role="tooltip"
        className="pointer-events-none absolute right-0 mt-2 w-72 max-w-[80vw]
                   rounded-xl border border-purple-600 bg-white text-black shadow-lg
                   opacity-0 translate-y-1 transition
                   group-hover:opacity-100 group-hover:translate-y-0
                   group-focus-within:opacity-100"
      >
        {/* Arrow pointer */}
        <span
          className="absolute -top-1 right-4 w-3 h-3 bg-white rotate-45
                     border-t border-l border-purple-600"
          aria-hidden="true"
        />
        <div className="p-3 text-[12px] leading-snug">
          Click here to quickly exit this page and go back to the dummy motivational quotes page for your safety.
        </div>
      </div>
    </div>
  );
}
