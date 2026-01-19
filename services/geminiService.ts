
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const initialBotMessage = "Hello! I'm a chatbot. Please tell me your name to get started.";

let chat: Chat;

const initializeChat = () => {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a friendly and empathetic chatbot. Keep your responses concise and conversational.',
      },
      history: [
        {
            role: "model",
            parts: [{ text: initialBotMessage }]
        }
      ]
    });
};

initializeChat(); // Set up the initial chat

export const getGeminiResponse = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        return "Gemini API key is not configured. Please check the environment variables.";
    }
  try {
    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return "Sorry, I encountered an error while trying to respond.";
  }
};

export const resetGeminiChat = () => {
    initializeChat();
};
