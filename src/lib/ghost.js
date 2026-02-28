const { spawn } = require('child_process');
const path = require('path');
const config = require('../config');
const logger = require('../config/logger');
const missionManager = require('./mission');

class GhostWorker {
    constructor() {
        this.isWorking = false;
    }

    async executeNode(nodeId, command, args = []) {
        if (this.isWorking) return;
        this.isWorking = true;

        logger.info({ nodeId, command }, 'Ghost Worker initiating node execution');

        return new Promise((resolve, reject) => {
            const proc = spawn(command, args, {
                cwd: config.paths.root,
                env: process.env
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => stdout += data.toString());
            proc.stderr.on('data', (data) => stderr += data.toString());

            proc.on('close', async (code) => {
                this.isWorking = false;
                if (code === 0) {
                    await missionManager.reportTelemetry(nodeId, 'EXECUTION_SUCCESS', `Command finished: ${command}`);
                    resolve(stdout);
                } else {
                    await missionManager.reportTelemetry(nodeId, 'EXECUTION_FAILURE', `Error: ${stderr}`, 'ERROR');
                    reject(new Error(stderr));
                }
            });
        });
    }

    async deploy() {
        logger.info('Ghost Worker initiating autonomous deployment...');
        // In a real PM2 environment, we trigger a restart of ourselves
        spawn('npx', ['pm2', 'restart', 'telegram-bot'], {
            detached: true,
            stdio: 'ignore'
        }).unref();
    }
}

module.exports = new GhostWorker();
