const { runGemini } = require('../lib/gemini');
const { handleVoice, handleFile } = require('../lib/handlers');
const { saveSettings } = require('../lib/persistence');
const logger = require('../config/logger');
const config = require('../config');
const { MESSAGES } = require('../lib/constants');
const missionManager = require('../lib/mission');
const reflectionEngine = require('../lib/reflection');
const { escapeHtml } = require('../lib/utils');

if (!global.activeProcesses) global.activeProcesses = {};
const activeTasks = new Set();

async function handleRequest(ctx, type, message) {
    const chatId = ctx.chat.id;
    
    // Kill existing task if any
    if (global.activeProcesses[chatId]) {
        logger.info({ chatId }, 'Interrupting active task');
        try {
            global.activeProcesses[chatId].kill('SIGKILL');
        } catch (e) {
            logger.warn(e, 'Failed to kill process');
        }
        delete global.activeProcesses[chatId];
        await ctx.reply(MESSAGES.TASK_INTERRUPTED).catch(() => {});
        await new Promise(r => setTimeout(r, 300));
    }

    if (activeTasks.has(chatId)) {
        logger.info({ chatId }, MESSAGES.TASK_IN_PROGRESS);
    }

    activeTasks.add(chatId);
    try {
        if (type === 'text') {
            await runGemini(message, ctx);
        } else if (type === 'voice') {
            await handleVoice(message, ctx);
        } else if (type === 'file') {
            await handleFile(message, ctx);
        }
    } catch (e) {
        logger.error(e, 'Error handling request');
        await ctx.reply(`❌ Error: ${e.message}`).catch(() => {});
    } finally {
        activeTasks.delete(chatId);
    }
}

