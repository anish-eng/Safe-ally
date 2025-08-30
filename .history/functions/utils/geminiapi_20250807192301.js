// // ✅ Replace this with your actual API key from https://aistudio.google.com/app/apikey
// // const GEMINI_API_KEY = "AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU"

// // 🧠 Main function to send messages to Gemini and get a response
// export const fetchGeminiResponse = async (messages) => {
//   const endpoint =
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

//   // Format message history (last 10 messages recommended)
//   const contents = messages.slice(-10).map((msg) => ({
//     role: msg.sender === "user" ? "user" : "model",
//     parts: [{ text: msg.text }],
//   }));

//   const body = { contents };

//   try {
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const json = await res.json();

//     // Return Gemini's first reply, or fallback
//     return json?.candidates?.[0]?.content?.parts?.[0]?.text
//       || "I'm here to support you, but I couldn't generate a reply.";
//   } catch (error) {
//     console.error("Gemini API error:", error);
//     return "I'm having trouble connecting right now. Please try again later.";
//   }
// };
// import { createGeminiChat } from "./langchainGemini";
// import { getAuth ,onAuthStateChanged} from "firebase/auth";
// import { useEffect,useState } from "react";
// // const auth = getAuth();
// // const user = auth.currentUser;

// export const FetchGeminiResponse = async (messages,userId) => {
    
//     const chat = await createGeminiChat(userId);
//     console.log("the chat is after creating",chat)
//     const lastUserMessage = messages.at(-1);
//     console.log('messages from where we are printing',messages)
//     console.log('last user message *****',lastUserMessage.text)
//     // const reply = await chat.sendMessage(lastUserMessage.text);
//     const reply = await chat.sendMessage(messages);
//     console.log("the reply is after replyimng",reply)
//     return reply;
//   };

