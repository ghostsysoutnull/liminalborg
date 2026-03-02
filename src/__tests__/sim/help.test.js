import { describe, it, expect, vi, beforeEach } from 'vitest';
const SimulationContext = require('./context');
const config = require('../../config');
const commandHandlers = require('../../lib/commands').handlers;

describe('Simulation: Help Command', () => {
    beforeEach(() => {
        config.surge.domain = 'borg-archives-77.surge.sh';
    });

    it('should include the Archive Uplink URL in the help response', async () => {
        const ctx = new SimulationContext({
            message: { text: '/help', message_id: 101 }
        });

        await commandHandlers.help(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.type).toBe('SEND');
        expect(lastEvent.content).toContain('🌐 <b>Archive Uplink</b>');
        expect(lastEvent.content).toContain('https://borg-archives-77.surge.sh');
        expect(lastEvent.content).toContain('The Collective Index');
    });

    it('should include the Archive Uplink URL in help sub-sections', async () => {
        const eventHandlers = require('../../events/index').handlers;
        const ctx = new SimulationContext({
            match: [null, 'CORE'] // Simulate regex match for CORE section
        });

        await eventHandlers.help_section(ctx);

        const lastEvent = ctx.getLastEvent();
        expect(lastEvent.type).toBe('EDIT');
        expect(lastEvent.content).toContain('🌐 <b>Archive Uplink</b>');
        expect(lastEvent.content).toContain('https://borg-archives-77.surge.sh');
    });
});
