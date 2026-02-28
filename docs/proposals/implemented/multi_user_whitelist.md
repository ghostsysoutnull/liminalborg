# Feature Proposal: Multi-User Whitelist

## 1. Objective
Replace the single, hardcoded `AUTHORIZED_CHAT_ID` with a dynamic whitelist stored in `data/whitelist.json`. This allows the owner to grant and revoke access to the bot via Telegram commands.

## 2. Technical Design
- **Storage**: `data/whitelist.json` will store an array of authorized chat IDs.
- **Bootstrapping**: The initial `AUTHORIZED_CHAT_ID` from `.env` will be automatically added to the whitelist on first run to ensure the owner doesn't lose access.
- **Middleware Update**: `src/middlewares/auth.js` will check the `chatId` against the dynamic whitelist instead of the single config value.
- **Commands**:
    - `/allow <chat_id>`: Add a new user to the whitelist (Owner only).
    - `/revoke <chat_id>`: Remove a user from the whitelist (Owner only).
    - `/list_authorized`: Show all currently whitelisted IDs.

## 3. Security Impact
- [x] **Owner-Only**: Only the original owner (defined in `.env`) can manage the whitelist.
- [x] **Auth Check**: All commands remain protected by the auth middleware.
- [x] **Persistence**: The whitelist survives restarts.

## 4. Performance & Resilience
- [x] **Caching**: The whitelist will be loaded into memory (`global.whitelist`) at startup for fast lookups.
- [x] **Async Storage**: Any changes to the whitelist will be saved asynchronously.

## 5. Verification Plan
- **Automated Tests**: Create `src/__tests__/whitelist.test.js` to verify ID matching and command logic.
- **Manual Verification**:
    1. Verify owner access works as before.
    2. Add a new ID via `/allow`.
    3. Verify the new user can now interact with the bot.
    4. Revoke the ID and verify access is blocked.
