import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import {  db } from "../firebase/firebaseConfig";
import ExportJournal from "./ExportJournal";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const auth = getAuth();
const user = auth.currentUser;
const JournalList = () => {
  const [entries, setEntries] = useState([]);
  function formatDateWithSuffix(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
  
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
   
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  }


  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user);
      if (!user) return;

      try {
        console.log("Fetching journals for user:", user.email);
        const q = query(
          collection(db, "journalEntries"),
          where("email", "==", user.email),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched journal entries:", data);
        setEntries(data);
      } catch (err) {
        console.error("Error fetching journal entries:", err);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);
  const cardColors = [
    "bg-green-500 bg-opacity-10",
    "bg-blue-300 bg-opacity-20",
    "bg-blue-900 bg-opacity-10",
  ];
  return (




<>
<div className="max-w-4xl mx-auto">
<div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6 mb-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          
     <div
  className="w-12 h-12 aspect-square rounded-xl
             bg-gradient-to-r from-blue-500 to-pink-500
             flex items-center justify-center
             ring-1 ring-indigo-200/60 shadow-sm
             shrink-0 flex-none"
>
  <img
    src="/translogo.png"                       
    alt="SafeAlly"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">View Journal Entries </h1>
            <p className="text-sm text-gray-600">View and reflect on your journal entries. Export to excel or pdf if needed...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>  
      </div>
  </div>
</div>


<div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
<ExportJournal entries={entries} appName="SafeAlly" />
  {entries.map((entry, index) => (
    <div
      key={entry.id}
      className={`rounded-2xl shadow-lg border border-black/5 p-5 sm:p-6 ${cardColors[index % cardColors.length]}`}
    >
      {/* Header: date + 12-hour time inline */}
      <div className="mb-3">
        {entry.createdAt && (() => {
          const d = entry.createdAt.toDate();
          return (
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1e3a8a]">
              {`${formatDateWithSuffix(d)} at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`}
            </h3>
          );
        })()}
      </div>

      {/* Entry text – more prominent */}
      <p className="text-gray-900 text-base sm:text-lg leading-relaxed font-medium whitespace-pre-wrap">
        {entry.text}
      </p>

      {/* Media */}
      {(entry.media?.length || entry.audio) && (
        <div className="mt-4 space-y-4">
          {!!entry.media?.length && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {entry.media?.map((m, idx) => {
                const lightboxId = `lightbox-${entry.id}-${idx}`;
                const isImage = m.type === "image";
                return (
                  <div key={idx} className="relative">
                    {/* Invisible toggle */}
                    <input id={lightboxId} type="checkbox" className="peer hidden" />

                    {/* Thumbnail (opens lightbox) */}
                    <label
                      htmlFor={lightboxId}
                      className="block cursor-zoom-in rounded-lg overflow-hidden ring-1 ring-gray-200 hover:ring-indigo-300 transition group"
                      title={isImage ? "Click to preview image" : "Click to preview video"}
                    >
                      {isImage ? (
                        <img
                          alt="Journal attachment"
                          src={m.url}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <video
                          src={m.url}
                          className="aspect-[4/3] w-full bg-black"
                          muted
                        />
                      )}
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white">
                          Preview
                        </span>
                      </span>
                    </label>

                    {/* Download button on thumbnail */}
                    <a
                      href={m.url}
                      download
                      className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-700 ring-1 ring-gray-200 hover:ring-indigo-300"
                      title="Download"
                    >
                      Download
                    </a>

                    {/* Simple responsive lightbox */}
                    <div className="fixed inset-0 z-[10000] hidden peer-checked:flex items-center justify-center p-3 sm:p-6">
                      {/* Backdrop (click to close) */}
                      <label
                        htmlFor={lightboxId}
                        className="absolute inset-0 bg-black/70 cursor-zoom-out"
                        aria-label="Close preview"
                      />

                      {/* Modal shell */}
                      <div className="relative z-10 w-full max-w-screen-md sm:max-w-screen-lg">
                        <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10 bg-neutral-900">
                          {/* Controls row (wraps on small screens; safe-area padding) */}
                          <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2 sm:px-4 sm:py-3 text-white pt-[env(safe-area-inset-top)]">
                            <a
                              href={m.url}
                              download
                              className="rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow ring-1 ring-gray-200 hover:bg-white"
                              title="Download"
                            >
                              Download
                            </a>
                            <label
                              htmlFor={lightboxId}
                              className="rounded-md bg-black/70 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 cursor-pointer"
                              title="Close"
                            >
                              Close
                            </label>
                          </div>

                          {/* Media area (scrolls inside modal) */}
                          <div className="bg-black max-h-[75vh] sm:max-h-[80vh] overflow-auto">
                            {isImage ? (
                              <img
                                src={m.url}
                                alt="Preview"
                                className="block w-full h-auto max-h-[75vh] sm:max-h-[80vh] object-contain"
                              />
                            ) : (
                              <video
                                src={m.url}
                                controls
                                className="block w-full h-auto max-h-[75vh] sm:max-h-[80vh] bg-black"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* end lightbox */}
                  </div>
                );
              })}
            </div>
          )}

       
    

{entry.audio && (
  <div className="mt-2">
    {/* Full width on mobile; narrow cap on desktop */}
    <div className="w-full sm:max-w-[24rem]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl bg-white/90 ring-1 ring-gray-200 shadow-sm p-2 sm:p-2.5">
        <span className="text-xs font-semibold text-gray-600 shrink-0">Audio</span>

        {/* Player grows on desktop, fills on mobile */}
        <audio
          controls
          src={entry.audio}
          className="w-full sm:flex-1 min-w-0"
        />

        {/* Sits at the right on desktop, stacks on mobile */}
        <a
          href={entry.audio}
          download
          className="sm:ml-auto shrink-0 rounded-md px-2 py-1 text-[10px] sm:text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:ring-indigo-300 bg-white"
          title="Download audio"
        >
          Download
        </a>
      </div>
    </div>
  </div>
)}


        </div>
      )}
    </div>
  ))}



</div>


</>
  );
};

export default JournalList;
