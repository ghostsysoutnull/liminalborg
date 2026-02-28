import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const SimulationContext = require('./context');
const config = require('../../config');
const { handlers } = require('../../events/index');

describe('Simulation: Natural Language Directives', () => {
    const originalShadowMode = config.shadowMode;

    beforeEach(() => {
        config.shadowMode = true;
    });

    afterEach(() => {
        config.shadowMode = originalShadowMode;
    });

    it('should handle "Post this to X" as a reply', async () => {
        const ctx = new SimulationContext({
            message: { 
                text: 'Post this to X', 
                message_id: 401,
                reply_to_message: {
                    text: 'This is the content to tweet',
                    message_id: 400
                }
            }
        });

        // The handler uses ctx.message.reply_to_message internally
        await handlers.onText(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.content).toContain('Posted to The Sprawl-Feed');
        expect(lastEvent.content).toContain('x.com/i/status/mock_tweet_id');
    });

    it('should fail gracefully if no text in reply', async () => {
        const ctx = new SimulationContext({
            message: { 
                text: 'Post this to X', 
                message_id: 402,
                reply_to_message: {
                    // No text or caption
                    message_id: 400
                }
            }
        });

        await handlers.onText(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.content).toContain('No text found in the replied message');
    });
});
