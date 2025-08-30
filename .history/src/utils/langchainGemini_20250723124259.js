import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory,ChatMessageHistory } from "langchain/memory";
import { loadUserMemory, saveUserMemory } from "./firestorememory";
import { ConversationSummaryMemory } from "langchain/memory";

export async function createGeminiChat(userId) {
//   const memory = new BufferMemory({ returnMessages: true });
//   await memory.loadMemoryVariables({});
//   const previousMessages = await loadUserMemory(userId);
//   console.log('previous messages',previousMessages)
//   console.log('memory',memory)
//   console.log('memory.chatMemory.messages',memory.chatMemory)
//   memory.chatMemory.messages = previousMessages || [];
const previousMessages = await loadUserMemory(userId);
const chatHistory = new ChatMessageHistory();

  // Check if there are any saved messages

 console.log("previous messages from chat history ********",previousMessages)
  if (Array.isArray(previousMessages)) {
    for (const msg of previousMessages) {
      if (msg.role === "user") await chatHistory.addUserMessage(msg.content);
      else if (msg.role === "ai") await chatHistory.addAIMessage(msg.content);
    }
  }
  console.log("chatHistory *****",chatHistory)





  // const memory = new BufferMemory({
  //   chatHistory,
  //   returnMessages: true,
  //   inputKey: "input",     // 👈 this matches your call: chain.call({ input: ... })
  // outputKey: "response",
  // });
  // just experiental remove consersationsummarymemory if it doesnt work
console.log("memory after intialising langchain return messages",memory)

  const systemPrompt = `
You are an empathetic, trauma-informed mental health assistant supporting individuals experiencing domestic abuse.

Respond in a gentle, conversational tone using **brief, helpful answers (2–4 sentences max)**.

Do NOT use placeholders like [insert location here]. Do NOT provide legal advice. Do NOT give more than 2 actionable suggestions at a time.

Speak clearly, offer emotional support, and break responses into small, digestible parts. End your replies with a soft, kind sentence when possible.

Avoid repeating the same disclaimers or lists in every message. Do not be abstract and talk about what you can and cannot do! Be specific and action-oriented.  Do not give details of your internal tooling. Ask clarifying question
if unsure- Do not give very verbose and long answers.`

  const llm = new ChatGoogleGenerativeAI({
    model:"gemini-1.5-flash",
    apiKey:"AIzaSyDUqa3N8dBTtZqaBl0wue--h8iH5f_8aMU",
    temperature: 0.5,     // Lower = more focused and concise
  topP: 0.8 ,  
    systemInstruction: systemPrompt,
  });
  const memory = new ConversationSummaryMemory({
    llm, // your Gemini model
    chatHistory: chatHistory,
    returnMessages: true,
    inputKey: "input",
    outputKey: "response",
  });
  
console.log("llm init",llm)
  const chain = new ConversationChain({ llm, memory,inputKey: "input",outputKey: "response", verbose: false });
  console.log("convo chain by langchain",chain)
  return {
    
    async sendMessage(userInput) {

        console.log('entered send messagethis is called later')
        console.log("Calling chain with:", { input: userInput });
      const response = await chain.call({ input: userInput });
      console.log('response',response)
      console.log('memory.chatMemory whatever was given to create chagbot memory',memory,memory.chatMemory)
   
    //   to be checked comment worthy code
      
    await saveUserMemory(userId, { role: "user", content: userInput });
    await saveUserMemory(userId, { role: "ai", content: response.response });
    
      console.log('memory.chatMemory.Messages',memory.chatMemory)
      console.log("response",response)
      return response.response;
    }
  };
}









// new testing code




