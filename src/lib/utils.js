/**
 * Enigma-Life Utility Core
 * Centralizing robust logic to prevent recurring failure patterns.
 */

const logger = require('../config/logger');

/**
 * Escapes text for Telegram HTML parse_mode.
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Robustly harvests and parses a JSON object from a noisy string.
 * Handles: Leading/trailing text, trailing commas.
 * @param {string} rawString - The string to parse.
 * @param {string} requiredKey - A key that must exist in the JSON block (e.g. 'title').
 */
function robustParse(rawString, requiredKey = '') {
    try {
        // 1. Locate the JSON block
        let startIndex = requiredKey 
            ? rawString.lastIndexOf(`{"${requiredKey}"`) 
            : rawString.indexOf('{');
        
        // Fallback to simple brace if specific key search fails
        if (startIndex === -1) startIndex = rawString.indexOf('{');
        
        const endIndex = rawString.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error('No valid JSON block detected.');
        }

        let jsonStr = rawString.substring(startIndex, endIndex + 1);

        // 2. Clean trailing commas (illegal in standard JSON)
        jsonStr = jsonStr.replace(/,(\s*[\]\}])/g, '$1');

        const obj = JSON.parse(jsonStr);

        // 3. Strict Validation
        if (requiredKey && !(requiredKey in obj)) {
            throw new Error(`Required key "${requiredKey}" missing from harvested object.`);
        }

        return obj;
    } catch (e) {
        logger.error({ rawString, error: e.message }, 'Robust parse failed');
        throw new Error(`Integrity Failure: Could not harvest structured data from Prime Intelligence. (${e.message})`);
    }
}

const fs = require('fs');
const axios = require('axios');
const path = require('path');

/**
 * Robustly downloads a file from a URL to a local path.
 */
async function downloadFile(url, destPath, timeout = 60000) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: timeout
    });

    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports = {
    escapeHtml,
    robustParse,
    downloadFile
};
