import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const SimulationContext = require('./context');
const config = require('../../config');
const { handlers } = require('../../lib/commands');

describe('Simulation: Shadow Subsystems', () => {
    const originalShadowMode = config.shadowMode;

    beforeEach(() => {
        config.shadowMode = true;
    });

    afterEach(() => {
        config.shadowMode = originalShadowMode;
    });

    it('should mock tweets in shadow mode', async () => {
        const ctx = new SimulationContext({
            message: { text: '/tweet Hello Matrix', message_id: 201 }
        });

        await handlers.tweet(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.content).toContain('Tweet Posted');
        expect(lastEvent.content).toContain('mock_tweet_id');
    });

    it('should mock blog posts in shadow mode', async () => {
        const ctx = new SimulationContext({
            message: { text: '/blog Title | Content', message_id: 202 }
        });

        await handlers.blog(ctx);

        const event = ctx.findEvent('Blog Post Published');
        expect(event).toBeDefined();
        expect(event.content).toContain('https://mock-blog.com/post');
    });
});
