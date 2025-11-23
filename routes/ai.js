import express from 'express';
import { getChatResponse, analyzeIntent } from '../services/grokService.js';
import { enhanceText, summarizeText } from '../services/cohereService.js';
import { analyzeSentiment, generateImage as hfGenerateImage } from '../services/huggingFaceService.js';

const router = express.Router();

// Store conversation history (in production, use a database)
const conversationHistories = new Map();

/**
 * POST /api/ai/chat
 * Send a message and get AI response
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default', enhance = false } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history
        if (!conversationHistories.has(sessionId)) {
            conversationHistories.set(sessionId, []);
        }
        const history = conversationHistories.get(sessionId);

        // Analyze intent
        const intent = await analyzeIntent(message);

        // Get AI response
        let response = await getChatResponse(message, history);

        // Optionally enhance response with Cohere
        if (enhance) {
            response = await enhanceText(response);
        }

        // Analyze sentiment for avatar emotion
        const sentiment = await analyzeSentiment(response);

        // Update conversation history
        history.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response }
        );

        // Keep only last 10 messages
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }

        res.json({
            response,
            intent,
            sentiment,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process chat message',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/summarize
 * Summarize long text
 */
router.post('/summarize', async (req, res) => {
    try {
        const { text, length = 'medium' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const summary = await summarizeText(text, length);

        res.json({
            summary,
            originalLength: text.length,
            summaryLength: summary.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Summarize error:', error);
        res.status(500).json({
            error: 'Failed to summarize text',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/generate-image
 * Generate image from text prompt
 */
router.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const imageBuffer = await hfGenerateImage(prompt);

        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            error: 'Failed to generate image',
            details: error.message
        });
    }
});

/**
 * DELETE /api/ai/history/:sessionId
 * Clear conversation history
 */
router.delete('/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    if (conversationHistories.has(sessionId)) {
        conversationHistories.delete(sessionId);
        res.json({ message: 'History cleared', sessionId });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

/**
 * GET /api/ai/history/:sessionId
 * Get conversation history
 */
router.get('/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const history = conversationHistories.get(sessionId) || [];

    res.json({
        sessionId,
        history,
        messageCount: history.length
    });
});

export default router;
