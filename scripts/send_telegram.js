const { Telegraf } = require('telegraf');
const config = require('../src/config');
const logger = require('../src/config/logger');

async function main() {
    const text = process.argv[2];
    
    if (!text) {
        console.error('Usage: node send_telegram.js "<message>"');
        process.exit(1);
    }

    if (!config.botToken || !config.authorizedChatId) {
        console.error('Missing configuration: botToken or authorizedChatId');
        process.exit(1);
    }

    const bot = new Telegraf(config.botToken);

    try {
        await bot.telegram.sendMessage(config.authorizedChatId, text, { parse_mode: 'HTML' });
        console.log('Telegram message sent successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        process.exit(1);
    }
}

main();
