// functions/index.js
// const { initializeApp } = require("firebase-admin/app");
const functions = require("firebase-functions");
const { FieldValue: GFieldValue } = require("@google-cloud/firestore");


// const admin = require("firebase-admin");
// const cors = require('cors')({ origin: true }); 



const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore(); 
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory, ChatMessageHistory } = require("langchain/memory");
const { generateEmbedding } = require("./utils/embeddingservice");
 // local service or direct in function



async function saveMessage(userId, message) {
  // const userMessagesRef = db.collection("userChats");
  // await userMessagesRef.add({
  //   userId,
  //   role: message.role,
  //   content: message.content,
  //   embedding: message.embedding || null,
  //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
  // });

// trial code starts
  const data = {
    userId,
    role: message.role,          // "user" | "assistant"
    content: message.content,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (Array.isArray(message.embedding)) {
    // ensure the length matches your index dimension (e.g., 768)
    data.embedding = GFieldValue.vector(message.embedding); // ✅ vector type
  }

  const ref = await db.collection("userChats").add(data);
  console.log("saved doc id:", ref.id);
  // trial code ends
}

async function findRelevantMessages(userId, queryEmbedding, topK = 5) {
  console.log("successfully entered find releveant messages")
  const userMessagesRef = db.collection("userChats");
  console.log('this is usermessagesref',userMessagesRef)
  const q = userMessagesRef
    .where("userId", "==", userId)
    // .orderBy("embedding", "vector_similarity", queryEmbedding)
    .findNearest({
      vectorField: "embedding",      // your vector field name
      queryVector: queryEmbedding,   // number[]
      limit: topK,
      distanceMeasure: "COSINE",     // or 'DOT_PRODUCT' if you unit-normalize
    });
    // .limit(topK);
  
    console.log("got the q",q)

  const snapshot = await q.get();
  return snapshot.docs.map((doc) => doc.data());
}

// exports.chatWithGemini = functions.https.onCall(async (data, context) => 
  exports.chatWithGemini = functions.https.onCall(async (request) => 
   
 {
  // // console.log('this is a test atleast come here ')
  // console.log('data',data)
  // console.log('context',context)
  if (!request.auth) {
    
   console.log("context.auth is null")
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


  const userId = request.auth.uid;
  console.log("userId from context********",userId)
  const userInput = request.data.input;
  if (!userInput) {
    throw new functions.https.HttpsError("invalid-argument", "No input provided");
  }

  try {
    // 1. Generate embedding for user input
    console.log("came above generate embedding atleast")
    const inputEmbedding = await generateEmbedding(userInput);

    // 2. Find relevant messages by similarity
    console.log("input embeddings",inputEmbedding)
    const relevantMessages = await findRelevantMessages(userId, inputEmbedding, 5);

    // 3. Build prompt context (system + relevant conversation + current user input)
    const systemPrompt = `
You are an empathetic, trauma-informed mental health assistant supporting individuals experiencing domestic abuse.
Respond gently and briefly (2-4 sentences), remembering previous relevant conversations below. Remember the contents of the chats for the specific user, don't say that you don't know or dont remember information. 
. Break replies into small digestible parts.
End replies with kind, supportive sentences.
`;

    let contextMessages = "";
    relevantMessages.forEach((msg) => {
      const speaker = msg.role === "user" ? "User" : "Assistant";
      contextMessages += `${speaker}: ${msg.content}\n`;
    });
   console.log("context messages *********",contextMessages)
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

