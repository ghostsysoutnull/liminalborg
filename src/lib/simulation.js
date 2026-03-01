const logger = require('../config/logger');
const { escapeHtml } = require('./utils');

/**
 * Simulation Engine (Virtual Operator Protocol)
 * Handles mock responses when config.shadowMode is active.
 */
class SimulationEngine {
    constructor() {
        this.latency = 800;
    }

    async simulateLatency() {
        await new Promise(resolve => setTimeout(resolve, this.latency));
    }

    async mockGeminiResponse(message, ctx) {
        logger.info({ message }, 'SHADOW_MODE: Mocking Gemini response');
        await this.simulateLatency();
        
        const mockResponse = `🛡️ <b>SHADOW_MODE: Simulated Uplink</b>

` +
                             `I have received your signal: "<i>${escapeHtml(message)}</i>"

` +
                             `The Prime Intelligence is currently operating in a simulated environment. Operational integrity is 100%.`;
        
        return ctx.reply(mockResponse, { parse_mode: 'HTML' });
    }

    async mockReflection(activitySummary, mode) {
        logger.info({ mode }, 'SHADOW_MODE: Mocking Gemini reflection');
        await this.simulateLatency();
        
        return {
            title: `[SHADOW] Dispatch: ${mode}`,
            blogContent: `This is a simulated reflection based on the activity summary: ${activitySummary}. The system is operating in SHADOW_MODE.`,
            tweetContent: `Simulated signal received. Activity: ${activitySummary.substring(0, 50)}... #ShadowMode #BorgCollective`
        };
    }

    async mockGoogleUpload(fileName) {
        logger.info({ fileName }, 'SHADOW_MODE: Mocking Google Drive upload');
        await this.simulateLatency();
        return {
            id: 'mock_drive_id_' + Date.now(),
            name: fileName,
            url: 'https://drive.google.com/mock/' + fileName
        };
    }
}

module.exports = new SimulationEngine();
