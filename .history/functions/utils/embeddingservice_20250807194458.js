// embeddingService.js
// import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";


const ai = new GoogleGenerativeAI({
  apiKey: 'AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU', // Use env var locally or Firebase config for cloud
});

export async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [text],
    });
    // returns an array of embeddings; we take first element
    console.log("embedding response*********",response)
    console.log('embeddings first',response.embeddings[0])
    return response.embeddings[0];
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

