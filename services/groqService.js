/**
 * Groq AI Service - Fast and Free AI API
 * Get your API key at: https://console.groq.com
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
        this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
        this.isAvailable = !!this.apiKey;
    }

    async chat(messages, options = {}) {
        if (!this.isAvailable) {
            throw new Error('Groq API key not configured');
        }

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || this.model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 1024,
                    top_p: options.topP || 1,
                    stream: false
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();

            return {
                response: data.choices[0].message.content,
                model: data.model,
                usage: data.usage,
                service: 'groq'
            };
        } catch (error) {
            console.error('Groq service error:', error);
            throw error;
        }
    }

    async checkHealth() {
        if (!this.isAvailable) {
            return { available: false, reason: 'API key not configured' };
        }

        try {
            const testResponse = await this.chat([
                { role: 'user', content: 'Hi' }
            ], { maxTokens: 10 });

            return {
                available: true,
                model: this.model,
                service: 'groq'
            };
        } catch (error) {
            return {
                available: false,
                reason: error.message
            };
        }
    }
}

module.exports = new GroqService();
