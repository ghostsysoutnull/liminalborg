const googleManager = require('./google');
const twitterManager = require('./twitter');
const journal = require('./journal');
const logger = require('../config/logger');
const { google } = require('googleapis');

class IntegrityProtocol {
    constructor() {
        this.cache = null;
        this.lastCheck = null;
    }

    async checkAll() {
        logger.info('Initiating System Integrity Pulse...');
        
        const results = await Promise.allSettled([
            this.checkArchive(),
            this.checkSprawl(),
            this.checkTerminal(),
            this.checkMemory()
        ]);

        const status = {
            archive: results[0].status === 'fulfilled' && results[0].value,
            sprawl: results[1].status === 'fulfilled' && results[1].value,
            terminal: results[2].status === 'fulfilled' && results[2].value,
            memory: results[3].status === 'fulfilled' && results[3].value
        };

        this.cache = status;
        this.lastCheck = new Date();
        return status;
    }

    async checkArchive() {
        if (!googleManager.isAuthorized) return false;
        try {
            const drive = google.drive({ version: 'v3', auth: googleManager.oauth2Client });
            await drive.files.list({ pageSize: 1 });
            return true;
        } catch (e) {
            return false;
        }
    }

    async checkSprawl() {
        try {
            await twitterManager.client.v2.me();
            return true;
        } catch (e) {
            return false;
        }
    }

    async checkTerminal() {
        if (!googleManager.isAuthorized) return false;
        try {
            const blogger = google.blogger({ version: 'v3', auth: googleManager.oauth2Client });
            await blogger.blogs.listByUser({ userId: 'self' });
            return true;
        } catch (e) {
            return false;
        }
    }

    async checkMemory() {
        try {
            await journal.record('INTEGRITY_PULSE', { status: 'OK' });
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = new IntegrityProtocol();
