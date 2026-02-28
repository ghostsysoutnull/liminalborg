/**
 * Liminal Borg: Sentinel Protocol
 * Scans the codebase for sensitive identifiers defined in .env to prevent leaks.
 */

const fs = require('fs');
const path = require('path');
const config = require('../src/config');

// Values we NEVER want to see in the codebase (harvested from environment)
const FORBIDDEN = [
    { name: 'AUTHORIZED_CHAT_ID', value: config.authorizedChatId },
    { name: 'BOT_EMAIL', value: process.env.BOT_EMAIL },
    { name: 'GOOGLE_CLIENT_SECRET', value: process.env.GOOGLE_CLIENT_SECRET },
    { name: 'X_API_SECRET', value: process.env.X_API_SECRET }
].filter(item => item.value); // Only check if value actually exists

// Directories to scan
const SCAN_DIRS = ['src', 'plans', 'docs', 'scripts'];
const IGNORE_FILES = ['config/index.js', 'sentinel.js', 'AUDITS.md', 'LESSONS_LEARNED.md'];

let issuesFound = 0;

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
        
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') scanDir(fullPath);
            continue;
        }

        if (IGNORE_FILES.some(ignore => relativePath.endsWith(ignore))) continue;
        if (file.endsWith('.tgz') || file.endsWith('.png') || file.endsWith('.jpg')) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        
        for (const pattern of FORBIDDEN) {
            if (content.includes(pattern.value)) {
                console.error(`🚨 SENTINEL: Sensitive data leak found!`);
                console.error(`   File: ${relativePath}`);
                console.error(`   Leak Type: ${pattern.name}`);
                issuesFound++;
            }
        }
    }
}

console.log('🛡️ SENTINEL: Initiating hygiene scan...');
try {
    SCAN_DIRS.forEach(dir => {
        const target = path.join(__dirname, '..', dir);
        if (fs.existsSync(target)) scanDir(target);
    });

    if (issuesFound > 0) {
        console.error(`
❌ SENTINEL: ${issuesFound} security issues detected. Fix before proceeding.`);
        process.exit(1);
    } else {
        console.log('✅ SENTINEL: Matrix is clean. No leaks detected.');
        process.exit(0);
    }
} catch (e) {
    console.error('⚠️ SENTINEL: Scan failed due to error:', e.message);
    process.exit(1);
}
