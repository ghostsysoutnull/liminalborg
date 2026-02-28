const cron = require('node-cron');
const config = require('../config');
const logger = require('../config/logger');

const CARE_PROTOCOLS = [
    "⚠️ *Care Protocol:* Practice your arm exercises now.",
    "💧 *Biological Maintenance:* Hydration levels low. Consume water.",
    "🧘 *Structural Integrity:* Postural adjustment required. Stretch.",
    "👁️ *Optical Reset:* Look away from the screen for 60 seconds.",
    "🦾 *Physical Sync:* Perform range-of-motion drills."
];

class Scheduler {
    constructor() {
        this.tasks = [];
    }

    init(bot) {
        logger.info({ fileName: 'scheduler.js' }, 'Initializing Operator Care Loop...');

        // Schedule: Every hour, minute 0, between 09:00 and 18:00
        // '0 9-18 * * *' -> Minute 0, Hour 9 through 18, Every day
        const task = cron.schedule('0 9-18 * * *', async () => {
            const chatId = config.authorizedChatId;
            if (!chatId) return;

            const message = CARE_PROTOCOLS[Math.floor(Math.random() * CARE_PROTOCOLS.length)];
            
            logger.info({ chatId, fileName: 'scheduler.js', action: 'care_reminder' }, 'Sending scheduled care reminder');
            
            try {
                await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            } catch (e) {
                logger.error({ err: e, chatId, fileName: 'scheduler.js' }, 'Failed to send scheduled reminder');
            }
        });

        this.tasks.push(task);
        logger.info({ fileName: 'scheduler.js' }, 'Operator Care Loop active (09:00 - 18:00 hourly).');
    }

    stop() {
        logger.info({ fileName: 'scheduler.js' }, 'Stopping all scheduled tasks.');
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
    }
}

module.exports = new Scheduler();
