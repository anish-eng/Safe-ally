// functions/index.js
const { initializeApp } = require("firebase-admin/app");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true }); 
const { db } = require("../src/firebase/firebaseConfig");



const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory, ChatMessageHistory } = require("langchain/memory");
const { generateEmbedding } = require("./utils/embeddingservice");
 // local service or direct in function



async function saveMessage(userId, message) {
  const userMessagesRef = db.collection("userChats");
  await userMessagesRef.add({
    userId,
    role: message.role,
    content: message.content,
    embedding: message.embedding || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function findRelevantMessages(userId, queryEmbedding, topK = 5) {
  const userMessagesRef = db.collection("userChats");
  const q = userMessagesRef
    .where("userId", "==", userId)
    .orderBy("embedding", "vector_similarity", queryEmbedding)
    .limit(topK);

  const snapshot = await q.get();
  return snapshot.docs.map((doc) => doc.data());
}

exports.chatWithGemini = functions.https.onCall(async (data, context) => 
   
 {
  // console.log('this is a test atleast come here ')
  console.log('data',data)
  console.log('context',context)
  if (!context.auth) {
    
   console.log("context.auth is null *************")
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }
console.log("atleast its coming till here")

// if (!context.auth) {
//     throw new functions.https.HttpsError(
//       "unauthenticated", 
//       "User must be authenticated",
//       { authRequired: false }
//     );
//   }


  const userId = context.auth.uid;
  console.log("userId from context********",userId)
  const userInput = data.input;
  if (!userInput) {
    throw new functions.https.HttpsError("invalid-argument", "No input provided");
  }

  try {
    // 1. Generate embedding for user input
    const inputEmbedding = await generateEmbedding(userInput);

    // 2. Find relevant messages by similarity
    const relevantMessages = await findRelevantMessages(userId, inputEmbedding, 5);

    // 3. Build prompt context (system + relevant conversation + current user input)
    const systemPrompt = `
You are an empathetic, trauma-informed mental health assistant supporting individuals experiencing domestic abuse.
Respond gently and briefly (2-4 sentences), remembering previous relevant conversations below.
Do NOT provide legal advice. Break replies into small digestible parts.
End replies with kind, supportive sentences.
`;

    let contextMessages = "";
    relevantMessages.forEach((msg) => {
      const speaker = msg.role === "user" ? "User" : "Assistant";
      contextMessages += `${speaker}: ${msg.content}\n`;
    });

    const fullPrompt = `
${systemPrompt}

Previous relevant messages:
${contextMessages}

User: ${userInput}
Assistant:
`;

    // 4. Call Gemini LLM using LangChain
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: "AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU",
      temperature: 0.5,
      topP: 0.8,
      systemInstruction: systemPrompt,
    });

    const chain = new ConversationChain({
      llm,
      memory: new BufferMemory({ returnMessages: false }), // no buffer memory, since we control context
      inputKey: "input",
      outputKey: "response",
      verbose: false,
    });

    const response = await chain.call({ input: fullPrompt });

    // 5. Save user message and AI response + embeddings
    await saveMessage(userId, { role: "user", content: userInput, embedding: inputEmbedding });

    const aiEmbedding = await generateEmbedding(response.response);
    await saveMessage(userId, { role: "ai", content: response.response, embedding: aiEmbedding });

    // 6. Return AI response
    return { reply: response.response };
  } catch (error) {
    console.error("Cloud Function error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

