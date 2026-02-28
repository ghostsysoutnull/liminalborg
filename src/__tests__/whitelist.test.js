import { describe, it, expect, vi, beforeEach } from 'vitest';
const fs = require('fs').promises;
const { loadWhitelist, saveWhitelist } = require('../lib/whitelist');
const config = require('../config');

describe('Whitelist Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should bootstrap with owner if file is missing', async () => {
        vi.spyOn(fs, 'readFile').mockRejectedValue({ code: 'ENOENT' });
        const spyWrite = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
        
        const list = await loadWhitelist();
        expect(list).toContain(config.authorizedChatId.toString());
        expect(spyWrite).toHaveBeenCalled();
    });

    it('should load whitelist and ensure owner is present', async () => {
        const mockData = JSON.stringify(['99999']);
        vi.spyOn(fs, 'readFile').mockResolvedValue(mockData);
        vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        
        const list = await loadWhitelist();
        expect(list).toContain('99999');
        expect(list).toContain(config.authorizedChatId.toString());
    });

    it('should save whitelist correctly', async () => {
        const mockList = [config.authorizedChatId.toString(), '99999'];
        const spyWrite = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
        
        await saveWhitelist(mockList);
        expect(spyWrite).toHaveBeenCalledWith(
            expect.stringContaining('whitelist.json'),
            expect.stringContaining('"99999"'),
            'utf8'
        );
    });
});
