// embeddingService.js
// import { GoogleGenAI } from "@google/genai";
// import { GoogleGenerativeAI } from "@google/generative-ai";


// const ai = new GoogleGenerativeAI({
//   apiKey: 'AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU', // Use env var locally or Firebase config for cloud
// });

// export async function generateEmbedding(text) {
//   console.log("text***********",text)
//   console.log("ai model",ai,ai.models)
//   try {
//     const response = await ai.models.embedContent({
//       model: "gemini-embedding-001",
//       contents: [text],
//     });
//     // returns an array of embeddings; we take first element
//     console.log("embedding response*********",response)
//     console.log('embeddings first',response.embeddings[0])
//     return response.embeddings[0];
//   } catch (error) {
//     console.error("Error generating embeddings:", error);
//     throw error;
//   }
// }

// new trial code



import { GoogleGenerativeAI } from "@google/generative-ai";

// --- IMPORTANT: API Key Security ---
// Directly hardcoding your API key like 'AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU'
// is NOT recommended, especially for production environments.
// For Cloud Functions, you should use environment variables or Firebase Config.
// Example for Firebase Functions: functions.config().gemini.api_key
const API_KEY = 'AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU'; // For local testing, but secure this!

// 1. Initialize the GoogleGenerativeAI instance once.
// This `genAI` object is your gateway to various Gemini models.
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Get the *specific embedding model instance* once.
// This is crucial for efficiency and correctness. You only need to do this once
// when your Cloud Function is initialized, not on every call to generateEmbedding.
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

export async function generateEmbedding(text) {
  console.log("text to embed:", text);

  // You correctly identified that your `console.log("ai model",ai,ai.models)`
  // showed `ai.models` as undefined. This is because `ai` (or `genAI` as I've renamed it)
  // doesn't have a direct `models` property like that for calling `embedContent`.

  try {
    // 3. Call `embedContent` on the `embeddingModel` instance.
    // The `embedContent` method expects an object with a `content` property,
    // which in turn should contain `parts` (an array of `Part` objects).
    const result = await embeddingModel.embedContent({
      content: {
        parts: [{ text: text }],
        outputDimensionality: 768 // Wrap your text in a 'text' part within a 'parts' array
      },
    });

    // The response structure for embedContent is typically:
    // { embedding: { values: [float, float, ...] } }
    console.log("Raw embedding result from API:", result);
    console.log('Generated embedding values (first):', result.embedding.values);

    // Return the array of floating-point numbers that represents the embedding.
    return result.embedding.values;

  } catch (error) {
    console.error("Error generating embeddings:", error);
    // Re-throw the error so the caller knows something went wrong.
    // In a Cloud Function, you might want to wrap this in an HttpsError
    // if it's going back to a client.
    throw error;
  }
}


