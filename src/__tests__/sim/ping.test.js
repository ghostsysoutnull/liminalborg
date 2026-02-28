import { describe, it, expect, beforeEach } from 'vitest';
const SimulationContext = require('./context');
const { handlers } = require('../../lib/commands');
const { MESSAGES } = require('../../lib/constants');

describe('Simulation: Basic Commands', () => {
    it('should respond to /ping with PONG', async () => {
        const ctx = new SimulationContext({
            message: { text: '/ping', message_id: 101 }
        });

        // Directly invoke the refactored handler
        await handlers.ping(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.type).toBe('SEND');
        expect(lastEvent.content).toBe(MESSAGES.PING_PONG);
    });

    it('should render help menu correctly', async () => {
        const ctx = new SimulationContext();
        
        await handlers.help(ctx);
        
        const event = ctx.findEvent('Borg Terminal: Help');
        expect(event).toBeDefined();
        expect(event.extra.reply_markup.inline_keyboard).toBeDefined();
        expect(event.extra.reply_markup.inline_keyboard[0][0].text).toBe('🦾 Core');
    });
});
