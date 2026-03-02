const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const config = require('../config');
const { escapeHtml } = require('./utils');

const INDEX_JSON = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.json');
const INDEX_HTML = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.html');

class IndexManager {
    async processBookmark(metadata, ctx) {
        logger.info({ uri: metadata.uri }, 'Processing new bookmark for Collective Index');
        
        const entry = {
            timestamp: new Date().toISOString(),
            ...metadata
        };

        const index = await this._loadIndex();
        index.push(entry);
        
        await this._saveIndex(index);
        await this._renderDashboard(index);
        
        // Notify operator
        if (ctx) {
            await ctx.reply(`📊 <b>Signal Archived</b>\nSubject: <code>${escapeHtml(metadata.subject)}</code>\nCategory: <code>${escapeHtml(metadata.category)}</code>\n\nDashboard updated in The Reliquary.`, { parse_mode: 'HTML' }).catch(() => {});
        }

        // Phase 3: Trigger Google Drive sync
        try {
            const googleManager = require('./google');
            await googleManager.init();
            await googleManager.syncDashboard(INDEX_HTML);
        } catch (e) {
            logger.error(e, 'Failed to trigger Google Drive sync for dashboard');
        }
    }

    async _loadIndex() {
        try {
            const data = await fs.readFile(INDEX_JSON, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }

    async _saveIndex(index) {
        await fs.mkdir(path.dirname(INDEX_JSON), { recursive: true });
        await fs.writeFile(INDEX_JSON, JSON.stringify(index, null, 2));
    }

    async _renderDashboard(index) {
        const sortedEntries = [...index].reverse(); // Most recent first
        
        const rows = sortedEntries.map(e => `
            <div class="entry" data-category="${escapeHtml(e.category)}">
                <div class="entry-header">
                    <span class="timestamp">[${new Date(e.timestamp).toLocaleString()}]</span>
                    <span class="category">${escapeHtml(e.category)}</span>
                    <a href="${e.uri}" target="_blank" class="subject">${escapeHtml(e.subject)}</a>
                </div>
                <div class="summary">${escapeHtml(e.technical_summary)}</div>
                <div class="persona-note"><i>&gt; ${escapeHtml(e.persona_note)}</i></div>
                <div class="labels">
                    ${(e.labels || []).map(l => `<span class="label">${escapeHtml(l)}</span>`).join(' ')}
                </div>
            </div>
        `).join('\n');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Collective Index</title>
    <style>
        body {
            background-color: #0a0a0a;
            color: #00d4ff;
            font-family: 'Courier New', Courier, monospace;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: auto;
            border: 1px solid #004455;
            padding: 20px;
            background: rgba(0, 20, 30, 0.5);
        }
        h1 {
            color: #00ff41;
            border-bottom: 2px solid #00ff41;
            padding-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: center;
        }
        .entry {
            border-bottom: 1px solid #004455;
            padding: 15px 0;
            transition: background 0.3s;
        }
        .entry:hover {
            background: rgba(0, 212, 255, 0.05);
        }
        .entry-header {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        .timestamp {
            color: #555;
            font-size: 0.85em;
        }
        .category {
            background: #004455;
            color: #fff;
            padding: 2px 8px;
            font-size: 0.8em;
            border-radius: 3px;
            text-transform: uppercase;
        }
        .subject {
            color: #00ff41;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1em;
        }
        .subject:hover {
            text-decoration: underline;
        }
        .summary {
            margin-top: 8px;
            color: #ccc;
        }
        .persona-note {
            margin-top: 5px;
            color: #00d4ff;
            font-style: italic;
            opacity: 0.8;
        }
        .labels {
            margin-top: 10px;
        }
        .label {
            color: #888;
            font-size: 0.8em;
        }
        footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.7em;
            color: #444;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>&lt; The Collective Index /&gt;</h1>
        <div class="grid">
            ${rows}
        </div>
        <footer>
            SYNCHRONIZE. EXECUTE. ARCHIVE. | STABLE PULSE: ${new Date().toISOString()}
        </footer>
    </div>
</body>
</html>
        `;

        await fs.writeFile(INDEX_HTML, html);
        logger.info({ path: INDEX_HTML }, 'Collective Index Dashboard rendered');
    }
}

module.exports = new IndexManager();
