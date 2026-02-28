# Feature Proposal: Persistent Settings

## 1. Objective
Ensure that user-specific settings (temperature, top-p) survive bot restarts by persisting them to a JSON file on disk.

## 2. Technical Design
- **Storage**: A new file `data/settings.json` will store the settings map.
- **Lifecycle**:
    - **Startup**: `src/bot.js` will load this file into `global.chatSettings`.
    - **Updates**: Every time a setting is changed via `/settings` (in `src/events/index.js`), the file will be updated asynchronously.
- **Fallback**: If the file is missing or invalid, the bot will initialize an empty object and use hardcoded defaults as before.

## 3. Security Impact
- [x] **Auth**: Access to settings is already protected by `authMiddleware`.
- [x] **Input**: Only valid numbers from buttons are saved.
- [ ] **Secrets**: N/A.

## 4. Performance & Resilience
- [x] **Async**: Use `fs.promises.writeFile` to prevent blocking the event loop.
- [x] **Error Handling**: Wrap load/save operations in try/catch to prevent crashes on file corruption.
- [x] **Atomic Writes**: For the current scale, simple `writeFile` is sufficient, but we will ensure the directory exists.

## 5. Verification Plan
- **Automated Tests**: Create `src/__tests__/persistence.test.js` to verify JSON serialization and deserialization.
- **Manual Verification**: 
    1. Set a custom temperature.
    2. Restart the bot (`npm run restart`).
    3. Check `/settings` to confirm the value persisted.
