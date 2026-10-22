
import React, { useState, useEffect } from 'react';
import type { Message, ChatBotProps } from '../types';
import ChatWindow from './ChatWindow';
import { safeProviderError } from '../services/visitorKey';
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
        let active = true;

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
                if (!active) return;
                const botMessage: Message = {
                    id: Date.now().toString() + '-gm-bot',
                    text: geminiText,
                    sender: 'bot',
                    explanationTitle: "Context Sent to Gemini",
                    explanation: `SYSTEM INSTRUCTION:\nYou are a friendly and empathetic chatbot. Keep your responses concise and conversational.\n\nPREVIOUS CHAT HISTORY:\n${chatHistoryForExplanation || '(No previous history)'}\n\nCURRENT USER MESSAGE:\n"${lastUserMessage.text}"`
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                if (!active) return;
                const errorBotMessage: Message = {
                    id: Date.now().toString() + '-gm-bot-error',
                    text: safeProviderError(error).message,
                    sender: 'bot',
                    explanationTitle: "API Error",
                    explanation: "Use the key settings above to enter or change your Gemini API key. The rules-based bot remains available without a key."
                };
                setMessages(prev => [...prev, errorBotMessage]);
            } finally {
                if (active) { setIsLoading(false);
                onBotReplied(); } // Notify parent component that the response is complete
            }
        };

        fetchResponse();
        return () => { active = false; };
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
