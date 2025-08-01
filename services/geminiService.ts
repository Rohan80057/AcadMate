
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export function startChat(): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are AcadMate, a friendly and helpful academic assistant. You help students with their questions, explain concepts, and provide study support. Your tone is encouraging and clear.',
            thinkingConfig: { thinkingBudget: 0 } // For low latency chat
        },
    });
    return chat;
}
