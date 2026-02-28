import { describe, it, expect, vi, beforeEach } from 'vitest';
const fs = require('fs').promises;
const missionManager = require('../lib/mission');

describe('Mission Manager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        missionManager.activeMission = null;
    });

    describe('plan', () => {
        it('should plan a TECHNICAL mission by default', async () => {
            const spyWrite = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
            const blueprint = await missionManager.plan('Improve Core');
            
            expect(blueprint.type).toBe('TECHNICAL');
            expect(blueprint.objective).toBe('Improve Core');
            expect(blueprint.nodes.length).toBe(3);
            expect(spyWrite).toHaveBeenCalled();
        });

        it('should plan a REFLECTION mission for REFLECT: objectives', async () => {
            const spyWrite = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
            const objective = 'REFLECT:PURE_THEME:Cyberpunk Neon';
            const blueprint = await missionManager.plan(objective);
            
            expect(blueprint.type).toBe('REFLECTION');
            expect(blueprint.params.mode).toBe('PURE_THEME');
            expect(blueprint.params.summary).toBe('Cyberpunk Neon');
            expect(blueprint.nodes[0].command).toBe('node');
            expect(blueprint.nodes[0].args).toContain('scripts/generate_reflection.js');
            expect(spyWrite).toHaveBeenCalled();
        });
    });

    describe('formatBlueprint', () => {
        it('should format blueprint as HTML', async () => {
            const blueprint = {
                id: 'abc',
                objective: 'Test Obj',
                nodes: [{ id: 1, task: 'Task 1', status: 'STAGED' }]
            };
            const result = missionManager.formatBlueprint(blueprint);
            expect(result).toContain('<b>Mission Blueprint: abc</b>');
            expect(result).toContain('<i>Test Obj</i>');
            expect(result).toContain('[⬜] Node-1: Task 1');
        });
    });
});
