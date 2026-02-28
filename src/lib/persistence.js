const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');

const settingsFile = path.join(config.paths.root, 'data', 'settings.json');

async function loadSettings() {
    try {
        const data = await fs.readFile(settingsFile, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            logger.error(e, 'Error loading settings file');
        }
        return {};
    }
}

async function saveSettings(settings) {
    try {
        const data = JSON.stringify(settings, null, 2);
        await fs.mkdir(path.dirname(settingsFile), { recursive: true });
        await fs.writeFile(settingsFile, data, 'utf8');
    } catch (e) {
        logger.error(e, 'Error saving settings file');
    }
}

module.exports = { loadSettings, saveSettings };
