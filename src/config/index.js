const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const rootDir = path.join(__dirname, '..', '..');

const config = {
  env: process.env.NODE_ENV || 'development',
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  authorizedChatId: process.env.AUTHORIZED_CHAT_ID,
  shadowMode: process.env.SHADOW_MODE === 'true',
  logLevel: process.env.LOG_LEVEL || 'debug',
  homeDir: process.env.HOME || '',
  twitter: {
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost'
  },
  paths: {
    root: rootDir,
    logs: path.join(rootDir, 'data', 'logs'),
    uploads: path.join(rootDir, 'data', 'uploads'),
    scripts: path.join(rootDir, 'scripts'),
    transcribeScript: path.join(rootDir, 'scripts', 'transcribe.py'),
    chatsDir: path.join(process.env.HOME || '', '.gemini', 'tmp', 'telegram-bot', 'chats')
  },
  // Provide the raw process.env for child processes to inherit, 
  // but accessed only through here.
  rawEnv: process.env
};

// Validation
if (!config.botToken) {
  throw new Error('FATAL: TELEGRAM_BOT_TOKEN is not defined in .env');
}

if (!config.authorizedChatId) {
  console.warn('WARNING: AUTHORIZED_CHAT_ID is not defined. The bot will be open to everyone!');
}

module.exports = config;
