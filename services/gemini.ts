import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function getGeminiResponse(prompt: string): Promise<string> {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to get response from Gemini: ${error.message}`);
  }
}

export async function getGeminiResponseWithHistory(messages: Array<{ role: string, content: string }>): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Convert the messages format to Gemini chat format
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });
    
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API with history:", error);
    throw new Error(`Failed to get response from Gemini: ${error.message}`);
  }
}

export async function breakdownTask(taskContent: string, additionalDetails?: string): Promise<string[]> {
  let prompt = `Break down the following task into smaller, actionable subtasks. Each subtask should be a short, clear instruction. Provide only the list of subtasks, one per line, with no numbering or bullet points. Task: "${taskContent}"`;
  
  if (additionalDetails && additionalDetails.trim()) {
    prompt += `\n\nAdditional context and requirements: ${additionalDetails}`;
  }
  
  try {
    const response = await getGeminiResponse(prompt);
    
    // Split the response into individual subtasks and filter out empty lines
    const subtasks = response.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.replace(/^[-*\d\.\s]+/, '').trim())
      .filter(Boolean);
    
    return subtasks;
  } catch (error) {
    console.error("Error breaking down task with Gemini:", error);
    throw new Error(`Failed to break down task: ${error.message}`);
  }
}
