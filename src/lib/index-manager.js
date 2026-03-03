const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const config = require('../config');
const { escapeHtml } = require('./utils');

const INDEX_JSON = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.json');
const INDEX_HTML = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.html');

class IndexManager {
    async processBookmark(metadata, ctx) {
        logger.info({ uri: metadata.uri }, 'Processing upgraded bookmark for Collective Index');
        
        const entry = {
            timestamp: new Date().toISOString(),
            ...metadata
        };

        const index = await this._loadIndex();
        index.push(entry);
        
        await this._saveIndex(index);
        await this._renderDashboard(index);
        
        if (ctx) {
            await ctx.reply(`📊 <b>Signal Assimilated</b>\nSubject: <code>${escapeHtml(metadata.subject)}</code>\nCategory: <code>${escapeHtml(metadata.category)}</code>\n\nArchive updated: <a href="https://${config.surge.domain}">The Collective Index</a>`, { parse_mode: 'HTML' }).catch(() => {});
        }

        try {
            const googleManager = require('./google');
            await googleManager.init();
            await googleManager.syncDashboard(INDEX_HTML);
        } catch (e) {
            logger.error(e, 'Failed to trigger Google Drive sync');
        }

        try {
            await this._syncToWeb();
        } catch (e) {
            logger.error(e, 'Failed to trigger web synchronization');
        }
    }

    async _syncToWeb() {
        const { spawn } = require('child_process');
        logger.info('Uplinking to Ghost Node (Surge)...');
        
        const deployScript = path.join(config.paths.scripts, 'deploy_dashboard.js');
        
        return new Promise((resolve, reject) => {
            const deployProc = spawn('node', [deployScript], {
                cwd: config.paths.root,
                env: config.rawEnv
            });

            deployProc.stdout.on('data', (data) => logger.debug(`[Deploy] ${data.toString().trim()}`));
            deployProc.stderr.on('data', (data) => logger.error(`[Deploy Error] ${data.toString().trim()}`));

            deployProc.on('close', (code) => {
                if (code === 0) {
                    logger.info('Ghost Node Uplink successful');
                    resolve();
                } else {
                    logger.error({ code }, 'Ghost Node Uplink failed');
                    reject(new Error(`Deploy script failed with code ${code}`));
                }
            });
        });
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
        const sortedEntries = [...index].reverse();
        
        const categoryColors = {
            'AI/LLM': '#ff00ff',
            'AI/Agents': '#00d4ff',
            'AI/Tools': '#7000ff',
            'Dev/Backend': '#00ff41',
            'Dev/Frontend': '#ffcc00',
            'Ops/Deploy': '#ff3300',
            'Ops/Security': '#0066ff',
            'Retro/Atari': '#ff6600',
            'Intel/Signals': '#999999'
        };

        const rows = sortedEntries.map(e => {
            const color = categoryColors[e.category] || '#555';
            return `
            <div class="entry" data-category="${escapeHtml(e.category)}">
                <div class="entry-header">
                    <span class="timestamp">[${new Date(e.timestamp).toLocaleString()}]</span>
                    <span class="category-badge" style="border-color: ${color}; color: ${color}">${escapeHtml(e.category)}</span>
                    <a href="${e.uri}" target="_blank" class="subject">${escapeHtml(e.subject)}</a>
                </div>
                <div class="technical-summary">${escapeHtml(e.technical_summary)}</div>
                <div class="persona-note"><i>&gt; ${escapeHtml(e.persona_note)}</i></div>
                <div class="labels">
                    ${(e.labels || []).map(l => `<span class="label">${escapeHtml(l)}</span>`).join(' ')}
                </div>
            </div>
            `;
        }).join('\n');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Collective Index | Operator View</title>
    <style>
        body {
            background-color: #050505;
            color: #e0e0e0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 1000px;
            margin: auto;
            border: 1px solid #1a1a1a;
            padding: 30px;
            background: #0a0a0a;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        h1 {
            color: #00ff41;
            font-family: 'Courier New', Courier, monospace;
            border-bottom: 1px solid #333;
            padding-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 4px;
            text-align: center;
            margin-top: 0;
        }
        .entry {
            border-bottom: 1px solid #1a1a1a;
            padding: 25px 0;
        }
        .entry:last-child {
            border-bottom: none;
        }
        .entry-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
        }
        .timestamp {
            color: #444;
            font-size: 0.8em;
            font-family: monospace;
        }
        .category-badge {
            border: 1px solid;
            padding: 2px 10px;
            font-size: 0.7em;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
            border-radius: 2px;
        }
        .subject {
            color: #fff;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.2em;
            transition: color 0.2s;
        }
        .subject:hover {
            color: #00ff41;
        }
        .technical-summary {
            margin-top: 10px;
            color: #bbb;
            font-size: 1em;
            max-width: 800px;
        }
        .persona-note {
            margin-top: 12px;
            color: #00d4ff;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
            opacity: 0.6;
            border-left: 2px solid #00d4ff33;
            padding-left: 10px;
        }
        .labels {
            margin-top: 15px;
        }
        .label {
            color: #555;
            font-size: 0.8em;
            margin-right: 10px;
            font-family: monospace;
        }
        footer {
            margin-top: 50px;
            text-align: center;
            font-size: 0.7em;
            color: #222;
            font-family: monospace;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>&lt; Collective Archives /&gt;</h1>
        <div class="grid">
            ${rows}
        </div>
        <footer>
            SYNCHRONIZE. EXECUTE. ARCHIVE. | PULSE: ${new Date().toISOString()}
        </footer>
    </div>
</body>
</html>
        `;

        await fs.writeFile(INDEX_HTML, html);
        logger.info({ path: INDEX_HTML }, 'Upgraded Collective Index Dashboard rendered');
    }
}

module.exports = new IndexManager();
