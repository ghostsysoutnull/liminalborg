# Feature Proposal: Real-time Parameter Tuning

## 1. Objective
Enable users to adjust Gemini's behavior (e.g., temperature, top-p, system instructions) directly from Telegram using an interactive inline menu. This allows for switching between "Creative" and "Precise" modes without restarting the bot.

## 2. Technical Design
- **Entry Point**: New command `/settings`.
- **UI**: Telegram Inline Keyboards for interactive selection of values.
- **State Management**: Parameters will be stored in-memory per `chatId` for now. A `global.chatSettings` object will be initialized in `src/bot.js`.
- **Gemini Integration**: Update `runGemini` in `src/lib/gemini.js` to accept a `settings` object and map these to CLI flags (e.g., `--temperature`, `--top-p`).

## 3. Security Impact
- [x] **Auth**: Protected by `authMiddleware`.
- [x] **Input**: Settings are selected via predefined buttons (enum-like), preventing arbitrary flag injection.
- [ ] **Secrets**: No new secrets required.

## 4. Performance & Resilience
- [x] **Async**: Menu interactions use async callback queries.
- [x] **Timeouts**: N/A for menu interactions.
- [x] **Cleanup**: State is in-memory; will be lost on restart (acceptable for MVP).

## 5. Verification Plan
- **Automated Tests**: Add `src/__tests__/settings.test.js` to verify setting storage and flag mapping.
- **Manual Verification**: 
    1. Send `/settings`.
    2. Change temperature to `2.0`.
    3. Send a message and verify Gemini's "creative/random" output.
    4. Change temperature to `0.1`.
    5. Verify Gemini's "deterministic" output.
