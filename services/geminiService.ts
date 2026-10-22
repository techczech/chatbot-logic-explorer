
import { Chat } from "@google/genai";

import { providerSession, invalidateRequests, safeProviderError } from './visitorKey.ts';

const initialBotMessage = "Hello! I'm a chatbot. Please tell me your name to get started.";

let chat: Chat | undefined;

const initializeChat = (session: ReturnType<typeof providerSession>) => {
    chat = session.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        abortSignal: session.signal,
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

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  const session = providerSession();
  try {
    if (!chat) initializeChat(session);
    session.assertCurrent();
    const response = await chat!.sendMessage({ message: prompt });
    session.assertCurrent();
    if (!response.text) throw new Error('Empty response');
    return session.cleanText(response.text);
  } catch (error) {
    throw safeProviderError(error);
  }
};

export const resetGeminiChat = () => {
  invalidateRequests();
  chat = undefined;
};
