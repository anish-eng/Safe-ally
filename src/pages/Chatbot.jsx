import { useEffect, useState, useRef } from "react";
import {  httpsCallable , getFunctions} from "firebase/functions";
import { auth,functions } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getIdToken } from "firebase/auth";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const bottomRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    const unsubscribe = onAuthStateChanged (auth, async(user) => {
      if (user) {
        const token = await getIdToken(user);
        setIsReady(true);
      } else {
        console.warn("User not signed in");
        setIsReady(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendMessageToBot = async (input) => {
    const chatFn = httpsCallable(getFunctions(), "chatWithGemini");
    const result = await chatFn({ 
      input,
    });
    return result.data.reply;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!isReady) {
      alert("Please sign in first.");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const replyText = await sendMessageToBot(input);
      const botMsg = { role: "ai", content: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error getting reply:", err);
    }
  };

  return (

    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">

  {/* Header */}
  <div className="px-4 py-3 border-b bg-[#1e3a8a]">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-semibold">Talk with Safe Ally Chat</h3>
        <p className="text-xs text-white">Our conversation is secure and private.</p>
      </div>
      <div className="flex items-center gap-2">
        {/* expand */}
        <button
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white"
          title="Open in full view"
        >
          ⤢
        </button>
       
      </div>
    </div>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
{messages.map((msg, i) => {
  const mine = msg.role === "user";
  return (
    <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
    
      {!mine && (
        <div
          className="mr-2 mt-1 h-8 w-8 rounded-xl
                     bg-gradient-to-r from-blue-500 to-pink-500
                     ring-1 ring-indigo-200/60 shadow-sm
                     flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <img
            src="/translogo.png"         
            alt="SafeHaven logo"
            className="w-5 h-5 object-contain select-none pointer-events-none"
            draggable="false"
          />
        </div>
      )}
      <div
        className={[
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
          mine ? "bg-[#8789C0] text-white rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-tl-sm"
        ].join(" ")}
      >
        {msg.content}
      </div>
    </div>
  );
})}
<div className="flex items-center gap-2 text-slate-400">
  <div
    className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500
               ring-1 ring-indigo-200/60 shadow-sm flex items-center justify-center
               shrink-0 animate-pulse"
    aria-hidden="true"
  >
    <img
      src="/translogo.png"
      alt="Safe Ally"
      className="w-5 h-5 object-contain select-none pointer-events-none"
      draggable="false"
    />
  </div>
  {/* typing bubble */}
  <div
    className="px-3 py-2 bg-slate-100 rounded-2xl rounded-tl-sm shadow-sm"
    role="status"
    aria-live="polite"
    aria-label="SafeHaven is typing"
  >
    <span className="inline-flex gap-1 align-middle">
      <span className="animate-bounce [animation-delay:-0.2s]">•</span>
      <span className="animate-bounce">•</span>
      <span className="animate-bounce [animation-delay:0.2s]">•</span>
    </span>
  </div>
</div>
    <div ref={bottomRef} />
  </div>
  <div className="p-3 border-t bg-white">
    <div className="flex items-center gap-2">
     
      <div className="flex-1">
        <input
          className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && input.trim() && handleSend()}
        />
      </div>
      
        
      
      <button
        className="h-10 px-4 rounded-xl bg-[#8789C0] text-white text-sm font-semibold hover:bg-[#1e3a8a]"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  </div>
</div>

  );
};

export default Chatbot;