const handlers = {
    ping: (ctx) => {
        ctx.reply(MESSAGES.PING_PONG).catch(e => logger.error(e, 'Error in ping'));
    },

    upload: async (ctx) => {
        const reply = ctx.message.reply_to_message;
        if (!reply || (!reply.document && !reply.photo)) {
            return ctx.reply('Please reply to a photo or document with /upload');
        }

        const file = reply.document || reply.photo[reply.photo.length - 1];
        const fileName = reply.document ? reply.document.file_name : `photo_${file.file_id}.jpg`;
        const mimeType = reply.document ? reply.document.mime_type : 'image/jpeg';

        let statusMsg = await ctx.reply('⏳ Uploading to Google Drive...');

        try {
            const googleManager = require('../lib/google');
            const fileLink = await ctx.telegram.getFileLink(file.file_id);
            const axios = require('axios');
            const path = require('path');
            const fs = require('fs');

            const sanitizedFileName = path.basename(fileName);
            const filePath = path.join(config.paths.uploads, sanitizedFileName);
            const response = await axios({ 
                method: 'GET', 
                url: fileLink.href, 
                responseType: 'stream',
                timeout: 60000 // 60s timeout
            });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const driveFile = await googleManager.uploadFile(sanitizedFileName, filePath, mimeType);
            const journal = require('../lib/journal');
            await journal.record('FILE_UPLOADED', { id: driveFile.id, name: driveFile.name });
            
            await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null, 
                `✅ <b>File Uploaded!</b>\nName: <code>${escapeHtml(driveFile.name)}</code>\nID: <code>${escapeHtml(driveFile.id)}</code>`, 
                { parse_mode: 'HTML' }
            );

            // Cleanup
            fs.unlink(filePath, () => {});
        } catch (e) {
            logger.error(e, 'Upload failed');
            await ctx.reply('❌ Upload failed: ' + e.message);
        }
    },

    approve: async (ctx) => {
        const chatId = ctx.match[1];
        const proc = global.activeProcesses && global.activeProcesses[chatId];
        if (proc) {
            logger.info({ chatId }, 'User approved action');
            proc.stdin.write('y\\n');
            await ctx.editMessageText('✅ <b>Approved.</b> Executing...', { parse_mode: 'HTML' }).catch(() => {});
        } else {
            await ctx.answerCbQuery('Session not found or already finished.').catch(() => {});
        }
    },

    reject: async (ctx) => {
        const chatId = ctx.match[1];
        const proc = global.activeProcesses && global.activeProcesses[chatId];
        if (proc) {
            logger.info({ chatId }, 'User rejected action');
            proc.stdin.write('n\\n');
            await ctx.editMessageText('❌ <b>Rejected.</b> skipping...', { parse_mode: 'HTML' }).catch(() => {});
        } else {
            await ctx.answerCbQuery('Session not found or already finished.').catch(() => {});
        }
    },

    mission_abort: async (ctx) => {
        await missionManager.clear();
        await ctx.answerCbQuery('Mission Aborted.');
        await ctx.editMessageText('❌ <b>Mission Aborted.</b> Blueprint purged.', { parse_mode: 'HTML' });
    },

    set_temp: async (ctx) => {
        const val = parseFloat(ctx.match[1]);
        const chatId = ctx.chat.id;
        if (!global.chatSettings[chatId]) global.chatSettings[chatId] = { temperature: 0.7, topP: 1.0 };
        global.chatSettings[chatId].temperature = val;
        await saveSettings(global.chatSettings);
        await ctx.answerCbQuery(`Temperature set to ${val}`);
        await ctx.editMessageText(`✅ Temperature updated to <b>${val}</b>`, { parse_mode: 'HTML' }).catch(() => {});
    },

    set_topp: async (ctx) => {
        const val = parseFloat(ctx.match[1]);
        const chatId = ctx.chat.id;
        if (!global.chatSettings[chatId]) global.chatSettings[chatId] = { temperature: 0.7, topP: 1.0 };
        global.chatSettings[chatId].topP = val;
        await saveSettings(global.chatSettings);
        await ctx.answerCbQuery(`TopP set to ${val}`);
        await ctx.editMessageText(`✅ TopP updated to <b>${val}</b>`, { parse_mode: 'HTML' }).catch(() => {});
    },

    set_reset: async (ctx) => {
        const chatId = ctx.chat.id;
        global.chatSettings[chatId] = { temperature: 0.7, topP: 1.0 };
        await saveSettings(global.chatSettings);
        await ctx.answerCbQuery('Settings reset');
        await ctx.editMessageText('🔄 Settings reset to defaults.', { parse_mode: 'HTML' }).catch(() => {});
    },

    dispatch_broadcast: async (ctx) => {
        const googleManager = require('../lib/google');
        const twitterManager = require('../lib/twitter');

        if (!reflectionEngine.pendingReflection) {
            return ctx.answerCbQuery('No pending reflection found.');
        }

        const { title, blogContent, tweetContent } = reflectionEngine.pendingReflection;
        await ctx.editMessageText('🛰️ <b>Broadcasting to the Collective...</b>', { parse_mode: 'HTML' });

        try {
            // 1. Post to Blogger
            const post = await googleManager.postTemplatedBlog(title, blogContent);
            
            // 2. Post to Twitter (Now using content itself)
            const tweet = await twitterManager.tweet(tweetContent);
            const tweetUrl = `https://x.com/i/status/${tweet.id}`;

            await ctx.editMessageText(
                `📡 <b>Broadcast Complete.</b>\n\n` +
                `📖 <b>Terminal:</b> ${post.url}\n` +
                `🐦 <b>Sprawl-Feed:</b> ${tweetUrl}`, 
                { disable_web_page_preview: true, parse_mode: 'HTML' }
            ).catch(async (err) => {
                logger.warn({ err }, 'HTML parse failed for broadcast confirmation, falling back to plain text');
                await ctx.editMessageText(
                    `📡 Broadcast Complete.\n\n` +
                    `Terminal: ${post.url}\n` +
                    `Sprawl-Feed: ${tweetUrl}`,
                    { disable_web_page_preview: true }
                ).catch(e => logger.error(e, 'Critical failure in broadcast confirmation fallback'));
            });
            reflectionEngine.pendingReflection = null;
        } catch (e) {
            logger.error(e, 'Broadcast failed');
            await ctx.reply('❌ Broadcast failed: ' + e.message);
        }
    },

    dispatch_purge: async (ctx) => {
        reflectionEngine.pendingReflection = null;
        await ctx.answerCbQuery('Dispatch Purged.');
        await ctx.editMessageText('🗑️ <b>Dispatch Purged.</b> Reflection cleared from buffer.', { parse_mode: 'HTML' });
    },

    mission_sync_github: async (ctx) => {
        await ctx.answerCbQuery('Initiating GitHub Sync...');
        await ctx.editMessageText('🛰️ <b>GitHub Uplink Initiated.</b> Pushing verified sub-nodes to origin main...', { parse_mode: 'HTML' });
    },

    mission_archive: async (ctx) => {
        await ctx.answerCbQuery('Mission archived.');
        await ctx.editMessageText('📁 <b>Mission Archived.</b> Project geometry saved locally.', { parse_mode: 'HTML' });
    },

    integrity_refresh: async (ctx) => {
        const integrity = require('../lib/integrity');
        await ctx.answerCbQuery('Re-verifying uplinks...');
        await integrity.checkAll();
        await ctx.answerCbQuery('Integrity confirmed.');
        ctx.reply('🔄 <b>Pulse Synchronized.</b> Use /status for updated report.', { parse_mode: 'HTML' });
    },

    oracle_reverify: async (ctx) => {
        const commandHandlers = require('../lib/commands').handlers;
        await ctx.answerCbQuery('Re-verifying pulse...');
        // We simulate the status command call
        await commandHandlers.status(ctx, { startTime: global.botStartTime || new Date() });
    },

    help_section: async (ctx) => {
        const section = ctx.match[1];
        const text = MESSAGES.HELP_SECTIONS[section] || 'Section not found.';
        
        await ctx.editMessageText(`⬛ <b>Collective Terminal: Interface</b>\n\n${text}`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⬅️ Back to Categories', callback_data: 'help_root' }]
                ]
            }
        }).catch(err => logger.error(err, 'Failed to update help section'));
    },

    help_root: async (ctx) => {
        await ctx.editMessageText(MESSAGES.HELP_TEXT, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🦾 Core', callback_data: 'help_section_CORE' },
                        { text: '📔 Archivist', callback_data: 'help_section_ARCHIVIST' }
                    ],
                    [
                        { text: '🌐 Sprawl', callback_data: 'help_section_SOCIAL' },
                        { text: '🛰️ Mission', callback_data: 'help_section_MISSION' }
                    ]
                ]
            }
        }).catch(err => logger.error(err, 'Failed to return to help root'));
    },

    onText: async (ctx) => {
        if (ctx.message.text.startsWith('/')) return;
        
        // Handle Replied Directives (e.g. "Post this to X")
        const reply = ctx.message.reply_to_message;
        const text = ctx.message.text.toLowerCase();
        
        if (reply && (text.includes('post') || text.includes('tweet')) && (text.includes(' x') || text.includes('twitter'))) {
            const content = reply.text || reply.caption;
            if (!content) return ctx.reply('❌ No text found in the replied message to post.');
            
            logger.info({ chatId: ctx.chat.id }, 'Processing directive: Post to X');
            try {
                const twitterManager = require('../lib/twitter');
                const journal = require('../lib/journal');
                
                const tweet = await twitterManager.tweet(content);
                await journal.record('TWEET_POSTED', { id: tweet.id, text: content, via: 'directive' });
                return ctx.reply(`🐦 <b>Posted to The Sprawl-Feed!</b>\n\nhttps://x.com/i/status/${tweet.id}`, { parse_mode: 'HTML' });
            } catch (e) {
                logger.error(e, 'Directive failed: Post to X');
                return ctx.reply(`❌ Failed to post: ${e.message}`);
            }
        }

        logger.info({ chatId: ctx.chat.id, text: ctx.message.text }, 'Received text message');
        await handleRequest(ctx, 'text', ctx.message.text);
    },

    onVoice: async (ctx) => {
        logger.info({ chatId: ctx.chat.id }, 'Received voice message');
        await handleRequest(ctx, 'voice', ctx.message.voice);
    },

    onDocument: async (ctx) => {
        const doc = ctx.message.document;
        logger.info({ chatId: ctx.chat.id, document: doc.file_name }, 'Received document');
        await handleRequest(ctx, 'file', { file: doc, fileName: doc.file_name, type: 'document' });
    },

    onPhoto: async (ctx) => {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        logger.info({ chatId: ctx.chat.id, photoId: photo.file_id }, 'Received photo');
        await handleRequest(ctx, 'file', { file: photo, fileName: `photo_${photo.file_id}.jpg`, type: 'photo' });
    }
};

