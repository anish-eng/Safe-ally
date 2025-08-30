




import React, { useMemo, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import { Calendar } from "lucide-react";




const PASTEL_COLORS = [
  "#FDE68A", "#C7D2FE", "#FCA5A5", "#86EFAC",
  "#93C5FD", "#FBCFE8","#A7F3D0","#F5D0FE"
];

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
const SLICES = [
  {
    id: "intimidation",
    label: "Intimidation",
    short: "The app provides a journalling feature where you can keep a track of any violence/intimidation incidents so you can validate your thoughts and take action accordingly.",
    long:
      "Using fear to control you. This can involve breaking objects, invading your personal space, looming over you, punching walls, or giving you threatening looks. The goal is to make you second-guess yourself and comply to avoid escalation.",
    example:
      "They slam doors and punch the wall next to your head during arguments, and you change your behavior to avoid ‘setting them off.’",
    feature: "journal",
  },
  {
    id: "emotional",
    label: "Emotional Abuse",
    short: "The app provides an empathetic and memory-aware chatbot that you can chat with to get information about any aspect of abuse, or seek validation or just share your feelings. The chatbot will remember and reference your past incidences.",
    long:
      "Words and actions used to chip away at your self-worth: name-calling, humiliation (public or private), constant criticism, jealousy framed as ‘love,’ guilt trips, and threats of abandonment. Emotional abuse often makes you doubt your value and accept mistreatment as normal.",
    example:
      "They call you ‘useless’ or ‘crazy,’ then later insist it was a joke or that you’re too sensitive.",
    feature: "chatbot",
  },
  {
    id: "isolation",
    label: "Isolation",
    short: "The app provides an empathetic and memory-aware chatbot that you can talk with to share your feelings and reduce feelings of loneliness and isolation. However it is not a replacement for real social interaction. ",
    long:
      "Cutting you off from people, places, and information that could help you. They may monitor your time, discourage work/school, pick fights before social plans, or insist on being present for every interaction, making you dependent on them.",
    example:
      "They get angry when you call your sister, accuse friends of ‘interfering,’ and insist you cancel visits with family.",
    feature: "chatbot",
  },
  {
    id: "minimizing",
    label: "Minimizing / Denying / Blaming",
    short: "By using the app's journaling feature to keep track of incidences of violence/blame, you can prevent self-doubt and have properly documented information that can be helpful when you seek legal/medical assistance in the future. ",
    long:
      "Rewriting events to make you doubt your memory (‘That’s not what happened’), downplaying harm (‘It wasn’t that bad’), or shifting responsibility (‘You made me do it’). This creates confusion and keeps you from seeking help.",
    example:
      "After yelling for an hour, they say, ‘You’re overreacting; I only raised my voice because you provoked me.’",
    feature: "journal",
  },
  {
    id: "children",
    label: "Using Children / Dependents",
    short: "They threaten to take the children or use them to control you.",
    long:
      "Manipulating you through children or dependents. This can include using visitation to harass you, turning kids against you, making threats about custody, or withholding essential caregiving information or resources.",
    example:
      "They say, ‘If you leave, you’ll never see the kids again,’ or schedule exchanges to force contact and conflict.",
    feature: "vault",
  },
  {
    id: "economic",
    label: "Economic Abuse",
    short: "The File Vault feature of the app, can help prevent economic abuse by serving as a safe place to store documents - it is a secure file storage system where you can save your sensitive documents like passport, financial documents,etc which you might need in the future when you seek help. ",
    long:
      "Limiting your independence by restricting financial access: taking your paycheck, forcing you to account for every purchase, racking up debt in your name, blocking work or education, or sabotaging transportation and childcare.",
    example:
      "They keep your debit card, demand all receipts, and accuse you of ‘wasting money’ if you buy personal items.",
    feature: "vault",
  },
  {
    id: "privilege",
    label: "Unfair and excess control",
    short: "Use the journaling feature in the app to document incidences where unfair and excess control is imposed. This serves as a point of accountability and record for how frequently and the nature of incidences occuring and can be helpful while seeking legal/medical assistance.",
    long:
      "Invoking roles, stereotypes, or status to justify control. They treat you like a servant, make major decisions without you, or set different rules for themselves (‘my rules don’t apply to me’), undermining your autonomy and equality.",
    example:
      "They insist you handle all chores and caregiving, while they control finances and forbid you from questioning decisions.",
    feature: "journal",
  },
  {
    id: "coercion",
    label: "Coercion & Threats",
    short: "Use the emergency button feature to alert a trusted family member through email/SMS during critical situations. To successfully send this alert,set up an emergency contact in the add/edit emergency contact page.",
    long:
      "Pressure or threats to force compliance: threats of violence, self-harm, calling authorities, outing private information, or destroying property/pets. Coercion creates a constant sense of danger and urgency to obey.",
    example:
      "They say, ‘If you leave, I’ll ruin your reputation and call your employer,’ or threaten to hurt themselves to keep you from going.",
    feature: "emergency",
  },
];

// --- Lightweight modal (no external deps) ---
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[10000] flex items-center justify-center">
     
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-slate-100">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const MODAL_COPY = {
  journal: { title: "Journal — how it helps", text: "Keep secure, timestamped notes (text, audio, photos) to build a clear record and notice patterns over time. Use this to track and monitor how you are being treated and analyse if you need help" },
  vault: { title: "Vault — how it helps", text: "Store sensitive documents safely (IDs, paystubs, orders). Organize and retrieve them when you need proof or help. Could be a handy way to store important legal/sensitive documents." },
  contacts: { title: "Trusted Contacts — how it helps", text: "Add people you trust and reach them quickly if you need help. Your emergency alert Email/SMS will be sent to this contact." },
  emergency: { title: "Emergency Alert-how it helps", text: "Close the app view immediately and trigger an emergency alert to a contact by SMS or email if needed. Safety first, always." },
};

