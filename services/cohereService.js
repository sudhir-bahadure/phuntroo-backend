import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config();

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

/**
 * Enhance text quality and grammar
 * @param {string} text - Text to enhance
 * @returns {Promise<string>} Enhanced text
 */
export async function enhanceText(text) {
    try {
        const response = await cohere.generate({
            prompt: `Improve the following text for clarity and grammar while maintaining its meaning:\n\n${text}\n\nImproved version:`,
            maxTokens: 300,
            temperature: 0.3,
            k: 0,
            stopSequences: [],
            returnLikelihoods: 'NONE'
        });

        return response.generations[0]?.text.trim() || text;
    } catch (error) {
        console.error('Cohere Enhancement Error:', error);
        return text; // Return original text if enhancement fails
    }
}

/**
 * Summarize long text
 * @param {string} text - Text to summarize
 * @param {number} length - Desired summary length ('short', 'medium', 'long')
 * @returns {Promise<string>} Summary
 */
export async function summarizeText(text, length = 'medium') {
    try {
        const response = await cohere.summarize({
            text: text,
            length: length,
            format: 'paragraph',
            model: 'command',
            extractiveness: 'medium',
            temperature: 0.3
        });

        return response.summary || text;
    } catch (error) {
        console.error('Cohere Summarization Error:', error);
        return text;
    }
}

/**
 * Classify text into categories
 * @param {string} text - Text to classify
 * @param {Array<string>} categories - Possible categories
 * @returns {Promise<Object>} Classification result
 */
export async function classifyText(text, categories) {
    try {
        const response = await cohere.classify({
            inputs: [text],
            examples: categories.map(cat => ({
                text: cat,
                label: cat
            }))
        });

        return {
            category: response.classifications[0]?.prediction || 'unknown',
            confidence: response.classifications[0]?.confidence || 0
        };
    } catch (error) {
        console.error('Cohere Classification Error:', error);
        return { category: 'unknown', confidence: 0 };
    }
}

/**
 * Generate embeddings for semantic search
 * @param {Array<string>} texts - Texts to embed
 * @returns {Promise<Array>} Embeddings
 */
export async function generateEmbeddings(texts) {
    try {
        const response = await cohere.embed({
            texts: texts,
            model: 'embed-english-v3.0',
            inputType: 'search_document'
        });

        return response.embeddings;
    } catch (error) {
        console.error('Cohere Embedding Error:', error);
        return [];
    }
}

export default {
    enhanceText,
    summarizeText,
    classifyText,
    generateEmbeddings
};
