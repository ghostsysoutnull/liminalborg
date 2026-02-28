const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');

const historyFile = path.join(config.paths.root, 'data', 'history.log');

class Journal {
    async record(action, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            details
        };

        try {
            await fs.mkdir(path.dirname(historyFile), { recursive: true });
            await fs.appendFile(historyFile, JSON.stringify(entry) + '\n', 'utf8');
            logger.info({ action }, 'Action recorded in memory core');
        } catch (e) {
            logger.error(e, 'Failed to record entry in journal');
        }
    }

    async getRecent(limit = 10) {
        try {
            const data = await fs.readFile(historyFile, 'utf8');
            const lines = data.trim().split('\n');
            return lines.slice(-limit).map(line => JSON.parse(line));
        } catch (e) {
            if (e.code !== 'ENOENT') logger.error(e, 'Failed to read journal');
            return [];
        }
    }
}

module.exports = new Journal();
