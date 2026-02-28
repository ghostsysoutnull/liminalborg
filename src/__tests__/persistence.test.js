import { describe, it, expect, vi, beforeEach } from 'vitest';
const fs = require('fs').promises;
const { loadSettings, saveSettings } = require('../lib/persistence');

describe('Persistence Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty object if file does not exist', async () => {
        vi.spyOn(fs, 'readFile').mockRejectedValue({ code: 'ENOENT' });
        const settings = await loadSettings();
        expect(settings).toEqual({});
    });

    it('should load settings correctly', async () => {
        const mockData = JSON.stringify({ '123': { temperature: 0.5 } });
        vi.spyOn(fs, 'readFile').mockResolvedValue(mockData);
        const settings = await loadSettings();
        expect(settings['123'].temperature).toBe(0.5);
    });

    it('should save settings correctly', async () => {
        const mockSettings = { '123': { temperature: 0.5 } };
        const spyWrite = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
        
        await saveSettings(mockSettings);
        
        expect(spyWrite).toHaveBeenCalledWith(
            expect.stringContaining('settings.json'),
            expect.stringContaining('"temperature": 0.5'),
            'utf8'
        );
    });
});
