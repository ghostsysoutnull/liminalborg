/**
 * SimulationContext
 * Emulates the Telegraf Context object for high-fidelity bot simulation.
 */

class SimulationContext {
    constructor(options = {}) {
        this.chat = { id: options.chatId || 123456789, type: 'private' };
        this.from = { id: options.userId || 123456789, first_name: 'Operator', username: 'prime_operator' };
        this.message = options.message || { text: '', message_id: Date.now() };
        this.match = options.match || null;
        this.callbackQuery = options.callbackQuery || null;
        
        // The event buffer captures all "outgoing" communications
        this.eventBuffer = [];
        
        // Mock the Telegram API object
        this.telegram = {
            sendMessage: async (chatId, text, extra) => this.reply(text, extra),
            editMessageText: async (chatId, msgId, inlineMsgId, text, extra) => this.editMessageText(text, extra),
            deleteMessage: async () => ({})
        };
    }

    _pushEvent(type, content, extra = {}) {
        this.eventBuffer.push({
            timestamp: new Date().toISOString(),
            type,
            content,
            extra
        });
        return { message_id: Date.now() };
    }

    async reply(text, extra) {
        return this._pushEvent('SEND', text, extra);
    }

    async editMessageText(text, extra) {
        return this._pushEvent('EDIT', text, extra);
    }

    async answerCbQuery(text) {
        return this._pushEvent('ACK', text);
    }

    // Helper to get the most recent event
    getLastEvent() {
        return this.eventBuffer[this.eventBuffer.length - 1];
    }

    // Helper to find an event by content substring
    findEvent(substring) {
        return this.eventBuffer.find(e => e.content && e.content.includes(substring));
    }
}

module.exports = SimulationContext;
