const { Telegraf } = require('telegraf');
const config = require('./config');
const logger = require('./config/logger');
const { MESSAGES, utils } = require('./lib/constants');
const authMiddleware = require('./middlewares/auth');
const { registerCommands } = require('./lib/commands');
const { registerEvents } = require('./events');
const { loadSettings } = require('./lib/persistence');
const { loadWhitelist } = require('./lib/whitelist');
const googleManager = require('./lib/google');
const scheduler = require('./lib/scheduler');
const missionManager = require('./lib/mission');
const integrity = require('./lib/integrity');

logger.info('--- SCRIPT START: Bot.js loaded ---');

if (!global.activeProcesses) global.activeProcesses = {};
global.chatSettings = {};
global.whitelist = [];

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
    logger.fatal(err, 'Uncaught Exception. Exiting.');
    process.exit(1);
});

const bot = new Telegraf(config.botToken);
const startTime = new Date();

// Apply Global Middlewares
bot.use(authMiddleware);

// Register Commands & Events
registerCommands(bot, { startTime });
registerEvents(bot);

// Global Framework Error Handler
bot.catch((err, ctx) => {
    logger.error({ err, updateType: ctx.updateType }, 'Telegraf framework error');
});

// Heartbeat
const heartbeat = setInterval(() => {
    logger.info('--- HEARTBEAT: Bot event loop active ---');
}, 30000);

// Integrity Watchdog (Every 6 hours)
setInterval(() => {
    integrity.checkAll().catch(err => logger.error(err, 'Watchdog integrity pulse failed'));
}, 6 * 60 * 60 * 1000);

// Launch Bot
logger.info('Attempting bot launch...');
Promise.all([
    loadSettings(),
    loadWhitelist(),
    missionManager.load(),
    googleManager.init()
]).then(([settings, whitelist, activeMission]) => {
    global.chatSettings = settings;
    global.whitelist = whitelist;
    scheduler.init(bot);
    missionManager.init(bot);
    
    if (activeMission && activeMission.state === 'ACTIVE') {
        logger.info('Resuming active mission after restart.');
        // We could send a notification here: "Uplink restored. System stabilized."
    }
    
    return bot.launch();
})
    .then(() => {
        logger.info('🚀 Bot online and polling for updates.');
        if (config.authorizedChatId) {
            const mysticalNumber = utils.generateMysticalNumber();
            bot.telegram.sendMessage(config.authorizedChatId, 
                `🛡️ *System Update* [${mysticalNumber}]\n\n_${MESSAGES.STARTUP_SALUTE}_`, 
                { parse_mode: 'Markdown' }
            )
                .catch(err => logger.error(err, 'Failed to send startup salute'));
        }
    })
    .catch((err) => {
        logger.fatal(err, '❌ CRITICAL: Bot launch failed');
        process.exit(1);
    });

// Graceful Shutdown
const shutdown = (signal) => {
    logger.info({ signal }, 'Received shutdown signal, stopping bot.');
    clearInterval(heartbeat);
    scheduler.stop();
    bot.stop(signal);
    
    // Cleanup any running gemini processes
    if (global.activeProcesses) {
        for (const chatId in global.activeProcesses) {
            try {
                logger.info({ chatId }, 'Killing lingering process during shutdown');
                global.activeProcesses[chatId].kill('SIGTERM');
            } catch (e) {
                logger.warn(e, 'Failed to kill process during shutdown');
            }
        }
    }
    
    setTimeout(() => {
        logger.info('Forcing exit after timeout');
        process.exit(0);
    }, 5000).unref(); // Give more time for graceful shutdown
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
