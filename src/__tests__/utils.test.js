import { describe, it, expect } from 'vitest';
const { escapeHtml, robustParse } = require('../lib/utils');

describe('Utility Core', () => {
    describe('escapeHtml', () => {
        it('should escape HTML special characters', () => {
            const input = '<b> "Me & You" <script>';
            const expected = '&lt;b&gt; "Me &amp; You" &lt;script&gt;';
            expect(escapeHtml(input)).toBe(expected);
        });

        it('should handle non-string inputs gracefully', () => {
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
            expect(escapeHtml(123)).toBe('');
        });
    });

    describe('robustParse', () => {
        it('should parse clean JSON', () => {
            const input = '{"key": "value"}';
            const result = robustParse(input);
            expect(result.key).toBe('value');
        });

        it('should harvest JSON from noisy output', () => {
            const input = `[dotenv] noise
{"title": "Valid"}
more noise`;
            const result = robustParse(input, 'title');
            expect(result.title).toBe('Valid');
        });

        it('should clean trailing commas', () => {
            const input = '{"a": 1, "b": 2, }';
            const result = robustParse(input);
            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
        });

        it('should throw error on completely invalid input', () => {
            const input = 'not a json at all';
            expect(() => robustParse(input)).toThrow('No valid JSON block detected');
        });

        it('should fail if required key is missing', () => {
            const input = '{"wrong_key": 1}';
            expect(() => robustParse(input, 'requiredKey')).toThrow('Required key "requiredKey" missing from harvested object');
        });
    });
});
