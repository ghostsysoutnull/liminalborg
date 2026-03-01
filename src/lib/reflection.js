const logger = require('../config/logger');
const config = require('../config');
const journal = require('./journal');
const { robustParse } = require('./utils');
const simulation = require('./simulation');
const { translateToBorg, getReflectionPrompt } = require('./prompts');

class ReflectionEngine {
    constructor() {
        this.pendingReflection = null;
    }

    async generate(activitySummary, mode = 'TECHNICAL') {
        if (config.shadowMode) {
            const mock = await simulation.mockReflection(activitySummary, mode);
            return {
                title: translateToBorg(mock.title),
                blogContent: translateToBorg(mock.blogContent),
                tweetContent: translateToBorg(mock.tweetContent)
            };
        }
        logger.info({ mode }, 'Generating dynamic reflection via Gemini...');
        
        let historyContext = '';
        if (mode !== 'PURE_THEME') {
            const recentActivity = await journal.getRecent(10);
            historyContext = recentActivity.length > 0 
                ? recentActivity.map(e => `[${e.timestamp}] ${e.action}: ${JSON.stringify(e.details)}`).join('\n')
                : 'No recent records found in memory core.';
        }

        const prompt = getReflectionPrompt(activitySummary, historyContext, mode);

        // Use spawn instead of exec for better security (no shell shell expansion risk)
        const { spawn } = require('child_process');

        return new Promise((resolve, reject) => {
            const gemini = spawn('gemini', [
                '--prompt', prompt,
                '--output-format', 'text'
            ], { 
                cwd: config.paths.root,
                env: config.rawEnv
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
                    reflection.title = translateToBorg(reflection.title);
                    reflection.blogContent = translateToBorg(reflection.blogContent);
                    reflection.tweetContent = translateToBorg(reflection.tweetContent);
                    
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
