const { spawn } = require('child_process');
const config = require('../config');
const logger = require('../config/logger');
const { MESSAGES } = require('./constants');
const { escapeHtml, robustParse } = require('./utils');
const { PERSONA_GUIDELINES, BOOKMARK_EXTRACTION_PROMPT } = require('./prompts');

const simulation = require('./simulation');

async function runGemini(message, ctx, options = { approvalMode: 'auto_edit' }) {
    const chatId = ctx.chat.id;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(message);
    
    logger.info({ chatId, message, hasUrl }, 'Running Gemini');

    if (config.shadowMode) {
        return simulation.mockGeminiResponse(message, ctx).catch(e => logger.error(e, 'Error sending mock response'));
    }
    
    let waitMsg;
    try {
        waitMsg = await ctx.reply(MESSAGES.THINKING, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
        logger.error(e, 'Error sending wait message');
    }

    // A mission is defined by having yolo explicitly enabled OR a URL is detected (for research)
    const isMission = options.yolo === true || hasUrl;
    const finalApprovalMode = isMission ? 'yolo' : options.approvalMode;

    const run = (args, overrideOptions = {}) => {
        const settings = global.chatSettings[chatId] || {};
        const extraArgs = [];
        
        // Missions and URL Research use root to access tools/search.
        // Standard text analysis is isolated to uploads.
        const cwd = isMission ? config.paths.root : config.paths.uploads;

        return spawn('gemini', [...args, ...extraArgs], {
            cwd: cwd,
            env: { ...config.rawEnv, NODE_ENV: config.env }
        });
    };

    // Standard prompts strictly forbid tools UNLESS a URL is detected for research
    const strictConstraints = (isMission && !hasUrl) 
        ? "" 
        : "STRICT COMMAND: ONLY use tools if a URL is detected. Do NOT research the general conversation. OUTPUT ONLY THE BORG RESPONSE.";
    
    let immersivePrompt = `${strictConstraints}\n\n${PERSONA_GUIDELINES}\n\nUSER_SIGNAL: "${message}"`;
    
    if (hasUrl) {
        immersivePrompt += `\n\n${BOOKMARK_EXTRACTION_PROMPT}`;
    }

    let gemini = run([
        '--prompt', immersivePrompt,
        '--resume', 'latest',
        '--output-format', 'text',
        '--approval-mode', finalApprovalMode
    ], options);

    // Safety timeout
    const timeoutVal = isMission ? 120000 : 60000;
    const timeout = setTimeout(() => {
        if (global.activeProcesses[chatId]) {
            logger.warn({ chatId }, 'Gemini process timed out, killing...');
            global.activeProcesses[chatId].kill('SIGKILL');
        }
    }, timeoutVal);

    global.activeProcesses[chatId] = gemini;

    let stdout = '';
    let stderr = '';
    let approvalSent = false;
    const MAX_OUTPUT_SIZE = 1024 * 1024; 

    const setupListeners = (proc) => {
        proc.stdout.on('data', async (data) => {
            const output = data.toString();
            if (stdout.length + output.length < MAX_OUTPUT_SIZE) {
                stdout += output;
            }
            if (!approvalSent && output.includes('[y/N]')) {
                approvalSent = true;
                await ctx.reply(MESSAGES.ACTION_REQUIRED, {
                    reply_markup: { inline_keyboard: [[
                        { text: '✅ Approve', callback_data: `approve_${chatId}` },
                        { text: '❌ Reject', callback_data: `reject_${chatId}` }
                    ]] }
                }).catch(() => {});
            }
        });
        proc.stderr.on('data', (data) => stderr += data.toString());
    };

    setupListeners(gemini);

    return new Promise((resolve) => {
        const handleClose = async (code) => {
            clearTimeout(timeout);
            logger.info({ chatId, code }, 'Gemini process closed');
            delete global.activeProcesses[chatId];
            
            if (waitMsg) {
                await ctx.telegram.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
            }

            let bookmarkMetadata = null;
            if (hasUrl) {
                try {
                    bookmarkMetadata = robustParse(stdout, 'uri');
                } catch (e) {
                    logger.debug({ chatId }, 'No metadata extracted in standard run');
                }
            }

            let cleanOutput = stdout
                .replace(/^YOLO mode is enabled.*$/gm, '')
                .replace(/^Loaded cached credentials.*$/gm, '')
                .replace(/^.*\[y\/N\].*$/gm, '')
                .replace(/I will use `.*` to .*/g, '')
                .replace(/I will .* to .*/g, '')
                .replace(/Error executing tool .*/g, '')
                .replace(/Searching .*/g, '')
                .replace(/Attempting .*/g, '')
                .replace(/\{[\s\S]*?"uri":[\s\S]*?\}/g, '') 
                .trim();

            if (cleanOutput) {
                const parts = cleanOutput.match(/[\s\S]{1,4000}/g) || [cleanOutput];
                for (const part of parts) {
                    await ctx.reply(`<pre>${escapeHtml(part)}</pre>`, { parse_mode: 'HTML' }).catch(() => {});
                }
            }

            if (bookmarkMetadata) {
                try {
                    const indexManager = require('./index-manager');
                    await indexManager.processBookmark(bookmarkMetadata, ctx);
                } catch (e) {
                    logger.error(e, 'Failed to process bookmark');
                }
            }

            if (!cleanOutput && code !== 0 && code !== null) {
                await ctx.reply(`⚠️ Gemini error (Code ${code})`).catch(() => {});
            }
            resolve();
        };

        gemini.on('close', handleClose);

        gemini.on('error', (err) => {
            logger.error(err, 'Failed to start Gemini process');
            resolve();
        });
    });
}

module.exports = { runGemini };
