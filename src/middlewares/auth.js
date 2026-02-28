const config = require('../config');
const logger = require('../config/logger');
const { MESSAGES } = require('../lib/constants');

const authMiddleware = async (ctx, next) => {
  const chatId = ctx.chat?.id;
  
  if (!chatId) {
    return next(); // Not a chat event, let it pass or handle elsewhere
  }

  if (!config.authorizedChatId) {
    logger.error('CRITICAL: AUTHORIZED_CHAT_ID is not configured. Denying all requests for safety.');
    try {
      await ctx.reply('⛔ System configuration error. Access denied.');
    } catch (e) {
      logger.error(e, 'Failed to send auth error message.');
    }
    return;
  }

  // Check against dynamic whitelist
  const isAuthorized = global.whitelist && global.whitelist.includes(chatId.toString());

  if (!isAuthorized) {
    logger.warn({ chatId }, `Unauthorized access attempt.`);
    try {
      await ctx.reply(MESSAGES.AUTH_ERROR);
    } catch (e) {
      logger.error(e, 'Failed to send unauthorized message.');
    }
    return; // Stop the chain
  }

  return next(); // Authorized, proceed to the next middleware or command
};

module.exports = authMiddleware;
