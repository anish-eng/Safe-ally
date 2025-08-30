



// new disguised quotes with lock/unlock issues



import React, { useState, useRef, useEffect } from "react";

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", image: "/stevecolor.png" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", image: "/theocolor.jpeg" },
  { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", author: "Albert Einstein", image: "/einstein.jpg" },
  { text: "If you can change your mind, you can change your life!", author: "William James", image: "/william.jpeg" },
];

export default function DisguisedQuotes({ onUnlock }) {
  const [index, setIndex] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);

  // cleanup any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  const handleSecretTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;

      // start/reset a 3s window for the triple tap
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => setTapCount(0), 3000);

      if (next >= 3) {
        // success: clear + unlock (router will redirect in onUnlock)
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
        setTapCount(0);
        if (typeof onUnlock === "function") onUnlock();
      }
      return next;
    });
  };

  const prev = () => setIndex((i) => (i - 1 + quotes.length) % quotes.length);
  const next = () => setIndex((i) => (i + 1) % quotes.length);

  const current = [
    quotes[index % quotes.length],
    quotes[(index + 1) % quotes.length],
    quotes[(index + 2) % quotes.length],
  ];
  const quoteOfTheDay = quotes[0];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-pink-50" aria-hidden="true" />
      <div className="absolute inset-0 bg-gray-200 backdrop-blur-[2px]" aria-hidden="true" />

      <div className="relative  px-4 sm:px-6 lg:px-8 py-8">
        {/* Quote of the Day */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl   border-[3px] border-[#1e3a8a] w-full max-w-4xl mx-auto text-center py-8 px-6 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quote of the Day</h2>
          <p className="text-xl italic text-slate-700 mb-2">“{quoteOfTheDay.text}”</p>
          <p className="text-sm font-medium text-slate-500">— {quoteOfTheDay.author}</p>
          <p className="mt-4 text-sm text-slate-500">
            Tip: tap on <span className="font-semibold">Steve Jobs</span> three times to explore more quotes.
          </p>
        </div>

        {/* Carousel row */}
        <div className="w-full max-w-7xl mx-auto grid   grid-cols-1 md:grid-cols-3 gap-6 px-1">
          {current.map((quote, idx) => (
            <div
              key={idx}
              className="group border-[3px] border-[#1e3a8a] flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              {/* Media */}
              <div className="relative w-full aspect-[4/3]   bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
              {/* bg-gradient-to-b from-slate-50 to-slate-100 */}
                <img
                  src={quote.image}
                  alt={quote.author}
                  className="max-w-full max-h-full object-contain"
                  draggable="false"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 px-5 py-4 text-center">
                <div className="min-h-[84px] flex items-center justify-center">
                  <p className="text-[15px] sm:text-base italic text-slate-700 leading-relaxed">
                    “{quote.text}”
                  </p>
                </div>

                {quote.author === "Steve Jobs" ? (
                  <button
                    type="button"
                    onClick={handleSecretTap}
                    className="mt-3 text-sm text-slate-500 underline decoration-dotted underline-offset-4 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded"
                    title="Tap 3 times"
                  >
                    — {quote.author}
                  </button>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">— {quote.author}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={prev}
            className="px-4 py-2 text-white rounded-lg bg-[#8789C0] shadow ring-1 ring-slate-200 hover:shadow-md hover:bg-[#8789C0] transition focus:outline-none focus:ring-2 focus:ring-bg-[#8789C0]"
            aria-label="Previous"
          >
            ⬅ Prev
          </button>
          <button
            onClick={next}
            className="px-4 py-2 text-white rounded-lg bg-[#8789C0] shadow ring-1 ring-slate-200 hover:shadow-md hover:bg-[#8789C0] transition focus:outline-none focus:ring-2 focus:ring-bg-[#8789C0]"
            aria-label="Next"
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
}



