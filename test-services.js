import dotenv from 'dotenv';
import { getChatResponse, analyzeIntent } from './services/grokService.js';
import { enhanceText, summarizeText } from './services/cohereService.js';
import { analyzeSentiment } from './services/huggingFaceService.js';

dotenv.config();

async function testServices() {
    console.log('🔍 Testing AI Services...\n');

    // 1. Test Grok (Critical)
    try {
        console.log('Testing Grok (Chat)...');
        const response = await getChatResponse('Hello, are you working?');
        console.log('✅ Grok Chat Success:', response.substring(0, 50) + '...');
    } catch (error) {
        console.error('❌ Grok Chat Failed:', error);
        if (error.error) console.error('Error details:', JSON.stringify(error.error, null, 2));
    }

    try {
        console.log('\nTesting Grok (Intent)...');
        const intent = await analyzeIntent('What is the weather?');
        console.log('✅ Grok Intent Success:', intent);
    } catch (error) {
        console.error('❌ Grok Intent Failed:', error.message);
    }

    // 2. Test Cohere (Optional)
    try {
        console.log('\nTesting Cohere (Enhance)...');
        const enhanced = await enhanceText('i want go home now');
        console.log('✅ Cohere Enhance Success:', enhanced);
    } catch (error) {
        console.error('❌ Cohere Enhance Failed:', error.message);
    }

    // 3. Test HuggingFace (Optional)
    try {
        console.log('\nTesting HuggingFace (Sentiment)...');
        const sentiment = await analyzeSentiment('I am very happy today!');
        console.log('✅ HF Sentiment Success:', sentiment);
    } catch (error) {
        console.error('❌ HF Sentiment Failed:', error.message);
    }
}

testServices();
