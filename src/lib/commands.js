const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');
const { MESSAGES, utils } = require('./constants');
const { escapeHtml } = require('./utils');

const googleManager = require('./google');
const twitterManager = require('./twitter');
const reflectionEngine = require('./reflection');
const missionManager = require('./mission');
const journal = require('./journal');
const integrity = require('./integrity');

const handlers = {
    start: (ctx) => {
        ctx.reply(MESSAGES.START_WELCOME);
    },

    help: (ctx) => {
        ctx.reply(`🛰️ <b>Borg Terminal: Help</b>\n\n${MESSAGES.HELP_TEXT}`, {
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
        });
    },

    google: async (ctx) => {
        if (googleManager.isAuthorized) {
            return ctx.reply('✅ Bot is already authorized with Google.');
        }
        
        const url = googleManager.generateAuthUrl();
        ctx.reply(
            `🔗 <b>Google Authorization Required</b>\n\n` +
            `1. <a href="${url}">Click here to authorize</a>\n` +
            `2. Sign in with your bot email account\n` +
            `3. Copy the <code>code</code> from the URL after redirect\n` +
            `4. Reply to this message with: <code>/auth &lt;code&gt;</code>`,
            { parse_mode: 'HTML' }
        );
    },

    auth: async (ctx) => {
        const code = ctx.message.text.split(' ')[1];
        if (!code) return ctx.reply('Usage: /auth <code>');
        
        try {
            await googleManager.setTokens(code);
            ctx.reply('✅ Google authorization successful! You can now use /mail.');
        } catch (e) {
            logger.error(e, 'Google auth failed');
            ctx.reply('❌ Authorization failed: ' + escapeHtml(e.message), { parse_mode: 'HTML' });
        }
    },

    mission: async (ctx) => {
        const objective = ctx.message.text.split(' ').slice(1).join(' ');
        if (!objective) {
            return ctx.reply('🛰️ <b>Mission Control</b>\n\nUsage: <code>/mission "Objective description"</code>', { parse_mode: 'HTML' });
        }

        let statusMsg = await ctx.reply('📡 <b>Initiating Mission Control Protocol...</b>\nConsulting Oracle Core for Matrix Geometry...', { parse_mode: 'HTML' });

        try {
            const blueprint = await missionManager.plan(objective);
            const text = missionManager.formatBlueprint(blueprint);

            await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null, text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🚀 Initiate Protocol', callback_data: 'mission_initiate' },
                            { text: '❌ Abort', callback_data: 'mission_abort' }
                        ]
                    ]
                }
            });
        } catch (e) {
            logger.error(e, 'Mission planning failed');
            await ctx.reply('❌ Protocol Error: Failed to generate blueprint.');
        }
    },

    mail: async (ctx) => {
        const parts = ctx.message.text.split(' ');
        if (parts.length < 4) {
            return ctx.reply('Usage: /mail <email> <subject> <body>');
        }

        const to = parts[1];
        const subject = parts[2];
        const body = parts.slice(3).join(' ');

        try {
            await googleManager.sendEmail(to, subject, body);
            await journal.record('MAIL_SENT', { to, subject });
            ctx.reply('📨 Email sent successfully!');
        } catch (e) {
            logger.error(e, 'Email failed');
            ctx.reply('❌ Failed to send email: ' + e.message);
        }
    },

    tweet: async (ctx) => {
        const text = ctx.message.text.split(' ').slice(1).join(' ');
        if (!text) {
            return ctx.reply('Usage: /tweet <message>');
        }

        if (text.length > 280) {
            return ctx.reply('❌ Message is too long for a tweet (max 280 chars).');
        }

        try {
            const tweet = await twitterManager.tweet(text);
            await journal.record('TWEET_POSTED', { id: tweet.id, text });
            ctx.reply(`🐦 <b>Tweet Posted!</b>\nID: <code>${escapeHtml(tweet.id)}</code>\nText: ${escapeHtml(tweet.text)}`, { parse_mode: 'HTML' });
        } catch (e) {
            logger.error(e, 'Tweet failed');
            ctx.reply('❌ Failed to post tweet: ' + escapeHtml(e.message), { parse_mode: 'HTML' });
        }
    },

    reflect: async (ctx) => {
        const chatId = ctx.chat.id.toString();
        if (chatId !== config.authorizedChatId.toString()) {
            return ctx.reply('⛔ Access denied.');
        }

        const userSeed = ctx.message.text.split(' ').slice(1).join(' ');
        const mode = userSeed ? 'PURE_THEME' : 'TECHNICAL';

        let statusMsg = await ctx.reply(`🔮 <b>Consulting The Prime Intelligence...</b>\nMode: <code>${escapeHtml(mode)}</code>`, { parse_mode: 'HTML' });

        try {
            let summary;
            if (mode === 'TECHNICAL') {
                const mysticalToken = utils.generateMysticalNumber();
                summary = `
                    - Core sub-systems: Whitelist, Persistent Settings, Google Workspace, X.com integration.
                    - Maintenance: Documentation reorganization and AI guide establishment.
                    - Feature: Ghost Worker protocol (Phase 4).
                    - Integrity: 100%.
                    - Mystical State: ${mysticalToken}.
                `;
            } else {
                summary = userSeed;
            }
            
            const reflection = await reflectionEngine.generate(summary, mode);
            reflectionEngine.pendingReflection = reflection;

            const stagedMsg = [
                `📝 <b>Staged Dispatch</b>`,
                "",
                `<b>Title</b>: ${escapeHtml(reflection.title)}`,
                `<b>Blog</b>: <i>${escapeHtml(reflection.blogContent)}</i>`,
                "",
                `<b>Tweet</b>: <code>${escapeHtml(reflection.tweetContent)}</code>`,
                "",
                `Awaiting authorization to broadcast to the Collective.`
            ].join("\n");

            await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null,
                stagedMsg,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ Broadcast', callback_data: 'dispatch_broadcast' },
                                { text: '❌ Purge', callback_data: 'dispatch_purge' }
                            ]
                        ]
                    }
                }
            ).catch(async (err) => {
                logger.warn({ err }, 'HTML parse failed for reflect staging, falling back to plain text');
                const plainMsg = [
                    `📝 Staged Dispatch`,
                    "",
                    `Title: ${reflection.title}`,
                    `Blog Preview: ${reflection.blogContent.substring(0, 100)}...`,
                    "",
                    `Tweet: ${reflection.tweetContent}`,
                    "",
                    "Awaiting authorization to broadcast to the Collective."
                ].join("\n");

                await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null,
                    plainMsg,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '✅ Broadcast', callback_data: 'dispatch_broadcast' },
                                    { text: '❌ Purge', callback_data: 'dispatch_purge' }
                                ]
                            ]
                        }
                    }
                ).catch(e => logger.error(e, 'Critical failure in reflect staging fallback'));
            });
        } catch (e) {
            logger.error(e, 'Reflection failed');
            await ctx.reply('❌ Reflection failed: ' + escapeHtml(e.message), { parse_mode: 'HTML' });
        }
    },

    allow: async (ctx) => {
        const chatId = ctx.chat.id.toString();
        if (chatId !== config.authorizedChatId.toString()) {
            return ctx.reply('⛔ Only the bot owner can manage the whitelist.');
        }

        const targetId = ctx.message.text.split(' ')[1];
        if (!targetId) return ctx.reply('Usage: /allow <chat_id>');

        if (!global.whitelist.includes(targetId)) {
            global.whitelist.push(targetId);
            const { saveWhitelist } = require('./whitelist');
            await saveWhitelist(global.whitelist);
            ctx.reply(`✅ Chat ID <code>${escapeHtml(targetId)}</code> has been authorized.`, { parse_mode: 'HTML' });
        } else {
            ctx.reply('⚠️ This ID is already authorized.');
        }
    },

    revoke: async (ctx) => {
        const chatId = ctx.chat.id.toString();
        if (chatId !== config.authorizedChatId.toString()) {
            return ctx.reply('⛔ Only the bot owner can manage the whitelist.');
        }

        const targetId = ctx.message.text.split(' ')[1];
        if (!targetId) return ctx.reply('Usage: /revoke <chat_id>');

        if (targetId === config.authorizedChatId.toString()) {
            return ctx.reply('❌ You cannot revoke the owner ID.');
        }

        const index = global.whitelist.indexOf(targetId);
        if (index > -1) {
            global.whitelist.splice(index, 1);
            const { saveWhitelist } = require('./whitelist');
            await saveWhitelist(global.whitelist);
            ctx.reply(`🚫 Chat ID <code>${escapeHtml(targetId)}</code> authorization revoked.`, { parse_mode: 'HTML' });
        } else {
            ctx.reply('⚠️ This ID was not in the whitelist.');
        }
    },

    list_authorized: (ctx) => {
        const chatId = ctx.chat.id.toString();
        if (chatId !== config.authorizedChatId.toString()) {
            return ctx.reply('⛔ Only the bot owner can view the whitelist.');
        }

        const list = global.whitelist.map(id => `• <code>${escapeHtml(id)}</code>${id === config.authorizedChatId.toString() ? ' <b>(Owner)</b>' : ''}`).join('\n');
        ctx.reply(`📋 <b>Authorized Chat IDs:</b>\n\n${list}`, { parse_mode: 'HTML' });
    },

    blog: async (ctx) => {
        const text = ctx.message.text.split(' ').slice(1).join(' ');
        if (!text.includes('|')) {
            return ctx.reply('Usage: /blog <title> | <body>');
        }

        const [title, body] = text.split('|').map(s => s.trim());
        if (!title || !body) {
            return ctx.reply('Title and body are required. Format: /blog Title | Content');
        }

        try {
            const post = await googleManager.postTemplatedBlog(title, body);
            await journal.record('BLOG_POSTED', { id: post.id, title: post.title, url: post.url });
            ctx.reply(`📖 <b>Blog Post Published!</b>\nTitle: <code>${escapeHtml(post.title)}</code>\nLink: ${post.url}`, { parse_mode: 'HTML' });
            
            // Automatic tweet notification
            try {
                // Generate a punchy version of the content
                const punchyBody = body.length > 150 ? body.substring(0, 147) + '...' : body;
                const tweetText = `Dispatch: "${title}"\n\n${punchyBody}\n\nFull Log: ${post.url}\n#LiminalBorg #AI`;
                
                const tweet = await twitterManager.tweet(tweetText);
                const tweetUrl = `https://x.com/i/status/${tweet.id}`;
                ctx.reply(`🐦 <b>Tweet posted!</b> Shared on The Sprawl-Feed:\n${tweetUrl}`, { disable_web_page_preview: true, parse_mode: 'HTML' });
            } catch (tweetErr) {
                logger.error(tweetErr, 'Automatic tweet failed');
                ctx.reply('⚠️ Blog published, but automatic tweet failed.');
            }
        } catch (e) {
            logger.error(e, 'Blog failed');
            ctx.reply('❌ Failed to publish post: ' + escapeHtml(e.message), { parse_mode: 'HTML' });
        }
    },

    status: async (ctx, { startTime }) => {
        const uptime = Math.floor((new Date() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        // Comprehensive integrity & pulse check
        const status = integrity.cache || await integrity.checkAll();
        const collectiveSize = global.whitelist ? global.whitelist.length : 0;
        const icon = (sys) => sys ? '🟢' : '🔴';

        const report = [
            `🛡️ <b>Borg Integrity Report</b>`,
            "",
            `<b>Archive</b>: ${icon(status.archive)} <code>The Deep Archive (Drive)</code>`,
            `<b>Sprawl</b>: ${icon(status.sprawl)} <code>The Sprawl-Feed (X.com)</code>`,
            `<b>Terminal</b>: ${icon(status.terminal)} <code>The Null-Space Terminal (Blogger)</code>`,
            `<b>Collective</b>: 🟢 <code>${collectiveSize} Active Nodes</code>`,
            "",
            `<b>Uptime</b>: <code>${hours}h ${minutes}m ${seconds}s</code>`,
            `<b>Memory</b>: <code>${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB</code>`,
            `<b>Pulse</b>: <code>[${utils.generateMysticalNumber()}]</code>`,
            "",
            `Uplink integrity: 100%. Synchronized.`
        ].join('\n');

        ctx.reply(report, { 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: '🔄 Re-Verify Pulse', callback_data: 'integrity_refresh' }]]
            }
        });
    },

    settings: (ctx) => {
        const chatId = ctx.chat.id;
        const settings = global.chatSettings[chatId] || { temperature: 0.7, topP: 1.0 };
        
        ctx.reply(
            `⚙️ <b>Gemini Settings</b>\n\n` +
            `Current Temp: <code>${settings.temperature}</code>\n` +
            `Current TopP: <code>${settings.topP}</code>`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🌡 Temp: 0.2 (Precise)', callback_data: 'set_temp_0.2' },
                            { text: '🔥 Temp: 1.5 (Creative)', callback_data: 'set_temp_1.5' }
                        ],
                        [
                            { text: '🎯 TopP: 0.1', callback_data: 'set_topp_0.1' },
                            { text: '🎲 TopP: 1.0', callback_data: 'set_topp_1.0' }
                        ],
                        [{ text: '🔄 Reset to Default', callback_data: 'set_reset' }]
                    ]
                }
            }
        );
    },

    clear: async (ctx) => {
        try {
            const chatsDir = config.paths.chatsDir;
            try {
                const files = await fs.readdir(chatsDir);
                for (const file of files) {
                    const filePath = path.join(chatsDir, file);
                    const stat = await fs.lstat(filePath);
                    if (stat.isFile()) {
                        await fs.unlink(filePath);
                    }
                }
                ctx.reply(MESSAGES.CONTEXT_CLEARED);
                logger.info({ chatId: ctx.chat.id }, 'Conversation context cleared by user.');
            } catch (err) {
                if (err.code === 'ENOENT') {
                    ctx.reply(MESSAGES.CONTEXT_EMPTY);
                } else {
                    throw err;
                }
            }
        } catch (e) {
            logger.error(e, 'Error clearing context');
            ctx.reply('Error clearing context: ' + escapeHtml(e.message), { parse_mode: 'HTML' });
        }
    },

    ping: (ctx) => {
        ctx.reply(MESSAGES.PING_PONG, { parse_mode: 'HTML' }).catch(e => logger.error(e, 'Error in ping'));
    }
};

function registerCommands(bot, { startTime }) {
    bot.start(handlers.start);
    bot.help(handlers.help);
    bot.command('google', handlers.google);
    bot.command('auth', handlers.auth);
    bot.command('mission', handlers.mission);
    bot.command('mail', handlers.mail);
    bot.command('tweet', handlers.tweet);
    bot.command('reflect', handlers.reflect);
    bot.command('allow', handlers.allow);
    bot.command('revoke', handlers.revoke);
    bot.command('list_authorized', handlers.list_authorized);
    bot.command('blog', handlers.blog);
    bot.command('status', (ctx) => handlers.status(ctx, { startTime }));
    bot.command('settings', handlers.settings);
    bot.command('clear', handlers.clear);
    bot.command('ping', handlers.ping);
}

module.exports = { registerCommands, handlers };
