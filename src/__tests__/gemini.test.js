import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const { runGemini } = require('../lib/gemini');
const config = require('../config');
const SimulationContext = require('./sim/context');

describe('Gemini Integration', () => {
    const originalShadowMode = config.shadowMode;

    beforeEach(() => {
        config.shadowMode = true;
        global.chatSettings = {};
        global.activeProcesses = {};
        config.authorizedChatId = 'REDACTED_OWNER_ID';
        global.whitelist = ['REDACTED_OWNER_ID'];
    });

    afterEach(() => {
        config.shadowMode = originalShadowMode;
    });

    it('should run gemini and handle output', async () => {
        const ctx = new SimulationContext({
            chatId: 'REDACTED_OWNER_ID',
            message: { text: 'Hello Borg', message_id: 100 }
        });

        await runGemini('Hello Borg', ctx);
        
        // In SHADOW_MODE, it should send the mock response
        const mockEvent = ctx.findEvent('SHADOW_MODE: Simulated Uplink');
        expect(mockEvent).toBeDefined();
        expect(mockEvent.content).toContain('Hello Borg');
    });
});
