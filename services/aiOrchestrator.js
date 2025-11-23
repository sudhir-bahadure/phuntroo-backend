/**
 * AI Orchestrator - Intelligent AI Service Management
 * Manages fallback chain: Groq → Grok → Hugging Face → Ollama
 */

const groqService = require('./groqService');
const grokService = require('./grokService');
const huggingFaceService = require('./huggingFaceService');
const ollamaService = require('./ollamaService');

class AIOrchestrator {
    constructor() {
        // Service priority from environment or default
        const priority = process.env.AI_SERVICE_PRIORITY || 'groq,grok,huggingface,ollama';
        this.servicePriority = priority.split(',').map(s => s.trim());

        this.services = {
            groq: groqService,
            grok: grokService,
            huggingface: huggingFaceService,
            ollama: ollamaService
        };

        this.serviceStatus = {};
    }

    async getResponse(messages, options = {}) {
        const preferredService = options.preferredService || this.servicePriority[0];

        // Try preferred service first
        if (preferredService && this.services[preferredService]) {
            try {
                console.log(`Trying ${preferredService} service...`);
                const result = await this.services[preferredService].chat(messages, options);
                this.serviceStatus[preferredService] = { success: true, lastUsed: Date.now() };
                return result;
            } catch (error) {
                console.warn(`${preferredService} failed:`, error.message);
                this.serviceStatus[preferredService] = { success: false, error: error.message, lastUsed: Date.now() };
            }
        }

        // Fallback chain
        for (const serviceName of this.servicePriority) {
            if (serviceName === preferredService) continue; // Already tried

            const service = this.services[serviceName];
            if (!service) continue;

            try {
                console.log(`Falling back to ${serviceName} service...`);
                const result = await service.chat(messages, options);
                this.serviceStatus[serviceName] = { success: true, lastUsed: Date.now() };
                return result;
            } catch (error) {
                console.warn(`${serviceName} failed:`, error.message);
                this.serviceStatus[serviceName] = { success: false, error: error.message, lastUsed: Date.now() };
            }
        }

        // All services failed
        throw new Error('All AI services are currently unavailable. Please check your API keys and service configurations.');
    }

    async checkAllServices() {
        const status = {};

        for (const [name, service] of Object.entries(this.services)) {
            try {
                status[name] = await service.checkHealth();
            } catch (error) {
                status[name] = { available: false, error: error.message };
            }
        }

        return status;
    }

    getServiceStatus() {
        return this.serviceStatus;
    }

    setServicePriority(priority) {
        this.servicePriority = priority;
    }
}

module.exports = new AIOrchestrator();