// Helper: split labels to max two lines inside the wheel
function splitLabel(label) {
  if (label.includes(" / ")) return label.split(" / ").slice(0, 2);
  const words = label.split(" ");
  if (words.length <= 2) return [label];
  const total = label.length;
  const target = Math.ceil(total / 2);
  let acc = "", first = [];
  for (let w of words) {
    if ((acc + w).length <= target) { first.push(w); acc = (acc ? acc + " " : "") + w; } else break;
  }
  const second = words.slice(first.length);
  if (!first.length || !second.length) return [label];
  return [first.join(" "), second.join(" ")];
}

export default function HelpResources() {
  // Tour state
  const [runTour, setRunTour] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [tourIndex, setTourIndex] = useState(0);
  const [pendingFeature, setPendingFeature] = useState(null);
  const [modalFeature, setModalFeature] = useState(null);

  // Wheel + selection
  const [selected, setSelected] = useState(null); // slice id
  const selectedSlice = SLICES.find((s) => s.id === selected) || null;

  // Bigger wheel; responsive container handles scaling
  const radius = 240;
  const center = { x: radius, y: radius };

  const slicePaths = useMemo(() => {
    const paths = [];
    const step = (2 * Math.PI) / SLICES.length;
    for (let i = 0; i < SLICES.length; i++) {
      const start = i * step - Math.PI / 2;
      const end = start + step;
      const x1 = center.x + radius * Math.cos(start);
      const y1 = center.y + radius * Math.sin(start);
      const x2 = center.x + radius * Math.cos(end);
      const y2 = center.y + radius * Math.sin(end);
      const d = [`M ${center.x} ${center.y}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`, "Z"].join(" ");
      paths.push({ d, midAngle: start + step / 2 });
    }
    return paths;
  }, [radius]);

  // Build steps for any feature, including chatbot
  const buildSteps = (feature) => {
   
    const isChat = feature === "chatbot";

     const firstPlacement  = isChat ? "left"  : "right";
 const secondPlacement = isChat ? "left"        : "bottom";

    const firstTarget = isChat
      ? '[data-tour="chatbot-button"], [data-nav="chatbot"]'
      : `[data-nav="${feature}"]`;

    const secondTarget = isChat
      ? '[data-tour="chatbot-panel"]'
      : `[data-tour="${feature}-modal"]`;

    const firstCopy =
      feature === "journal"
        ? "You’ll find the Journal here in the sidebar."
        : feature === "vault"
        ? "Open the Vault from this tab to access your secure documents."
        : feature === "contacts"
        ? "Manage your trusted contacts from this tab."
        : feature === "emergency"
        ? "Click here to send an Emergency Alert"
        : "Chat with us here any time. Click to open.";

    const secondCopy =
      feature === "journal"
        ? "This preview shows how you’d create a new entry."
        : feature === "vault"
        ? "A quick glimpse of uploading and organizing documents."
        : feature === "contacts"
        ? "A peek at adding a trusted contact."
        : feature === "emergency"
        ? "Preview of emergency actions you can take quickly."
        : "This is your chat window. Ask questions privately.";

    return [
      { target: firstTarget, content: firstCopy, placement: firstPlacement, disableBeacon: true },
      { target: secondTarget, content: secondCopy, placement: secondPlacement, disableBeacon: true },
    ];
  };

  // Start the “pro tour”: highlight sidebar/chat button → then modal/chat panel
  const startHighlightPreview = (feature) => {
    
    setPendingFeature(feature);
    
    setTourSteps(buildSteps(feature));
    setTourIndex(0);
    setRunTour(true);
  };



  // new onTour Callback


  const onTourCallback = (data) => {
    const { type, index, status } = data;
  
    // 0) Tour ended or skipped → full cleanup and bail
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setTourIndex(0);
      setPendingFeature(null);
      // NOTE: don't touch modalFeature here; if the user finished, it's fine to clear it.
      setModalFeature(null);
      return;
    }
  
    const isStepEvent = type === "step:after" || type === "target:notFound";

    if (!isStepEvent) return;
  
    // 1) After step 0, open the second window (modal/chat) and STOP the tour.
    if (index === 0 && pendingFeature) {
      if (pendingFeature === "chatbot") {
        document.dispatchEvent(new Event("safehaven:chatbot-open"));
      } else {
        setModalFeature(pendingFeature); // open the big modal
      }
  
      // Let React mount the modal/chat, then end the tour so no tooltip shows.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          // end tour without closing the modal/chat
          setRunTour(false);
          setTourIndex(0);
          setPendingFeature(null);
          // IMPORTANT: do NOT clear modalFeature here; keep the modal open.
        })
      );
      return; // don't fall through
    }
  
    // 2) For any other step events, just do nothing (no tooltips).
    // (Optional: defensively stop the tour if anything slips through)
    // setRunTour(false);
  };
  
  
  
  
  return (
    <>
    <div className="max-w-4xl mx-auto">
<div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6 mb-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div> */}
     <div
  className="w-12 h-12 aspect-square rounded-xl
             bg-gradient-to-r from-blue-500 to-pink-500
             flex items-center justify-center
             ring-1 ring-indigo-200/60 shadow-sm
             shrink-0 flex-none"
