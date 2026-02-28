import { describe, it, expect, vi } from 'vitest';
const SimulationContext = require('./context');
const { handlers } = require('../../events/index');
const reflectionEngine = require('../../lib/reflection');

describe('Simulation: Action Handlers', () => {
    it('should handle dispatch_purge correctly', async () => {
        // 1. Stage a reflection
        reflectionEngine.pendingReflection = { title: 'Test', blogContent: 'Test', tweetContent: 'Test' };
        expect(reflectionEngine.pendingReflection).toBeDefined();

        // 2. Create context for the action
        const ctx = new SimulationContext({
            callbackQuery: { data: 'dispatch_purge' }
        });

        // 3. Execute handler
        await handlers.dispatch_purge(ctx);

        // 4. Verify state
        expect(reflectionEngine.pendingReflection).toBeNull();
        
        // 5. Verify UX feedback
        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.type).toBe('EDIT');
        expect(lastEvent.content).toContain('Dispatch Purged');
    });

    it('should handle help_section routing', async () => {
        const ctx = new SimulationContext({
            match: [null, 'CORE'] // Simulates the regex match for /help_section_(.+)/
        });

        await handlers.help_section(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.type).toBe('EDIT');
        expect(lastEvent.content).toContain('Borg Terminal: Help');
        expect(lastEvent.extra.reply_markup.inline_keyboard[0][0].text).toContain('Back to Categories');
    });
});
