export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  explanation?: string;
  explanationTitle?: string;
  codeSnippet?: string; // Add code snippet for rule-based bot
}

export interface ChatBotProps {
    lastUserMessage: Message | null;
    onBotReplied: () => void;
    resetCounter: number;
}
