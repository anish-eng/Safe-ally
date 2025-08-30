// 📁 File: src/utils/langchainGemini.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { findRelevantMessages, saveUserMessage } from "./firestorememory";
import { generateEmbedding } from "./embeddingservice";

export async function createGeminiChat(userId) {
  const systemPrompt = `
You are an empathetic, trauma-informed mental health assistant supporting individuals experiencing domestic abuse.
Respond gently and briefly (2-4 sentences), remembering relevant past conversations.
Do not provide legal advice. End replies with kind, supportive sentences.
`;

  const llm = new ChatGroq({
    model: "llama3-70b-8192", // You can switch to Gemini here
    apiKey: "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",
    system: systemPrompt,
    temperature: 0.7,
  });

  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
    inputKey: "input",
    outputKey: "response",
  });

  const chain = new ConversationChain({
    llm,
    memory,
    inputKey: "input",
    outputKey: "response",
  });

  return {
    async sendMessage(userInput) {
      const inputEmbedding = await generateEmbedding(userInput);
      const relevantMessages = await findRelevantMessages(userId, inputEmbedding, 5);

      const retrievedContext = relevantMessages
        .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");

      const prompt = `
${systemPrompt}

Relevant past messages:
${retrievedContext}

User: ${userInput}
Assistant:
      `;

      const response = await chain.call({ input: prompt });

      const aiEmbedding = await generateEmbedding(response.response);

      await saveUserMessage(userId, {
        role: "user",
        content: userInput,
        embedding: inputEmbedding,
      });

      await saveUserMessage(userId, {
        role: "ai",
        content: response.response,
        embedding: aiEmbedding,
      });

      return response.response;
    },
  };
}
