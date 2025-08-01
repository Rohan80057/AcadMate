
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';
import type { Chat } from '@google/genai';
import { SparklesIcon, UserIcon } from './Icons';

interface AiChatProps {
    userProfile: UserProfile | null;
}

const AiChat: React.FC<AiChatProps> = ({ userProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = startChat();
        setMessages([
          { id: crypto.randomUUID(), role: 'model', text: `Hello ${userProfile?.name || 'there'}! I am AcadMate's AI assistant. How can I help you with your studies today?` }
        ])
    }, [userProfile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;
        
        const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessageId = crypto.randomUUID();
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

        try {
            const result = await chatRef.current.sendMessageStream({ message: input });
            let streamedText = '';
            for await (const chunk of result) {
                streamedText += chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: streamedText } : msg
                ));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, text: "Sorry, I encountered an error. Please try again." } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    const UserAvatar: React.FC = () => (
        <div className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center font-bold flex-shrink-0 shadow-sm overflow-hidden">
            {userProfile?.profilePic 
                ? <img src={userProfile.profilePic} alt="You" className="w-full h-full object-cover" />
                : <UserIcon className="w-6 h-6" />
            }
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-lg">
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                             {message.role === 'model' && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                                    <SparklesIcon className="w-6 h-6"/>
                                </div>
                             )}
                            <div className={`max-w-xl p-4 rounded-2xl shadow-sm animate-fadeInMain ${
                                message.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{message.text || <span className="animate-pulse">...</span>}</p>
                            </div>
                            {message.role === 'user' && <UserAvatar />}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Gemini anything..."
                        disabled={isLoading}
                        className="flex-1 p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-6 py-3 font-semibold text-white bg-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AiChat;
