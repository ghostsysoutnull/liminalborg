import { describe, it, expect } from 'vitest';
const reflectionEngine = require('../lib/reflection');

describe('Reflection Engine', () => {
    describe('translate', () => {
        it('should translate mundane terms to Borg aliases', () => {
            const input = 'I am using Google Drive and X.com on my Node.js Server.';
            const result = reflectionEngine.translate(input);
            
            expect(result).toContain('The Deep Archive');
            expect(result).toContain('The Sprawl-Feed');
            expect(result).toContain('The Ghost Process');
            expect(result).toContain('The Sustainment Engine');
            expect(result).not.toContain('Google Drive');
            expect(result).not.toContain('X.com');
        });

        it('should handle "Drive" separately from "Google Drive"', () => {
            const input = 'Check the Drive';
            const result = reflectionEngine.translate(input);
            expect(result).toBe('Check the The Reliquary');
        });

        it('should be case-insensitive', () => {
            const input = 'drive and drive';
            const result = reflectionEngine.translate(input);
            expect(result).toBe('The Reliquary and The Reliquary');
        });
    });
});
