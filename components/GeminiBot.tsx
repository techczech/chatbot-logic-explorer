
import React, { useState, useEffect } from 'react';
import type { Message, ChatBotProps } from '../types';
import ChatWindow from './ChatWindow';
import { getGeminiResponse, resetGeminiChat } from '../services/geminiService';

const initialMessageText = "Hello! I'm a chatbot. Please tell me your name to get started.";
const initialMessage: Message = { id: 'gm-initial', text: initialMessageText, sender: 'bot' };


const GeminiBot: React.FC<ChatBotProps> = ({ lastUserMessage, onBotReplied, resetCounter }) => {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to handle the "Start Over" action
    useEffect(() => {
        if (resetCounter > 0) {
            setMessages([initialMessage]);
            setIsLoading(false);
            resetGeminiChat();
        }
    }, [resetCounter]);

    // Effect to process a new user message
    useEffect(() => {
        if (!lastUserMessage) return;

        // Add user message to state immediately
        const historyBeforeThisTurn = messages;
        setMessages(prev => [...prev, lastUserMessage]);

        const fetchResponse = async () => {
            setIsLoading(true);

            // Generate the explanation using the history *before* the user's latest message
            const chatHistoryForExplanation = historyBeforeThisTurn
                .map(msg => `${msg.sender === 'bot' ? 'BOT' : 'USER'}: ${msg.text}`)
                .join('\n');

            try {
                const geminiText = await getGeminiResponse(lastUserMessage.text);
                const botMessage: Message = {
                    id: Date.now().toString() + '-gm-bot',
                    text: geminiText,
                    sender: 'bot',
                    explanationTitle: "Context Sent to Gemini",
                    explanation: `SYSTEM INSTRUCTION:\nYou are a friendly and empathetic chatbot. Keep your responses concise and conversational.\n\nPREVIOUS CHAT HISTORY:\n${chatHistoryForExplanation || '(No previous history)'}\n\nCURRENT USER MESSAGE:\n"${lastUserMessage.text}"`
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error("Gemini API Error:", error);
                const errorBotMessage: Message = {
                    id: Date.now().toString() + '-gm-bot-error',
                    text: "Sorry, I ran into an issue connecting to the Gemini API.",
                    sender: 'bot',
                    explanationTitle: "API Error",
                    explanation: "There was an error fetching the response from the Gemini API. Please check the console for details and ensure the API key is configured correctly."
                };
                setMessages(prev => [...prev, errorBotMessage]);
            } finally {
                setIsLoading(false);
                onBotReplied(); // Notify parent component that the response is complete
            }
        };

        fetchResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastUserMessage]);

    return (
        <ChatWindow
            title="I Get It Bot"
            description="Powered by a Large Language Model (Gemini 2.5 Flash)"
            messages={messages}
            isLoading={isLoading}
        />
    );
};

export default GeminiBot;
