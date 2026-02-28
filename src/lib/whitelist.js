const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');

const whitelistFile = path.join(config.paths.root, 'data', 'whitelist.json');

async function loadWhitelist() {
    try {
        const data = await fs.readFile(whitelistFile, 'utf8');
        let list = JSON.parse(data);
        
        // Ensure the owner from .env is always there
        if (config.authorizedChatId && !list.includes(config.authorizedChatId.toString())) {
            list.push(config.authorizedChatId.toString());
            await saveWhitelist(list);
        }
        return list;
    } catch (e) {
        if (e.code !== 'ENOENT') {
            logger.error(e, 'Error loading whitelist file');
        }
        // Bootstrap with owner if file missing
        const initial = config.authorizedChatId ? [config.authorizedChatId.toString()] : [];
        if (initial.length > 0) await saveWhitelist(initial);
        return initial;
    }
}

async function saveWhitelist(list) {
    try {
        const data = JSON.stringify(list, null, 2);
        await fs.mkdir(path.dirname(whitelistFile), { recursive: true });
        await fs.writeFile(whitelistFile, data, 'utf8');
    } catch (e) {
        logger.error(e, 'Error saving whitelist file');
    }
}

module.exports = { loadWhitelist, saveWhitelist };