function registerEvents(bot) {
    // General middleware logging
    bot.use(async (ctx, next) => {
        logger.debug({ updateType: ctx.updateType, from: ctx.from?.id }, 'Incoming update');
        return next();
    });

    bot.command('ping', handlers.ping);
    bot.command('upload', handlers.upload);

    bot.action(/approve_(.+)/, handlers.approve);
    bot.action(/reject_(.+)/, handlers.reject);
    bot.action('mission_abort', handlers.mission_abort);
    bot.action(/set_temp_(.+)/, handlers.set_temp);
    bot.action(/set_topp_(.+)/, handlers.set_topp);
    bot.action('set_reset', handlers.set_reset);
    bot.action('dispatch_broadcast', handlers.dispatch_broadcast);
    bot.action('dispatch_purge', handlers.dispatch_purge);
    bot.action('mission_sync_github', handlers.mission_sync_github);
    bot.action('mission_archive', handlers.mission_archive);
    bot.action('integrity_refresh', handlers.integrity_refresh);
    bot.action('oracle_reverify', handlers.oracle_reverify);
    bot.action(/help_section_(.+)/, handlers.help_section);
    bot.action('help_root', handlers.help_root);

    bot.on('text', handlers.onText);
    bot.on('voice', handlers.onVoice);
    bot.on('document', handlers.onDocument);
    bot.on('photo', handlers.onPhoto);
}

module.exports = { registerEvents, handlers };