>
  <img
    src="/translogo.png"                       /* or import + use logoUrl */
    alt="Safe Ally logo"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Power and Control Wheel</h1>
            <p className="text-sm text-gray-600">Information on different aspects of abuse and how the app helps you....</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
  </div>
</div>
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
<div className="text-center px-4">
  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
    Understanding the Power &amp; Control Wheel
  </h1>

  <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
    The Power and Control Wheel explains how abuse can occur beyond physical harm—through
    control, isolation, intimidation, and more. Recognizing these patterns can help you spot
    unhealthy dynamics and choose safer next steps.
  </p>

  <p
    className="mt-4 text-indigo-600 font-medium max-w-3xl mx-auto flex items-center justify-center gap-2"
    aria-live="polite"
  >
    <span className="inline-block h-2 w-2 rounded-full bg-[#1e3a8a]" aria-hidden="true"></span>
    <span>Tap a slice to explore each pattern and see how SafeHaven can help.</span>
  </p>
</div>


      {/* Wheel + Side Card */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Wheel */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[720px] aspect-square">
            {/* Spinning halo */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(59,130,246,0.12), rgba(236,72,153,0.12), rgba(20,184,166,0.12), rgba(59,130,246,0.12))",
                filter: "blur(18px)",
                animation: "spin-slower 50s linear infinite",
              }}
              aria-hidden="true"
            />
            {/* Soft glow ring */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-pink-100 via-indigo-100 to-teal-100 blur-2xl opacity-70" aria-hidden="true" />

            {/* Static wheel */}
            <svg viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="relative drop-shadow-xl" role="img" aria-label="Power and Control Wheel">
              <circle cx={center.x} cy={center.y} r={radius - 1} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="2" className="animate-pulse"/>

              {slicePaths.map((seg, i) => {
                const color = PASTEL_COLORS[i % PASTEL_COLORS.length];
                const isActive = selected === SLICES[i].id;
                const mid = seg.midAngle;
                const labelR = radius * 0.62;
                const lx = center.x + labelR * Math.cos(mid);
                const ly = center.y + labelR * Math.sin(mid);
                const lines = splitLabel(SLICES[i].label);

                return (
                  <g key={SLICES[i].id}>
                    <path
                      d={seg.d}
                      fill={color}
                      role="button"
                      tabIndex={0}
                      aria-label={`${SLICES[i].label}. Click to learn more.`}
                      className={`wheel-slice cursor-pointer transition-transform duration-500 ease-out  ${isActive ? "opacity-100" : "opacity-95 hover:opacity-100"}`}
                      style={{ outline: "none" }}
                      onClick={() => setSelected(SLICES[i].id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(SLICES[i].id)}
                      stroke="rgba(15,23,42,0.08)"
                      strokeWidth={isActive ? 2 : 1}
                    />
                    <g style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.9))" }}>
                      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                        className={`select-none pointer-events-none font-semibold ${isActive ? "fill-slate-900" : "fill-slate-800"}`}
                        style={{ fontSize: 14 }}>
                        {lines.length === 1 ? (
                          lines[0]
                        ) : (
                          <>
                            <tspan x={lx} dy="-0.5em">{lines[0]}</tspan>
                            <tspan x={lx} dy="1.2em">{lines[1]}</tspan>
                          </>
                        )}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center badge */}
              <circle cx={center.x} cy={center.y} r={radius * 0.34} fill="#ffffff" stroke="rgba(15,23,42,0.06)" />
              <text x={center.x} y={center.y - 6} textAnchor="middle" className="font-extrabold fill-slate-900" style={{ fontSize: 18 }}>
                Power &amp; Control
              </text>
              <text x={center.x} y={center.y + 16} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 12 }}>
                Recognize the patterns
              </text>
            </svg>
          </div>
        </div>

        {/* Side card (longer context + example + single CTA) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-7">
          {!selectedSlice ? (
            <div className="text-center text-slate-600">
              <p className="mb-2">Tap a section of the wheel to learn more.</p>
              <p className="text-sm">You’ll see what it looks like and how the app can help.</p>
            </div>
          ) : (
            <div aria-live="polite">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedSlice.label}</h2>
                  <p className="mt-2 text-slate-700">{selectedSlice.long}</p>
                  <p className="mt-3 text-slate-700"><span className="font-semibold">Example:</span> {selectedSlice.example}</p>
                </div>
                {/* <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-200">
                  Learn &amp; Act
                </span> */}
              </div>

              <div className="mt-5 rounded-2xl bg-gray-100 border border-[#8789C0] p-4">
              {/* gradient-to-br from-indigo-50 to-teal-50 */}
                <div className="text-sm text-[#1e3a8a]">
                  <p className="font-semibold">How the app helps</p>
                  <p className="mt-1">{selectedSlice.short}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => startHighlightPreview(selectedSlice.feature)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] text-white px-5 py-2.5 text-sm font-semibold shadow hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Show where & preview
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-[#8789C0] bg-[#8789C0] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#8789C0]"
                >
                  Back to wheel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={tourIndex}
        continuous
        showSkipButton
        showProgress={false}
        scrollToFirstStep
        disableScrolling={false}
        // lock page scroll while the tour is open
 spotlightPadding={8}
floaterProps={{ offset: 16, disableFlip: true }} 
        styles={{ options: { zIndex: 9999 }, tooltipContainer: {
          maxWidth: 380,
          maxHeight: 'calc(100vh - 96px)',
      
          overflowY: 'auto',
        },
        tooltip:{
          
            border:"3px solid #1e3a8a "
         
        },
        buttonNext: {
          backgroundColor: "#1e3a8a",   
          color: "#ffffff",              
          fontWeight: 600 ,        
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          outline: 'none' , 
          
        },
        buttonSkip:{
          backgroundColor: '#8789C0', 
          color:"#ffffff"
        }
       
       }}
        scrollOffset={150}          
      

   
 
      
        callback={onTourCallback}
        locale={{
          back: "Back",
          close: "Skip",
          next: (pendingFeature === "chatbot" ) 
                  ? "Finish" 
                  : "Next",
          last: "Finish"
        }}
      />

      <Modal
        open={!!modalFeature}
        onClose={() => { setModalFeature(null); setRunTour(false); setTourIndex(0); }}
        title={modalFeature ? MODAL_COPY[modalFeature].title : ""}
        
      >
        {modalFeature && (
          <div className="space-y-4">
            <p className="text-slate-700">{MODAL_COPY[modalFeature].text}</p>
            <div data-tour={`${modalFeature}-modal`} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              {modalFeature === "journal" && (
                <div>
                  <div className="text-sm font-semibold mb-2">Journal preview</div>
                  <textarea className="w-full h-24 border rounded p-2" placeholder="New entry..." />
                </div>
              )}
              {modalFeature === "vault" && (
                <div>
                  <div className="text-sm font-semibold mb-2">Vault preview</div>
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded">Upload doc</button>
                </div>
              )}
              {modalFeature === "contacts" && (
                <div>
                  <div className="text-sm font-semibold mb-2">Trusted contacts</div>
                  <button className="px-3 py-2 bg-green-600 text-white rounded">Add Contact</button>
                </div>
              )}
              {modalFeature === "emergency" && (
                <div>
                  <div className="text-sm font-semibold mb-2">Emergency actions</div>
                  <button className="px-3 py-2 bg-red-600 text-white rounded">Emergency</button>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setModalFeature(null); setRunTour(false); }}
                className="px-4 py-2 rounded border border-slate-200 bg-[#1e3a8a] text-white text-sm font-semibold shadow hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </>
  );
}
