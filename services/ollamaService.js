/**
 * Ollama Service - Local AI with Zero Cost
 * Download Ollama at: https://ollama.ai
 * Run: ollama pull mistral
 */

const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

class OllamaService {
    constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_URL;
        this.model = process.env.OLLAMA_MODEL || 'mistral';
    }

    async chat(messages, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || this.model,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: options.temperature || 0.7,
                        top_p: options.topP || 0.9,
                        num_predict: options.maxTokens || 1024
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                response: data.message.content,
                model: data.model,
                service: 'ollama',
                local: true
            };
        } catch (error) {
            console.error('Ollama service error:', error);
            throw error;
        }
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET'
            });

            if (!response.ok) {
                return {
                    available: false,
                    reason: 'Ollama not running'
                };
            }

            const data = await response.json();
            const models = data.models || [];

            return {
                available: models.length > 0,
                models: models.map(m => m.name),
                service: 'ollama',
                local: true
            };
        } catch (error) {
            return {
                available: false,
                reason: 'Ollama not installed or not running. Download at https://ollama.ai'
            };
        }
    }

    async listModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to list Ollama models:', error);
            return [];
        }
    }

    async pullModel(modelName) {
        try {
            const response = await fetch(`${this.baseUrl}/api/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: modelName
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to pull Ollama model:', error);
            return false;
        }
    }
}

module.exports = new OllamaService();
