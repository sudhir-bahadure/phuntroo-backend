import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROK_API_KEY
});

/**
 * Send a chat message to Grok AI and get a response
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<string>} AI response
 */
export async function getChatResponse(message, conversationHistory = []) {
    try {
        const messages = [
            {
                role: 'system',
                content: `You are Jarvis, an intelligent AI assistant. You are helpful, friendly, and professional. 
        You are speaking to ${process.env.USERNAME || 'the user'}. Keep responses concise but informative.
        You have a realistic 3D avatar that displays emotions and gestures while speaking.`
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message
            }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: 'mixtral-8x7b-32768', // Using Mixtral model for better responses
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('Grok API Error:', error);
        throw new Error(`Failed to get AI response: ${error.message}`);
    }
}

/**
 * Analyze user intent and classify the query
 * @param {string} query - User query
 * @returns {Promise<Object>} Intent analysis
 */
export async function analyzeIntent(query) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Analyze the user's query and classify it into categories:
          - general: General conversation
          - realtime: Requires real-time information (weather, news, current events)
          - automation: System commands (open, close, play)
          - image: Image generation request
          Return JSON with: { type: string, confidence: number, keywords: string[] }`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
        console.error('Intent Analysis Error:', error);
        return { type: 'general', confidence: 0.5, keywords: [] };
    }
}

export default {
    getChatResponse,
    analyzeIntent
};
