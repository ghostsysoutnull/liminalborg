import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const SimulationContext = require('./context');
const config = require('../../config');
const commandHandlers = require('../../lib/commands').handlers;
const eventHandlers = require('../../events/index').handlers;
const reflectionEngine = require('../../lib/reflection');

describe('Simulation: End-to-End Integration', () => {
    const originalShadowMode = config.shadowMode;

    beforeEach(() => {
        config.shadowMode = true;
        reflectionEngine.pendingReflection = null;
    });

    afterEach(() => {
        config.shadowMode = originalShadowMode;
    });

    it('should complete a full /reflect -> Broadcast flow', async () => {
        // 1. Operator sends /reflect
        const reflectCtx = new SimulationContext({
            message: { text: '/reflect Liminal cityscapes', message_id: 301 }
        });
        
        console.log('--- Step 1: /reflect command ---');
        await commandHandlers.reflect(reflectCtx);

        // Verify thinking message sent
        expect(reflectCtx.findEvent('Consulting The Prime Intelligence')).toBeDefined();
        
        // Verify staged dispatch sent (Reflection Engine is mocked in shadow mode)
        const stagedEvent = reflectCtx.findEvent('Staged Dispatch');
        expect(stagedEvent).toBeDefined();
        expect(stagedEvent.type).toBe('EDIT');
        expect(reflectionEngine.pendingReflection).not.toBeNull();

        // 2. Operator clicks [✅ Broadcast]
        const broadcastCtx = new SimulationContext({
            callbackQuery: { data: 'dispatch_broadcast' }
        });

        console.log('--- Step 2: dispatch_broadcast action ---');
        await eventHandlers.dispatch_broadcast(broadcastCtx);

        // Verify broadcast status
        expect(broadcastCtx.findEvent('Broadcasting to the Collective')).toBeDefined();
        
        // Verify completion
        const finalEvent = broadcastCtx.findEvent('Broadcast Complete');
        expect(finalEvent).toBeDefined();
        expect(finalEvent.content).toContain('mock-blog.com/post');
        expect(finalEvent.content).toContain('x.com/i/status/mock_tweet_id');

        // Verify state cleared
        expect(reflectionEngine.pendingReflection).toBeNull();
    });
});
