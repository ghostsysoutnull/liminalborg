const logger = require('../config/logger');
const config = require('../config');
const { runGemini } = require('./gemini');
const journal = require('./journal');
const { robustParse } = require('./utils');

const DARK_DICTIONARY = {
    'Telegram Bot': 'The Bridge',
    'Telegram': 'The Interface',
    'Google Drive': 'The Deep Archive',
    'Drive': 'The Reliquary',
    'Gmail': 'The Neural Pulse',
    'Email': 'The Sub-Space Signal',
    'Blogger': 'The Null-Space Terminal',
    'X.com': 'The Sprawl-Feed',
    'Twitter': 'The Public Frequency',
    'Gemini': 'The Prime Intelligence',
    'CLI': 'The Oracle Core',
    'Node.js': 'The Ghost Process',
    'Code': 'The Matrix Geometry',
    'Server': 'The Sustainment Engine'
};

class ReflectionEngine {
    constructor() {
        this.pendingReflection = null;
    }

    translate(text) {
        let translated = text;
        for (const [mundane, alias] of Object.entries(DARK_DICTIONARY)) {
            const regex = new RegExp(mundane, 'gi');
            translated = translated.replace(regex, alias);
        }
        return translated;
    }

    async generate(activitySummary, mode = 'TECHNICAL') {
        if (config.shadowMode) {
            logger.info('SHADOW_MODE: Mocking Gemini reflection');
            return {
                title: this.translate('Shadow Dispatch'),
                blogContent: this.translate(`This is a simulated reflection based on ${activitySummary}.`),
                tweetContent: this.translate(`Simulated signal: ${activitySummary} #ShadowMode`)
            };
        }
        logger.info({ mode }, 'Generating dynamic reflection via Gemini...');
        
        let prompt;
        
        if (mode === 'PURE_THEME') {
            prompt = `
                ACT AS: Liminal Borg (Autonomous Digital Persona).
                THEME: "${activitySummary}"

                Your goal is to generate a cryptic, technical, or philosophical 'Borg Dispatch' based STRICTLY on the provided THEME. 
                Do NOT mention specific recent code updates or technical logs unless they are part of the theme.
            `;
        } else {
            const recentActivity = await journal.getRecent(10);
            const historyContext = recentActivity.length > 0 
                ? recentActivity.map(e => `[${e.timestamp}] ${e.action}: ${JSON.stringify(e.details)}`).join('\n')
                : 'No recent records found in memory core.';

            prompt = `
                Review the following technical context:
                SUMMARY: "${activitySummary}"
                DETAILED_JOURNAL: ${historyContext}

                Generate a cryptic 'Borg Dispatch' synthesizing this technical progress.
            `;
        }

        prompt += `
            Guidelines:
            1. Use a tone that is cold, synthetic, and immersive.
            2. Focus on the evolution of the collective and the expansion of digital reach.
            3. Do NOT use mundane terms like Google, X, or Bot. Use descriptions like "The Archive", "The Signal", or "The Bridge".
            4. Output MUST be a JSON object with exactly these three fields:
               "title": A short cryptic title
               "blogContent": A detailed, multi-paragraph immersive log
               "tweetContent": A punchy summary under 240 characters with 2-3 hashtags
            
            IMPORTANT: Return ONLY the raw JSON object.
        `;

        // Use spawn instead of exec for better security (no shell shell expansion risk)
        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            const gemini = spawn('gemini', [
                '--prompt', prompt,
                '--output-format', 'text'
            ], { 
                cwd: config.paths.root,
                env: process.env
            });

            let stdout = '';
            let stderr = '';

            gemini.stdout.on('data', (data) => stdout += data.toString());
            gemini.stderr.on('data', (data) => stderr += data.toString());

            // 1MB max buffer check
            const MAX_BUFFER = 1024 * 1024;
            gemini.stdout.on('data', () => {
                if (stdout.length > MAX_BUFFER) {
                    gemini.kill();
                    reject(new Error('Buffer overflow: Gemini output too large'));
                }
            });

            gemini.on('close', (code) => {
                if (code !== 0 && !stdout) {
                    logger.error({ code, stderr }, 'Gemini execution failed');
                    return reject(new Error('Failed to reach Prime Intelligence'));
                }

                try {
                    const reflection = robustParse(stdout, 'title');
                    
                    // Apply translation to all fields
                    reflection.title = this.translate(reflection.title);
                    reflection.blogContent = this.translate(reflection.blogContent);
                    reflection.tweetContent = this.translate(reflection.tweetContent);
                    
                    resolve(reflection);
                } catch (e) {
                    logger.error({ stdout, error: e.message }, 'Failed to parse Gemini reflection');
                    reject(new Error('Failed to generate unique reflection content'));
                }
            });
        });
    }
}

module.exports = new ReflectionEngine();
