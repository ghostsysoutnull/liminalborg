# Technical Specification: The Virtual Operator Protocol (Phase 6)

## 1. Overview
The Virtual Operator Protocol (VOP) is a testing harness that allows the AI Agent to simulate a human user interacting with the Liminal Borg Telegram bot. It bypasses the Telegram Bot API servers by injecting mock `Context` objects directly into the bot's handler functions.

## 2. Core Components

### 2.1 The Simulation Context (`SimulationContext`)
A class that mimics the Telegraf `Context` object. 

**Properties:**
- `chat`: Object `{ id: number, type: 'private' }`.
- `from`: Object `{ id: number, first_name: string, username: string }`.
- `message`: Object representing the incoming message (text, photo, etc.).
- `callbackQuery`: Object representing a button click (if applicable).
- `eventBuffer`: An array of all messages "sent" by the bot during the turn.

**Methods (Mocks):**
- `reply(text, extra)`: Pushes a "SEND" event to `eventBuffer`.
- `editMessageText(text, extra)`: Pushes an "EDIT" event to `eventBuffer`.
- `answerCbQuery(text)`: Pushes an "ACK" event to `eventBuffer`.
- `telegram.sendMessage(id, text, extra)`: Direct API call mock, pushes to `eventBuffer`.

### 2.2 The Shadow Registry (`SHADOW_MODE`)
A set of conditional overrides in core libraries.

- **Configuration**: `config.shadowMode` (Boolean).
- **Google Manager**: If `shadowMode` is true, `uploadFile` and `postBlog` return mock metadata without network I/O.
- **Twitter Manager**: If `shadowMode` is true, `tweet` returns a mock tweet ID.
- **Gemini Runner**: Optional "Fixed Response" mode to test parsing logic without calling the Gemini API.

### 2.3 The Interaction Sequencer (`Simulator`)
A utility to chain simulated events.

**API Example:**
```javascript
const sim = new Simulator(bot);
await sim.sendCommand('/reflect neon city');
const lastMsg = sim.getLastMessage();
expect(lastMsg).toContain('Staged Dispatch');

await sim.clickButton('dispatch_broadcast');
expect(sim.getLastMessage()).toContain('Broadcast Complete');
```

## 3. Data Structures

### 3.1 Event Buffer Entry
```json
{
  "timestamp": "2026-02-28T22:50:00Z",
  "type": "SEND | EDIT | ACK",
  "content": "Message text or HTML",
  "markup": { "inline_keyboard": [...] }
}
```

## 4. Implementation Priorities

1. **Isolation**: Ensure `SimulationContext` does not require a live `TELEGRAM_BOT_TOKEN`.
2. **Refactoring Requirement**: Handlers in `commands.js` and `events/index.js` must be exported in a way that allows them to be called independently of the `bot.launch()` loop.
3. **Traceability**: Every simulation run should generate a "Transcript" log for the AI Agent to review if a test fails.

## 5. Success Criteria
- **Zero-Network Dependency**: A full `/reflect` flow can be simulated with WiFi disabled.
- **Self-Correction**: The AI Agent can fix a parsing bug by running the simulator, observing the failure in the `eventBuffer`, and applying a fix without asking the user to "try again."
