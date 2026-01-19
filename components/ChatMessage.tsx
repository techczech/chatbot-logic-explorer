import React, { useState } from 'react';
import type { Message } from '../types';
import { UserIcon, RobotIcon } from './icons';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const [isExplanationVisible, setExplanationVisible] = useState(true);
    const [isCodeVisible, setCodeVisible] = useState(false);

    const isUser = message.sender === 'user';
    const messageBg = isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-gray-800';
    const messageAlignment = isUser ? 'items-end' : 'items-start';
    const bubbleAlignment = isUser ? 'rounded-br-none' : 'rounded-bl-none';
    const icon = isUser ? <UserIcon /> : <RobotIcon />;
    const iconContainerClasses = isUser ? 'ml-3' : 'mr-3';
    const messageFlexDirection = isUser ? 'flex-row-reverse' : 'flex-row';

    return (
        <div className={`flex flex-col mb-4 ${messageAlignment}`}>
            <div className={`flex items-end max-w-xl ${messageFlexDirection}`}>
                <div className={`p-2 rounded-full ${isUser ? 'bg-blue-500' : 'bg-gray-600'} text-white ${iconContainerClasses}`}>
                    {icon}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${messageBg} ${bubbleAlignment}`}>
                    <p className="text-sm">{message.text}</p>
                </div>
            </div>
            {message.explanation && (
                <div className={`mt-2 ${isUser ? 'self-end' : 'self-start ml-12'}`}>
                    <button
                        onClick={() => setExplanationVisible(!isExplanationVisible)}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                    >
                        {isExplanationVisible ? 'Hide Logic' : 'Show Logic'}
                    </button>
                </div>
            )}
            {isExplanationVisible && message.explanation && (
                 <div className={`mt-2 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg max-w-xl ${isUser ? 'self-end' : 'self-start ml-12'}`}>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">{message.explanationTitle}</h4>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                        {message.explanation}
                    </pre>
                    {message.codeSnippet && (
                        <div className="mt-4">
                            <button
                                onClick={() => setCodeVisible(!isCodeVisible)}
                                className="text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                            >
                                {isCodeVisible ? 'Hide Code' : 'Show Code'}
                            </button>
                        </div>
                    )}
                    {isCodeVisible && message.codeSnippet && (
                        <pre className="mt-2 bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                            <code className="text-xs whitespace-pre-wrap font-mono">
                                {message.codeSnippet}
                            </code>
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
