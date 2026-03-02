import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
const indexManager = require('../../lib/index-manager');
const googleManager = require('../../lib/google');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');

describe('Integration: Bookmark Pipeline', () => {
    const JSON_PATH = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.json');
    const HTML_PATH = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.html');
    let originalIndexContent = null;
    let syncSpy;
    let initSpy;

    beforeEach(async () => {
        // Mock googleManager before each test
        initSpy = vi.spyOn(googleManager, 'init').mockResolvedValue(true);
        syncSpy = vi.spyOn(googleManager, 'syncDashboard').mockResolvedValue(true);

        // Backup existing index if it exists
        try {
            originalIndexContent = await fs.readFile(JSON_PATH, 'utf8');
        } catch (e) {
            originalIndexContent = null;
        }
        
        // Ensure clean state for test
        await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
        await fs.writeFile(JSON_PATH, JSON.stringify([]));
        
        global.chatSettings = { "123456789": {} };
        global.activeProcesses = {};
    });

    afterEach(async () => {
        // Restore real data after test
        if (originalIndexContent) {
            await fs.writeFile(JSON_PATH, originalIndexContent);
        } else {
            try { await fs.unlink(JSON_PATH); } catch (e) {}
        }
        vi.restoreAllMocks();
    });

    it('should process a bookmark from metadata to HTML and Drive sync', async () => {
        const metadata = {
            uri: "https://vitest.dev",
            subject: "Vitest Testing Framework",
            category: "Tech",
            labels: ["#testing", "#javascript"],
            technical_summary: "Blazing fast unit test framework powered by Vite.",
            persona_note: "A rapid-response verification node within the Matrix."
        };

        const mockCtx = {
            chat: { id: 123456789 },
            reply: vi.fn().mockResolvedValue({ message_id: 1 })
        };

        // Trigger the pipeline
        await indexManager.processBookmark(metadata, mockCtx);

        // 1. Verify JSON Persistence
        const jsonData = JSON.parse(await fs.readFile(JSON_PATH, 'utf8'));
        const entry = jsonData.find(e => e.uri === "https://vitest.dev");
        expect(entry).toBeDefined();
        expect(entry.subject).toBe("Vitest Testing Framework");

        // 2. Verify HTML Rendering
        const htmlData = await fs.readFile(HTML_PATH, 'utf8');
        expect(htmlData).toContain("Vitest Testing Framework");
        expect(htmlData).toContain("https://vitest.dev");
        expect(htmlData).toContain("&gt; A rapid-response verification node");

        // 3. Verify Operator Notification
        expect(mockCtx.reply).toHaveBeenCalledWith(
            expect.stringContaining("Signal Archived"),
            expect.objectContaining({ parse_mode: 'HTML' })
        );

        // 4. Verify Google Drive Sync Call
        expect(syncSpy).toHaveBeenCalledWith(HTML_PATH);
    });
});
