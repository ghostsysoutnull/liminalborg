# Feature Proposal: Google Workspace Integration

## 1. Objective
Enable the bot to interact with Google services (Gmail, Drive) using the `your-bot-email@gmail.com` account. This allows the bot to send emails and upload/manage files autonomously.

## 2. Technical Design
- **Library**: Use `googleapis` npm package.
- **Authentication**: OAuth2 Desktop flow. 
    - Initial setup will require a one-time "Authorization URL" sent to the user via Telegram.
    - Token storage: `data/google_tokens.json` (secured via `.gitignore`).
- **Module**: New file `src/lib/google.js` to encapsulate Gmail and Drive logic.
- **Commands**:
    - `/mail <recipient> <subject> <body>`
    - `/upload` (as a reply to a photo or document)

## 3. Security Impact
- [x] **Auth**: Commands restricted to authorized users.
- [x] **Secret Management**: `CLIENT_ID` and `CLIENT_SECRET` in `.env`. Tokens in a private data file.
- [x] **Scope Limiting**: Using restricted scopes (`gmail.send`, `drive.file`) to follow the principle of least privilege.

## 4. Performance & Resilience
- [x] **Token Refresh**: Automatic token refreshing handled by the library.
- [x] **Async**: All Google API calls are non-blocking.
- [x] **Persistence**: Tokens survive restarts.

## 5. Verification Plan
- **Automated Tests**: Mock Google API responses to verify command parsing and argument mapping.
- **Manual Verification**:
    1. Run `/mail` and verify delivery to a test inbox.
    2. Upload a file via `/upload` and find it in Google Drive.
