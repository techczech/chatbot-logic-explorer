import React, { useState, useEffect } from 'react';
import type { Message, ChatBotProps } from '../types';
import ChatWindow from './ChatWindow';

const initialMessageText = "Hello! I'm a chatbot. Please tell me your name to get started.";
const initialMessage: Message = { id: 'rb-initial', text: initialMessageText, sender: 'bot' };

const RuleBasedBot: React.FC<ChatBotProps> = ({ lastUserMessage, onBotReplied, resetCounter }) => {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [userName, setUserName] = useState<string | null>(null);

    // Effect to handle the "Start Over" action
    useEffect(() => {
        if (resetCounter > 0) {
            setMessages([initialMessage]);
            setUserName(null);
        }
    }, [resetCounter]);

    // Effect to process a new user message
    useEffect(() => {
        if (!lastUserMessage) return;

        setMessages(prev => [...prev, lastUserMessage]);

        // Use a timeout to simulate the bot "thinking"
        setTimeout(() => {
            let botResponse: Message;
            const text = lastUserMessage.text;
            const lowerCaseText = text.toLowerCase();
            const words = text.trim().split(/\s+/);

            const positiveWords = ['happy', 'good', 'great', 'fantastic', 'wonderful', 'excellent', 'amazing'];
            const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'not so good', 'not great'];

            const foundPositiveWord = positiveWords.find(word => lowerCaseText.includes(word));
            const foundNegativeWord = negativeWords.find(word => lowerCaseText.includes(word));

            const nameMatch = lowerCaseText.match(/my name is (.*)/i) ?? lowerCaseText.match(/i'm (.*)/i);
            let extractedName: string | null = null;
            
            if (nameMatch && nameMatch[1]) {
                extractedName = nameMatch[1].trim().split(" ")[0];
            } else if (words.length === 1 && !userName) {
                extractedName = words[0];
            }

            if (!userName && extractedName) {
                const capitalizedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
                setUserName(capitalizedName);
                botResponse = {
                    id: Date.now().toString() + '-rb-bot',
                    text: `Nice to meet you, ${capitalizedName}! How are you feeling today? For example, you can tell me if you're happy or sad.`,
                    sender: 'bot',
                    explanationTitle: "Rule: Name Recognition",
                    explanation: `IF input is a single word OR contains "my name is..."/"I'm..." AND no name is stored yet, THEN extract name ("${capitalizedName}") and respond.`,
                    codeSnippet: `// Rule: Check for name introduction
const namePattern = /my name is (\\w+)|i'm (\\w+)/i;
const nameMatch = lowerCaseText.match(namePattern);
const isSingleWord = words.length === 1;

if (!userName && (nameMatch || isSingleWord)) {
    let newName = nameMatch ? (nameMatch[1] || nameMatch[2]) : words[0];
    const capitalizedName = newName.charAt(0).toUpperCase() + newName.slice(1);
    setUserName(capitalizedName);
    
    // ... then generate the response.
}`
                };
            } else if (userName && foundPositiveWord) {
                 botResponse = {
                    id: Date.now().toString() + '-rb-bot',
                    text: `That's wonderful to hear, ${userName}! I'm glad you're feeling ${foundPositiveWord}. What's making you feel that way?`,
                    sender: 'bot',
                    explanationTitle: "Rule: Positive Keyword Match",
                    explanation: `IF a user name is stored AND input contains a positive keyword ("${foundPositiveWord}"), THEN provide a canned positive response.`,
                    codeSnippet: `// Rule: Check for positive keywords
const positiveWords = ['happy', 'good', 'great', ...];
const foundPositiveWord = positiveWords.find(word => 
    lowerCaseText.includes(word)
);

if (userName && foundPositiveWord) {
    // A canned response is generated using the user's name
    // and the specific keyword that was found.
    // text: \`That's wonderful to hear, \${userName}! I'm glad you're feeling \${foundPositiveWord}.\`
}`
                };
            } else if (userName && foundNegativeWord) {
                 botResponse = {
                    id: Date.now().toString() + '-rb-bot',
                    text: `I'm sorry to hear you're feeling ${foundNegativeWord}, ${userName}. It's okay to feel that way. Is there anything you'd like to talk about?`,
                    sender: 'bot',
                    explanationTitle: "Rule: Negative Keyword Match",
                    explanation: `IF a user name is stored AND input contains a negative keyword ("${foundNegativeWord}"), THEN provide a canned empathetic response.`,
                    codeSnippet: `// Rule: Check for negative keywords
const negativeWords = ['sad', 'bad', 'terrible', ...];
const foundNegativeWord = negativeWords.find(word => 
    lowerCaseText.includes(word)
);

if (userName && foundNegativeWord) {
    // A canned response is generated using the user's name
    // and the specific keyword that was found.
    // text: \`I'm sorry to hear you're feeling \${foundNegativeWord}, \${userName}.\`
}`
                };
            } else {
                botResponse = {
                    id: Date.now().toString() + '-rb-bot',
                    text: userName ? `I'm not sure how to respond to that, ${userName}. You can tell me if you are feeling happy or sad.` : `I'm a simple bot. Please tell me your name. For example, "My name is Hal".`,
                    sender: 'bot',
                    explanationTitle: "Rule: Default Fallback",
                    explanation: "IF no other rule matches, THEN provide a default response prompting for valid input.",
                    codeSnippet: `// Rule: Default fallback
} else {
    // If no other rules match, a default response is triggered.
    const responseText = userName 
        ? \`I'm not sure how to respond to that, \${userName}. You can tell me if you are feeling happy or sad.\`
        : "I'm a simple bot. Please tell me your name.";
    
    // ... then generate the response.
}`
                };
            }
            setMessages(prev => [...prev, botResponse]);
            onBotReplied(); // Notify parent component that the response is complete
        }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastUserMessage]);

    return (
        <ChatWindow
            title="If/Then Bot"
            description="Powered by Rules"
            messages={messages}
            isLoading={false} // This bot doesn't have a visible loading state
        />
    );
};

export default RuleBasedBot;
