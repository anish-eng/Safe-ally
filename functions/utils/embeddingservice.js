
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const API_KEY=process.env.GENAI_API_KEY

// if (!API_KEY) throw new Error("Missing GENAI_API_KEY");
// const genAI = new GoogleGenerativeAI(API_KEY);
// const embeddingModel = genAI.getGenerativeModel({
//   model: "gemini-embedding-001",
// });
// export async function generateEmbedding(text) {
//   try {
//     const result = await embeddingModel.embedContent({
//       content: {
//         parts: [{ text: text }]},
//       outputDimensionality: 768
//     });
//     return result.embedding.values;
//   } catch (error) {
//     throw error;
//   }
// }


// functions/utils/embeddingservice.js (ESM)
import { GoogleGenerativeAI } from "@google/generative-ai";

let embeddingModel = null;
let cachedKey = null;

// Try to init at load if the env is already present (prod containers)
const KEY_AT_LOAD = process.env.GENAI_API_KEY;
if (KEY_AT_LOAD) {
  const genAI = new GoogleGenerativeAI(KEY_AT_LOAD);
  embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  cachedKey = KEY_AT_LOAD;
}

export async function generateEmbedding(text) {
  // If not initialized yet (e.g., emulator without env at load), init now
  if (!embeddingModel) {
    const key = process.env.GENAI_API_KEY; // MUST match your Firebase secret name
    if (!key) {
      throw new Error(
        "Missing GENAI_API_KEY (ensure this v2 function declares secrets:[GENAI_API_KEY], and export it when using the emulator)."
      );
    }
    const genAI = new GoogleGenerativeAI(key);
    embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    cachedKey = key;
  }

  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });

  return result?.embedding?.values ?? [];
}


