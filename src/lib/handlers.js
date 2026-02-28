const { promises: fsPromises, createWriteStream } = require('fs');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');
const { runGemini } = require('./gemini');
const config = require('../config');
const logger = require('../config/logger');
const { escapeHtml } = require('./utils');

async function handleVoice(voice, ctx) {
    logger.info({ chatId: ctx.chat.id }, 'Processing voice message');
    let statusMsg;
    try {
        statusMsg = await ctx.reply('🎤 Transcribing...');

        const fileLink = await ctx.telegram.getFileLink(voice.file_id);
        
        await fsPromises.mkdir(config.paths.uploads, { recursive: true });
        
        const oggPath = path.join(config.paths.uploads, `voice_${voice.file_id}.ogg`);
        const wavPath = path.join(config.paths.uploads, `voice_${voice.file_id}.wav`);

        const response = await axios({ 
            method: 'GET', 
            url: fileLink.href, 
            responseType: 'stream',
            timeout: 30000 // 30 second timeout
        });
        const writer = createWriteStream(oggPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', ['-i', oggPath, '-ar', '16000', '-ac', '1', wavPath, '-y']);
            ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg failed')));
        });

        let transcript = '';
        const MAX_TRANSCRIPT_SIZE = 50000; // 50k chars should be enough for any voice message
        await new Promise((resolve, reject) => {
            const transcribe = spawn('python3', [config.paths.transcribeScript, wavPath]);
            transcribe.stdout.on('data', (data) => {
                const output = data.toString();
                if (transcript.length + output.length < MAX_TRANSCRIPT_SIZE) {
                    transcript += output;
                }
            });
            transcribe.on('close', (code) => code === 0 ? resolve() : reject(new Error('transcription failed')));
        });

        transcript = transcript.trim();
        logger.info({ chatId: ctx.chat.id, transcript }, 'Transcription complete');

        if (statusMsg) await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});

        if (transcript) {
            await ctx.reply(`📝 <b>You said:</b> <i>${escapeHtml(transcript)}</i>`, { parse_mode: 'HTML' });
            await runGemini(transcript, ctx);
        } else {
            await ctx.reply("I couldn't hear anything.");
        }

        try { await fsPromises.unlink(oggPath); } catch (e) {}
        try { await fsPromises.unlink(wavPath); } catch (e) {}
    } catch (e) {
        logger.error(e, 'Error processing voice');
        if (statusMsg) await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
        ctx.reply('Error: ' + e.message);
    }
}

async function handleFile(fileData, ctx) {
    const { file, fileName, type } = fileData;
    logger.info({ chatId: ctx.chat.id, fileName, type }, 'Processing file upload');
    let statusMsg;
    try {
        statusMsg = await ctx.reply(`📥 Downloading ${type}...`);

        const fileLink = await ctx.telegram.getFileLink(file.file_id);
        await fsPromises.mkdir(config.paths.uploads, { recursive: true });
        
        const sanitizedFileName = path.basename(fileName);
        const filePath = path.join(config.paths.uploads, sanitizedFileName);

        const response = await axios({ 
            method: 'GET', 
            url: fileLink.href, 
            responseType: 'stream',
            timeout: 60000 // 60 second timeout for potentially larger files
        });
        const writer = createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        if (statusMsg) await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
        
        const prompt = `I have uploaded a ${type}: ${filePath}. Please analyze it.`;
        await ctx.reply(`✅ <b>${type === 'document' ? 'Document' : 'Photo'} received:</b> <code>${escapeHtml(sanitizedFileName)}</code>\nAnalyzing...`, { parse_mode: 'HTML' });
        
        await runGemini(prompt, ctx);
    } catch (e) {
        logger.error(e, 'Error processing file');
        if (statusMsg) await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});
        ctx.reply('Error: ' + e.message);
    }
}

module.exports = { handleVoice, handleFile };
