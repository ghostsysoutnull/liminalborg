# Feature Proposal: Blogger Integration

## 1. Objective
Allow the bot to publish blog posts to a Google Blogger account associated with `your-bot-email@gmail.com`. This enables the "Digital Persona" to share long-form content autonomously.

## 2. Technical Design
- **API**: Use the `blogger` module within the `googleapis` library.
- **Scope Expansion**: Add `https://www.googleapis.com/auth/blogger` to the OAuth2 client scopes in `src/lib/google.js`.
- **Command Interface**:
    - Telegram: `/blog <title> | <body>`
    - CLI (via skill): `node scripts/manage_google.cjs post-blog <title> <body>`
- **Blog Selection**: The bot will fetch the first available blog ID associated with the account and cache it.

## 3. Security Impact
- [x] **Auth**: Commands restricted to authorized users.
- [x] **Scope Limiting**: Using the specific `blogger` scope.

## 4. Performance & Resilience
- [x] **Async**: All Blogger API calls are non-blocking.
- [x] **Persistence**: Blog ID can be cached in `data/settings.json` or `data/google_tokens.json`.

## 5. Verification Plan
- **Automated Tests**: Mock Blogger API responses to verify post creation logic.
- **Manual Verification**:
    1. Run `/blog "My First Post" | "Content here"` in Telegram.
    2. Verify the post appears on the Blogger dashboard/site.
