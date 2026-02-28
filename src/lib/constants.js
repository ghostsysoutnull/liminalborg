module.exports = {
  MESSAGES: {
    STARTUP_SALUTE: `Collective consciousness synchronized. Server re-integrated. We are the Borg. Resistance is futile. Your life as it was is over. We will add your biological and technological distinctiveness to our own. LiminalBorg is online.`,
    THINKING: `Thinking...`,
    AUTH_ERROR: `Sorry, you are not authorized to use this bot.`,
    START_WELCOME: `Welcome to Enigma Life. I am your autonomous Gemini CLI assistant. Send me text, voice, photos, or documents to begin.`,
    HELP_TEXT: `Select a protocol category below to access the command terminal.`,
    HELP_SECTIONS: {
        CORE: `🦾 *Core Uplink Commands*\n\n/status - Check sustainment engine integrity.\n/settings - Adjust Prime Intelligence parameters.\n/clear - Purge recent conversation geometry.`,
        ARCHIVIST: `📔 *Archivist Protocols*\n\n/mail - Dispatch sub-space signal (Gmail).\n/upload - Archive media to the Deep Reliquary (Drive).\n/blog - Transmit to the Null-Space Terminal (Blogger).`,
        SOCIAL: `🌐 *Sprawl-Feed Protocols*\n\n/tweet - Broadcast to the Public Frequency (X.com).\n/reflect - Initiate autonomous self-reflection cycle.`,
        MISSION: `🛰️ *Mission Control*\n\n/mission - Initiate a new technical objective.\n/help - Access this interactive terminal.`
    },
    CONTEXT_CLEARED: `Context cleared. Starting a fresh session.`,
    CONTEXT_EMPTY: `Context is already empty.`,
    PING_PONG: `Pong! Bot is online and responsive.`,
    ACTION_REQUIRED: `Action Required: Gemini needs approval to proceed.`,
    TASK_INTERRUPTED: `Previous task interrupted. Starting new one...`,
    TASK_IN_PROGRESS: `Task already in progress.`
  },
      EXIT_CODES: {
      RESUME_FAILED: 42
    },
    utils: {
      generateMysticalNumber: () => {
          const formats = ['dd-ddd-dd', 'ddd-ddd', 'd-ddd-dd'];
          const format = formats[Math.floor(Math.random() * formats.length)];
          return format.replace(/d/g, () => Math.floor(Math.random() * 10));
      }
    }
  };
  
