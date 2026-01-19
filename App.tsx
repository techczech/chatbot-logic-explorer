
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from './types';
import RuleBasedBot from './components/RuleBasedBot';
import GeminiBot from './components/GeminiBot';
import { SendIcon, SunIcon, MoonIcon } from './components/icons';

const App: React.FC = () => {
    const [lastUserMessage, setLastUserMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [resetCounter, setResetCounter] = useState(0);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') {
                return storedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            window.localStorage.setItem('theme', theme);
        } catch (e) {
            console.error('Failed to save theme to localStorage', e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const pendingResponses = useRef(0);

    // This callback is triggered by each bot when it finishes its response.
    // It allows us to manage a global loading state for the input form.
    const handleBotReplied = useCallback(() => {
        pendingResponses.current -= 1;
        if (pendingResponses.current <= 0) {
            setIsLoading(false);
        }
    }, []);
    
    // Resets the chat by incrementing a counter, which child components listen to.
    const handleClear = useCallback(() => {
        setLastUserMessage(null);
        setInputText('');
        setIsLoading(false);
        pendingResponses.current = 0;
        setResetCounter(c => c + 1);
    }, []);

    // Sends the user's message to both bots.
    const handleSendMessage = useCallback((text: string) => {
        if (!text.trim() || isLoading) return;

        pendingResponses.current = 2; // Expecting a response from both bots
        setIsLoading(true);
        setInputText('');

        const userMessage: Message = { id: Date.now().toString() + '-user', text, sender: 'user' };
        setLastUserMessage(userMessage); // This state change triggers the bots

    }, [isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputText);
    };

    return (
        <div className="font-sans antialiased text-gray-900 dark:text-gray-100 h-screen flex flex-col">
            <header className="text-center p-4 md:pt-8 md:pb-4 shrink-0 relative">
                 <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                    Chatbot Logic Explorer
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Compare a simple, rule-based chatbot with an advanced LLM. Use the same prompts and see the difference in their logic and responses.
                </p>
            </header>
            
            <main className="flex-1 container mx-auto px-4 md:px-8 pb-4 overflow-hidden">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    <RuleBasedBot
                        lastUserMessage={lastUserMessage}
                        onBotReplied={handleBotReplied}
                        resetCounter={resetCounter}
                    />
                    <GeminiBot
                        lastUserMessage={lastUserMessage}
                        onBotReplied={handleBotReplied}
                        resetCounter={resetCounter}
                    />
                </div>
            </main>

            <footer className="shrink-0 p-4 sticky bottom-0 bg-gray-100 dark:bg-gray-900">
                 <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Send a message to both bots..."
                        className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        aria-label="Chat input for both bots"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 rounded"
                        aria-label="Clear chat and start over"
                    >
                        Start over
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default App;