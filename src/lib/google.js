const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');

const TOKEN_PATH = path.join(config.paths.root, 'data', 'google_tokens.json');

class GoogleManager {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.google.redirectUri
        );
        this.isAuthorized = false;
    }

    async init() {
        try {
            const tokens = await fs.readFile(TOKEN_PATH, 'utf8');
            this.oauth2Client.setCredentials(JSON.parse(tokens));
            this.isAuthorized = true;
            logger.info('Google APIs authorized via cached tokens.');
        } catch (e) {
            logger.warn('No Google tokens found. Authorization required.');
        }
    }

    generateAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/blogger'
            ],
            prompt: 'consent'
        });
    }

    async setTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
        this.isAuthorized = true;
        return tokens;
    }

    async sendEmail(to, subject, body) {
        if (config.shadowMode) return logger.info({ to, subject }, 'SHADOW_MODE: Mocking email');
        if (!this.isAuthorized) throw new Error('Not authorized with Google');
        
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        const message = [
            `To: ${to}`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${subject}`,
            '',
            body
        ].join('\n');

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
        });
    }

    async uploadFile(fileName, filePath, mimeType) {
        if (config.shadowMode) {
            logger.info({ fileName }, 'SHADOW_MODE: Mocking file upload');
            return { id: 'mock_file_id', name: fileName };
        }
        if (!this.isAuthorized) throw new Error('Not authorized with Google');
        
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        const fsStream = require('fs').createReadStream(filePath);

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: mimeType
            },
            media: {
                mimeType: mimeType,
                body: fsStream
            }
        });

        return response.data;
    }

    async postBlog(title, content) {
        if (config.shadowMode) {
            logger.info({ title }, 'SHADOW_MODE: Mocking blog post');
            return { id: 'mock_post_id', title, url: 'https://mock-blog.com/post' };
        }
        if (!this.isAuthorized) throw new Error('Not authorized with Google');
        
        const blogger = google.blogger({ version: 'v3', auth: this.oauth2Client });
        
        // 1. Get the list of blogs to find the primary blog ID
        const blogs = await blogger.blogs.listByUser({ userId: 'self' });
        if (!blogs.data.items || blogs.data.items.length === 0) {
            throw new Error('No blogs found for this account. Please create a blog first.');
        }

        const blogId = blogs.data.items[0].id;
        
        // 2. Create the post
        const post = await blogger.posts.insert({
            blogId: blogId,
            requestBody: {
                title: title,
                content: content
            }
        });

        return post.data;
    }

    async postTemplatedBlog(title, content) {
        if (config.shadowMode) return this.postBlog(title, content);
        if (!this.isAuthorized) throw new Error('Not authorized with Google');
        
        const fs = require('fs').promises;
        // Correct path to asset
        const templatePath = path.join(__dirname, '../../plans/google-workspace/assets/terminal_template.html');
        let template = await fs.readFile(templatePath, 'utf8');
        
        const date = new Date().toISOString().split('T')[0];
        const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
        
        const finalHtml = template
            .replace('{{TITLE}}', title)
            .replace('{{CONTENT}}', content)
            .replace('{{DATE}}', date)
            .replace('{{RANDOM_HEX}}', hex);
            
        return this.postBlog(title, finalHtml);
    }

    async updateBlog(postId, title, content) {
        if (!this.isAuthorized) throw new Error('Not authorized with Google');
        
        const blogger = google.blogger({ version: 'v3', auth: this.oauth2Client });
        const blogs = await blogger.blogs.listByUser({ userId: 'self' });
        const blogId = blogs.data.items[0].id;
        
        const post = await blogger.posts.update({
            blogId: blogId,
            postId: postId,
            requestBody: {
                title: title,
                content: content
            }
        });

        return post.data;
    }
}

module.exports = new GoogleManager();
