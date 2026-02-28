const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

const MISSION_FILE = path.join(__dirname, '../../data/active_mission.json');

class MissionManager {
    constructor() {
        this.activeMission = null;
        this.bot = null;
    }

    async save() {
        if (!this.activeMission) return;
        try {
            await fs.writeFile(MISSION_FILE, JSON.stringify(this.activeMission, null, 2));
        } catch (e) {
            logger.error(e, 'Failed to save mission state');
        }
    }

    async load() {
        try {
            const data = await fs.readFile(MISSION_FILE, 'utf8');
            this.activeMission = JSON.parse(data);
            logger.info('Active mission recovered from persistence.');
            return this.activeMission;
        } catch (e) {
            return null;
        }
    }

    async clear() {
        this.activeMission = null;
        try {
            await fs.unlink(MISSION_FILE);
        } catch (e) {}
    }

    init(bot) {
        this.bot = bot;
    }

    async reportTelemetry(nodeId, action, logic, integrity = '100%') {
        if (!this.activeMission || !this.bot) return;
        
        const config = require('../config');
        const chatId = config.authorizedChatId;
        if (!chatId) return;

        const node = this.activeMission.blueprint.nodes.find(n => n.id === nodeId);
        if (node) node.status = 'COMPLETED';

        await this.save();

        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const telemetry = `🛰️ <b>Telemetry Burst [Node-${nodeId}]</b>\n\n` +
                          `<b>Action</b>: ${escapeHtml(action)}\n` +
                          `<b>Logic</b>: <i>${escapeHtml(logic)}</i>\n` +
                          `<b>Integrity</b>: ${escapeHtml(integrity)}\n\n` +
                          `Uplink stable. Next sub-node initiating...`;

        // Throttling: Wait 500ms before sending to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

        await this.bot.telegram.sendMessage(chatId, telemetry, { parse_mode: 'HTML' })
            .catch(e => logger.error(e, 'Telemetry burst failed'));
    }

    async reportFinalStatus() {
        if (!this.activeMission || !this.bot) return;
        
        const config = require('../config');
        const chatId = config.authorizedChatId;
        if (!chatId) return;

        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const report = `🏁 <b>Mission Accomplished</b>\n\n` +
                       `<b>ID</b>: ${this.activeMission.blueprint.id}\n` +
                       `<b>Objective</b>: <i>${escapeHtml(this.activeMission.blueprint.objective)}</i>\n\n` +
                       `All sub-nodes verified. Architectural integrity confirmed. Sync with GitHub Uplink?`;

        await this.bot.telegram.sendMessage(chatId, report, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Sync GitHub Uplink', callback_data: 'mission_sync_github' }],
                    [{ text: '📁 Archive Locally', callback_data: 'mission_archive' }]
                ]
            }
        }).catch(e => logger.error(e, 'Final report failed'));
        
        await this.clear();
    }

    async plan(objective) {
        logger.info({ objective }, 'Planning new mission');
        
        let blueprint;
        
        if (objective.startsWith('REFLECT:')) {
            const parts = objective.split(':');
            const mode = parts[1];
            const summary = parts.slice(2).join(':');
            blueprint = {
                id: Date.now().toString(16),
                objective: objective,
                type: 'REFLECTION',
                params: { mode, summary },
                nodes: [
                    { id: 1, task: "Prime Intelligence Consultation", status: "STAGED", command: "node", args: ["scripts/generate_reflection.js", summary, mode] },
                    { id: 2, task: "Staging Area Preparation", status: "STAGED" }
                ]
            };
        } else {
            blueprint = {
                id: Date.now().toString(16),
                objective: objective,
                type: 'TECHNICAL',
                nodes: [
                    { id: 1, task: "Environment Preparation", status: "STAGED" },
                    { id: 2, task: "Core Logic Implementation", status: "STAGED" },
                    { id: 3, task: "Verification & Audit", status: "STAGED" }
                ]
            };
        }

        this.activeMission = {
            state: 'STAGING',
            blueprint: blueprint
        };

        await this.save();
        return blueprint;
    }

    async start() {
        if (!this.activeMission) return;
        this.activeMission.state = 'ACTIVE';
        await this.save();

        const ghostWorker = require('./ghost');
        const reflectionEngine = require('./reflection');

        for (const node of this.activeMission.blueprint.nodes) {
            if (node.status === 'COMPLETED') continue;

            if (node.command) {
                try {
                    const result = await ghostWorker.executeNode(node.id, node.command, node.args);
                    
                    if (this.activeMission && this.activeMission.blueprint.type === 'REFLECTION' && node.id === 1) {
                        const startIndex = result.lastIndexOf('{"title"');
                        const endIndex = result.lastIndexOf('}');
                        
                        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
                            throw new Error('No valid reflection JSON found in output');
                        }
                        
                        const jsonStr = result.substring(startIndex, endIndex + 1);
                        reflectionEngine.pendingReflection = JSON.parse(jsonStr);
                    }
                } catch (e) {
                    logger.error(e, `Mission failed at node ${node.id}`);
                    throw e;
                }
            } else {
                await this.reportTelemetry(node.id, 'INTERNAL_SYNC', node.task);
            }
        }

        await this.reportFinalStatus();
    }

    formatBlueprint(blueprint) {
        const nodes = blueprint.nodes.map(n => 
            `[${n.status === 'STAGED' ? '⬜' : '✅'}] Node-${n.id}: ${n.task}`
        ).join('\n');

        const escapeHtml = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `🛰️ <b>Mission Blueprint: ${blueprint.id}</b>\n\n` +
               `<b>Objective</b>: <i>${escapeHtml(blueprint.objective)}</i>\n\n` +
               `<b>Sub-Nodes</b>:\n${escapeHtml(nodes)}\n\n` +
               `Confirm to initiate the Mission Control Protocol.`;
    }
}

module.exports = new MissionManager();
