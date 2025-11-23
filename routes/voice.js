import express from 'express';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize Google TTS client (will use application default credentials or API key)
let ttsClient;
try {
    ttsClient = new textToSpeech.TextToSpeechClient();
} catch (error) {
    console.warn('Google TTS not configured, using fallback');
}

/**
 * POST /api/voice/tts
 * Convert text to speech with Indian female voice
 */
router.post('/tts', async (req, res) => {
    try {
        const { text, language = 'en-IN', voiceName = 'en-IN-Wavenet-A' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // If Google TTS is available, use it
        if (ttsClient) {
            const request = {
                input: { text },
                voice: {
                    languageCode: language,
                    name: voiceName, // Indian English female voice
                    ssmlGender: 'FEMALE'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: 0,
                    speakingRate: 1.0
                }
            };

            const [response] = await ttsClient.synthesizeSpeech(request);

            // Save audio file
            const audioDir = path.join(__dirname, '../../audio');
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }

            const filename = `speech_${Date.now()}.mp3`;
            const filepath = path.join(audioDir, filename);

            fs.writeFileSync(filepath, response.audioContent, 'binary');

            res.json({
                audioUrl: `/audio/${filename}`,
                duration: text.length * 0.1, // Approximate duration
                timestamp: new Date().toISOString()
            });

        } else {
            // Fallback: Use browser's built-in speech synthesis
            res.json({
                text,
                useBrowserTTS: true,
                voice: {
                    lang: language,
                    name: 'Google हिन्दी' // Indian voice
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({
            error: 'Failed to generate speech',
            details: error.message,
            useBrowserTTS: true,
            text: req.body.text
        });
    }
});

/**
 * POST /api/voice/analyze-audio
 * Analyze audio for lip-sync data
 */
router.post('/analyze-audio', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Generate phoneme data for lip-sync
        // This is a simplified version - in production, use a proper phoneme analyzer
        const words = text.split(' ');
        const phonemeData = words.map((word, index) => ({
            word,
            startTime: index * 0.5,
            endTime: (index + 1) * 0.5,
            phonemes: analyzeWordPhonemes(word)
        }));

        res.json({
            phonemeData,
            totalDuration: words.length * 0.5,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Audio analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze audio',
            details: error.message
        });
    }
});

/**
 * Helper function to analyze word phonemes for lip-sync
 */
function analyzeWordPhonemes(word) {
    const phonemes = [];
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = {
        'p': 'P', 'b': 'P', 'm': 'M',
        'f': 'F', 'v': 'F',
        'th': 'TH',
        's': 'S', 'z': 'S',
        'sh': 'CH', 'ch': 'CH',
        'l': 'L',
        'r': 'R',
        'w': 'W'
    };

    for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();

        if (vowels.includes(char)) {
            phonemes.push({ type: 'vowel', shape: 'A' });
        } else if (consonants[char]) {
            phonemes.push({ type: 'consonant', shape: consonants[char] });
        } else {
            phonemes.push({ type: 'consonant', shape: 'neutral' });
        }
    }

    return phonemes;
}

/**
 * GET /api/voice/voices
 * Get available voices
 */
router.get('/voices', async (req, res) => {
    try {
        const voices = [
            {
                name: 'en-IN-Wavenet-A',
                language: 'en-IN',
                gender: 'FEMALE',
                description: 'Indian English Female (Wavenet)'
            },
            {
                name: 'en-IN-Wavenet-D',
                language: 'en-IN',
                gender: 'FEMALE',
                description: 'Indian English Female (Wavenet) - Alternative'
            },
            {
                name: 'en-IN-Standard-A',
                language: 'en-IN',
                gender: 'FEMALE',
                description: 'Indian English Female (Standard)'
            },
            {
                name: 'hi-IN-Wavenet-A',
                language: 'hi-IN',
                gender: 'FEMALE',
                description: 'Hindi Female (Wavenet)'
            }
        ];

        res.json({ voices });
    } catch (error) {
        console.error('Get voices error:', error);
        res.status(500).json({
            error: 'Failed to get voices',
            details: error.message
        });
    }
});

export default router;
