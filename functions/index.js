
const functions = require("firebase-functions");
const { FieldValue: GFieldValue } = require("@google-cloud/firestore");
const {ChatGroq}=require("@langchain/groq")
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore(); 
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory, ChatMessageHistory } = require("langchain/memory");
const { generateEmbedding } = require("./utils/embeddingservice");
 const { onCall } = require("firebase-functions/v2/https");    
 const { defineSecret } = require("firebase-functions/params");
 const GROQ_API_KEY  = defineSecret("GROQ_API_KEY");
 const GENAI_API_KEY = defineSecret("GENAI_API_KEY");
 const SMTP_HOST = defineSecret("SMTP_HOST");   
const SMTP_PORT = defineSecret("SMTP_PORT");   
const SMTP_USER = defineSecret("SMTP_USER");  
const SMTP_PASS = defineSecret("SMTP_PASS");   
const SMTP_FROM = defineSecret("SMTP_FROM");
async function saveMessage(userId, message) {
  const data = {
    userId,
    role: message.role,        
    content: message.content,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (Array.isArray(message.embedding)) {
    data.embedding = GFieldValue.vector(message.embedding); 
  }

  const ref = await db.collection("userChats").add(data);
  
}
async function findRelevantMessages(userId, queryEmbedding, topK = 5) {
  const userMessagesRef = db.collection("userChats");
  const q = userMessagesRef
    .where("userId", "==", userId)
    .findNearest({
      vectorField: "embedding",      
      queryVector: queryEmbedding,   
      limit: topK,
      distanceMeasure: "COSINE",    
    });
  const snapshot = await q.get();
  return snapshot.docs.map((doc) => doc.data());
}
  exports.chatWithGemini = onCall(   {
         region: "us-central1",
         timeoutSeconds: 60,
        memory: "512MiB",
        secrets: [GROQ_API_KEY, GENAI_API_KEY], 
       },async (request) => 
 {
  if (!request.auth) { 
   console.log("context.auth is null")
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }
  

  const userId = request.auth.uid;
  const userInput = request.data.input;
  if (!userInput) {
    throw new functions.https.HttpsError("invalid-argument", "No input provided");
  }
  try {
    const inputEmbedding = await generateEmbedding(userInput);
    const relevantMessages = await findRelevantMessages(userId, inputEmbedding, 5);
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
    const fullPrompt = `
${systemPrompt}
Previous relevant messages:
${contextMessages}
User: ${userInput}
Assistant:
`;
    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile", 
      apiKey: GROQ_API_KEY.value(),
      system: systemPrompt,
      temperature: 0.2,
    });
    const chain = new ConversationChain({
      llm,
      memory: new BufferMemory({ returnMessages: false }), 
      inputKey: "input",
      outputKey: "response",
      verbose: false,
    });
    const response = await chain.call({ input: fullPrompt });
    // 5. Save user message and AI response + embeddings
    await saveMessage(userId, { role: "user", content: userInput, embedding: inputEmbedding });
    const aiEmbedding = await generateEmbedding(response.response);
    await saveMessage(userId, { role: "ai", content: response.response, embedding: aiEmbedding });
    return { reply: response.response };
  } catch (error) {
    console.error("Cloud Function error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
const LOG_EVENTS = true;                       // Set false to stop writing any event records
async function readContact(uid) {                                 
  const ref = admin.firestore().doc(`users/${uid}/profile/emergencyContact`); 
  const snap = await ref.get();                                    
  if (!snap.exists) return null;                                   
  const d = snap.data() || {};                                      
  return {
    method: String(d.contactmethod || "").toLowerCase(),            
    name: d.fullName || d.relationship || "Contact",                
    email: (d.email || "").trim(),                                  
    phone: (d.phone || "").trim(),                                 
    message: (d.messageTemplate || "I need help. I am in a dangerous situation, please contact me immediately.").toString(), 
  };
}
async function logEvent({ uid, channel, to, status, error }) {     
  if (!LOG_EVENTS) return;                                          
  await admin.firestore().collection("emergencyEvents").add({       
    uid,                                                          
    channel,                                                       
    to,                                                          
    status,                                                         
    error: error || null,                                           
    createdAt: admin.firestore.FieldValue.serverTimestamp(),        
  });
}
exports.sendEmergencyAlert = onCall(                                
  {
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB",                                               
    secrets: [
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,        
    ],
  },
  async (req) => {
    const uid = req?.auth?.uid;                           
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "Sign in first."); 
    const d = await readContact(uid);                               
    if (!d) throw new functions.https.HttpsError("failed-precondition", "No emergency contact set."); 
    let replyToEmail = null;                                       
    let userName = d.name || "SafeHaven user";                      
    try {
      const u = await admin.auth().getUser(uid);                    
      if (u.email) replyToEmail = u.email;                  
      if (u.displayName) userName = u.displayName;                
    } catch (_) {}                                                  
    if (d.method === "email") {                                   
      if (!d.email) throw new functions.https.HttpsError("failed-precondition", "Missing email for Email."); 
      const nodemailer = require("nodemailer");                    
      const transporter = nodemailer.createTransport({             
        host: SMTP_HOST.value(),
        port: Number(SMTP_PORT.value() || 465),
        secure: true,
        auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
      });
      try {
        await transporter.sendMail({                               
          from: SMTP_FROM.value(),                                  
          to: d.email,                                             
          subject: `Emergency alert from ${userName}`,            
          text: d.message,                                       
          replyTo: replyToEmail || undefined,                      
        });
        await logEvent({ uid, channel: "email", to: d.email, status: "sent" }); 
        return { ok: true, channel: "email", to: d.email };   
      } catch (err) {
        await logEvent({ uid, channel: "email", to: d.email, status: "failed", error: err?.message });
        throw new functions.https.HttpsError("internal", `Email send failed: ${err?.message || "Unknown error"}`); 
      }
    }
    if (d.method === "sms") {                                     
      throw new functions.https.HttpsError(
        "failed-precondition",
        "SMS sending is currently disabled. Enable Twilio in the Cloud Function when ready."
      );
    }
    throw new functions.https.HttpsError("invalid-argument", "Unsupported contact method. Use 'email' (SMS disabled)."); // Fallback
  }
);


