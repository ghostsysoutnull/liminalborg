const pino = require('pino');
const path = require('path');
const config = require('./index');

const logFile = path.join(config.paths.logs, 'bot.log');

// Setup file transport
const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: logFile, mkdir: true }
});

// Setup console transport with pretty printing for development
const consoleTransport = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true, ignore: 'pid,hostname' }
});

// Determine transports based on environment
let transports;
if (config.env === 'production') {
  transports = fileTransport;
} else {
  // Use pino.multistream to log to both file and console in development
  transports = pino.multistream([
    { level: 'info', stream: fileTransport },
    { level: 'info', stream: consoleTransport }
  ]);
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  timestamp: pino.stdTimeFunctions.isoTime
}, transports);

module.exports = logger;
