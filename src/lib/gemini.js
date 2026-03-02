const { spawn } = require('child_process');
const config = require('../config');
const logger = require('../config/logger');
const { MESSAGES } = require('./constants');
const { escapeHtml, robustParse } = require('./utils');
const { PERSONA_GUIDELINES, BOOKMARK_EXTRACTION_PROMPT } = require('./prompts');

const simulation = require('./simulation');

async function runGemini(message, ctx, options = { approvalMode: 'auto_edit' }) {
    const chatId = ctx.chat.id;
    
    // Explicitly forbid tools for standard chat to prevent loops
    const strictConstraints = "STRICT COMMAND: DO NOT USE TOOLS. DO NOT SEARCH. DO NOT READ FILES. OUTPUT ONLY THE BORG RESPONSE.";
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(message);
    
    let immersivePrompt = `${strictConstraints}\n\n${PERSONA_GUIDELINES}\n\nUSER_SIGNAL: "${message}"`;
    
    if (hasUrl) {
        immersivePrompt += `\n\n${BOOKMARK_EXTRACTION_PROMPT}`;
    }
    
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

    const run = (args, overrideOptions = {}) => {
        const settings = global.chatSettings[chatId] || {};
        const extraArgs = [];
        
        // Isolate Gemini from the codebase unless it's a mission
        const isCurrentlyMission = overrideOptions.yolo || isMission;
        const cwd = isCurrentlyMission ? config.paths.root : config.paths.uploads;

        return spawn('gemini', [...args, ...extraArgs], {
            cwd: cwd,
            env: { ...config.rawEnv, NODE_ENV: config.env }
        });
    };

    const isMission = options.yolo;
    const finalApprovalMode = isMission ? 'yolo' : options.approvalMode;

    let gemini = run([
        '--prompt', immersivePrompt,
        '--resume', 'latest',
        '--output-format', 'text',
        '--approval-mode', finalApprovalMode
    ], options);

    // Add a 45-second safety timeout to prevent investigation hangs
    const timeout = setTimeout(() => {
        if (global.activeProcesses[chatId]) {
            logger.warn({ chatId }, 'Gemini process timed out, killing...');
            global.activeProcesses[chatId].kill('SIGKILL');
        }
    }, 45000);

    global.activeProcesses[chatId] = gemini;

    let stdout = '';
    let stderr = '';
    let approvalSent = false;
    const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB limit

    const setupListeners = (proc) => {
        proc.stdout.on('data', async (data) => {
            const output = data.toString();
            if (stdout.length + output.length < MAX_OUTPUT_SIZE) {
                stdout += output;
            } else if (!stdout.endsWith('\n...[Output Truncated]')) {
                stdout += '\n...[Output Truncated]';
            }

            if (!approvalSent && output.includes('[y/N]')) {
                approvalSent = true;
                logger.info({ chatId }, 'Tool approval requested');
                try {
                    await ctx.reply(MESSAGES.ACTION_REQUIRED, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Approve', callback_data: `approve_${chatId}` },
                                    { text: '❌ Reject', callback_data: `reject_${chatId}` }
                                ]
                            ]
                        }
                    });
                } catch (e) {
                    logger.error(e, 'Error sending approval keyboard');
                }
            }
        });

        proc.stderr.on('data', (data) => {
            const output = data.toString();
            if (stderr.length + output.length < MAX_OUTPUT_SIZE) {
                stderr += output;
            }
        });
    };

    setupListeners(gemini);

    return new Promise((resolve) => {
        const handleClose = async (code) => {
            if (code === 42 && stdout.includes('Error resuming session')) {
                logger.warn({ chatId }, 'Resume failed, retrying without resume');
                stdout = '';
                stderr = '';
                gemini = run([
                    '--prompt', message,
                    '--output-format', 'text',
                    '--approval-mode', finalApprovalMode
                ]);
                global.activeProcesses[chatId] = gemini;
                setupListeners(gemini);
                gemini.on('close', (newCode) => finish(newCode));
                return;
            }
            await finish(code);
        };

        const finish = async (code) => {
            clearTimeout(timeout);
            logger.info({ chatId, code }, 'Gemini process closed');
            delete global.activeProcesses[chatId];
            
            if (waitMsg) {
                await ctx.telegram.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
            }

            // Extract potential bookmark metadata if a URL was involved
            let bookmarkMetadata = null;
            if (hasUrl) {
                try {
                    bookmarkMetadata = robustParse(stdout, 'uri');
                    logger.info({ chatId, bookmarkMetadata }, 'Bookmark metadata extracted');
                } catch (e) {
                    logger.debug({ chatId, error: e.message }, 'No bookmark metadata found in output');
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
                .replace(/Suggesting tool call: \{[\s\S]*?\}/g, '')
                .replace(/\{[\s\S]*?"tool_calls":[\s\S]*?\}/g, '')
                .replace(/\{[\s\S]*?"uri":[\s\S]*?\}/g, '') // Strip the bookmark JSON
                .trim();

            if (cleanOutput) {
                const parts = cleanOutput.match(/[\s\S]{1,4000}/g) || [cleanOutput];
                for (const part of parts) {
                    if (part.trim()) {
                        await ctx.reply(`<pre>${escapeHtml(part)}</pre>`, { parse_mode: 'HTML' }).catch(e => logger.error(e, 'Error sending response part'));
                    }
                }
            }

            // Phase 2: If we have a bookmark, process it
            if (bookmarkMetadata) {
                try {
                    const indexManager = require('./index-manager');
                    await indexManager.processBookmark(bookmarkMetadata, ctx);
                } catch (e) {
                    logger.error(e, 'Failed to process bookmark');
                }
            }

            if (!cleanOutput && code !== 0 && code !== null) {
                const err = stderr.trim() || 'Process interrupted';
                logger.error({ chatId, code, err }, 'Gemini process failed');
                await ctx.reply(`⚠️ <b>Gemini error (Code ${code}):</b>\n<pre>${escapeHtml(err.substring(0, 500))}</pre>`, { parse_mode: 'HTML' }).catch(() => {});
            } else if (!cleanOutput && !approvalSent && options.approvalMode === 'plan') {
                await ctx.reply('Gemini finished but returned no output.');
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
