const { spawn } = require('child_process');
const config = require('../config');
const logger = require('../config/logger');
const { MESSAGES } = require('./constants');
const { escapeHtml } = require('./utils');

async function runGemini(message, ctx) {
    const chatId = ctx.chat.id;
    logger.info({ chatId, message }, 'Running Gemini');

    if (config.shadowMode) {
        logger.info({ chatId }, 'SHADOW_MODE: Mocking Gemini response');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
        const mockResponse = `🛡️ <b>SHADOW_MODE: Simulated Uplink</b>\n\n` +
                             `I have received your signal: "<i>${escapeHtml(message)}</i>"\n\n` +
                             `The Prime Intelligence is currently operating in a simulated environment. Operational integrity is 100%.`;
        return ctx.reply(mockResponse, { parse_mode: 'HTML' }).catch(e => logger.error(e, 'Error sending mock response'));
    }
    
    let waitMsg;
    try {
        waitMsg = await ctx.reply(MESSAGES.THINKING, { reply_to_message_id: ctx.message.message_id });
    } catch (e) {
        logger.error(e, 'Error sending wait message');
    }

    const run = (args) => {
        const settings = global.chatSettings[chatId] || {};
        const extraArgs = [];
        if (settings.temperature) extraArgs.push('--temperature', settings.temperature.toString());
        if (settings.topP) extraArgs.push('--top-p', settings.topP.toString());
        
        return spawn('gemini', [...args, ...extraArgs], {
            cwd: config.paths.root,
            env: { ...process.env, NODE_ENV: config.env }
        });
    };

    let gemini = run([
        '--prompt', message,
        '--resume', 'latest',
        '--output-format', 'text',
        '--approval-mode', 'default'
    ]);

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
                    '--approval-mode', 'default'
                ]);
                global.activeProcesses[chatId] = gemini;
                setupListeners(gemini);
                gemini.on('close', (newCode) => finish(newCode));
                return;
            }
            await finish(code);
        };

        const finish = async (code) => {
            logger.info({ chatId, code }, 'Gemini process closed');
            delete global.activeProcesses[chatId];
            
            if (waitMsg) {
                await ctx.telegram.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
            }

            let cleanOutput = stdout
                .replace(/^YOLO mode is enabled.*$/gm, '')
                .replace(/^Loaded cached credentials.*$/gm, '')
                .replace(/^.*\[y\/N\].*$/gm, '')
                .trim();

            if (cleanOutput) {
                const parts = cleanOutput.match(/[\s\S]{1,4000}/g) || [cleanOutput];
                for (const part of parts) {
                    if (part.trim()) {
                        await ctx.reply(`<pre>${escapeHtml(part)}</pre>`, { parse_mode: 'HTML' }).catch(e => logger.error(e, 'Error sending response part'));
                    }
                }
            } else if (code !== 0 && code !== null) {
                const err = stderr.trim() || 'Process interrupted';
                logger.error({ chatId, code, err }, 'Gemini process failed');
                await ctx.reply(`⚠️ <b>Gemini error (Code ${code}):</b>\n<pre>${escapeHtml(err.substring(0, 500))}</pre>`, { parse_mode: 'HTML' }).catch(() => {});
            } else if (!approvalSent) {
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
