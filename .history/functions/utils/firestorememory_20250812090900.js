// // firestoreMemory.js
// import { db } from "../firebase/firebaseConfig";
// import {
//   collection,
//   addDoc,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   serverTimestamp,
//   limit,
//   // Vector search imports below — available in newer Firebase SDK versions
//   // If vector search is not available, fallback to manual similarity compute (not efficient)
// } from "firebase/firestore";
// import { generateEmbedding } from "./embeddingservice";

// // Save a chat message with embedding
// export async function saveUserMessage(userId, message) {
//   if (!userId || !message?.content) return;

//   const userMessagesRef = collection(db, "userChats");
//   console.log("userid, message",userId,message)
//   console.log('message.embedding',message.embedding, message)
 
//   await addDoc(userMessagesRef, {
//     userId,
//     role: message.role,
//     content: message.content,
//     embedding: message.embedding, // embedding vector
//     createdAt: serverTimestamp(),
//   });
// }

// // Load recent messages (fallback if vector search unavailable)
// export async function loadRecentUserMessages(userId, limitNum = 20) {
//   const userMessagesRef = collection(db, "userChats");
//   const q = query(
//     userMessagesRef,
//     where("userId", "==", userId),
//     orderBy("createdAt", "desc"),
//     limit(limitNum)
//   );
//   const snapshot = await getDocs(q);
//   console.log("snapshot**********",snapshot)
//   return snapshot.docs.map(doc => doc.data()).reverse();
// }

// // Vector similarity search: returns top-k messages most similar to queryEmbedding
// // Uses Firestore native vector search syntax (if available)
// // export async function findRelevantMessages(userId, queryEmbedding, topK = 5) {
// //   // Firestore vector search example syntax:
// //   // https://firebase.google.com/docs/firestore/vector-search
// //   const userMessagesRef = collection(db, "userChats");

// //   // Firestore vector search query
// //   const q = query(
// //     userMessagesRef,
// //     where("userId", "==", userId),
// //     orderBy("embedding", "vector_similarity", queryEmbedding),
// //     limit(topK)
// //   );

// //   const snapshot = await getDocs(q);

// //   // Return data sorted by similarity
// //   return snapshot.docs.map(doc => doc.data());
// // }
