import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://router.huggingface.co/models';

/**
 * Generate image from text prompt
 * @param {string} prompt - Image generation prompt
 * @returns {Promise<Buffer>} Generated image buffer
 */
export async function generateImage(prompt) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/stabilityai/stable-diffusion-xl-base-1.0`,
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        return Buffer.from(response.data);
    } catch (error) {
        console.error('HuggingFace Image Generation Error:', error);
        throw new Error('Failed to generate image');
    }
}

/**
 * Perform sentiment analysis on text
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Sentiment analysis result
 */
export async function analyzeSentiment(text) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/distilbert-base-uncased-finetuned-sst-2-english`,
            { inputs: text },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data[0];
    } catch (error) {
        console.error('HuggingFace Sentiment Analysis Error:', error);
        return { label: 'NEUTRAL', score: 0.5 };
    }
}

/**
 * Perform question answering
 * @param {string} question - Question to answer
 * @param {string} context - Context for the question
 * @returns {Promise<Object>} Answer
 */
export async function answerQuestion(question, context) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/deepset/roberta-base-squad2`,
            {
                inputs: {
                    question: question,
                    context: context
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('HuggingFace QA Error:', error);
        return { answer: 'Unable to answer', score: 0 };
    }
}

/**
 * Generate speech from text (alternative TTS)
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio buffer
 */
export async function textToSpeech(text) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/facebook/fastspeech2-en-ljspeech`,
            { inputs: text },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        return Buffer.from(response.data);
    } catch (error) {
        console.error('HuggingFace TTS Error:', error);
        throw new Error('Failed to generate speech');
    }
}

/**
 * Detect objects in an image
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Array>} Detected objects
 */
export async function detectObjects(imageBuffer) {
    try {
        const response = await axios.post(
            `${HF_API_URL}/facebook/detr-resnet-50`,
            imageBuffer,
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/octet-stream'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('HuggingFace Object Detection Error:', error);
        return [];
    }
}

export default {
    generateImage,
    analyzeSentiment,
    answerQuestion,
    textToSpeech,
    detectObjects
};
