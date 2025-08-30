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
        console.log("User signed in:", user.uid);
        const token = await getIdToken(user);
         console.log("User token:********", token);
        setIsReady(true);
      } else {
        console.warn("User not signed in");
        setIsReady(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendMessageToBot = async (input) => {
    console.log("auth.currentuser",auth.currentUser)
    const chatFn = httpsCallable(getFunctions(), "chatWithGemini");
    console.log("chatfn",chatFn)
    // const result = await chatFn({ input });
     
    const result = await chatFn({ 
      input,
      // userId: auth.currentUser.uid // Optional: pass user ID explicitly
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border-b border-gray-200 p-3 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.role === "user"
                ? "text-right text-blue-600"
                : "text-left text-gray-700"
            }`}
          >
            <span className="inline-block bg-gray-100 px-3 py-1 rounded">
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-200 flex gap-2">
        <input
          className="flex-grow border border-gray-300 rounded px-3 py-2"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

