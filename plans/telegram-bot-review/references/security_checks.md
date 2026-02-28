# Security Review Checklist

## 1. Authentication & Authorization
- [ ] **Middleware Presence**: Ensure `authMiddleware` is applied to all sensitive routes/events.
- [ ] **Deny-by-Default**: Verify that access is denied if `AUTHORIZED_CHAT_ID` is missing.
- [ ] **Identity Check**: Ensure `chatId` is strictly compared against the authorized ID.

## 2. Input Validation & Sanitization
- [ ] **Path Traversal**: Check all `path.join` calls involving user input. Ensure `path.basename()` is used.
- [ ] **Shell Injection**: Verify that `spawn` is used with array arguments, never `exec` with string concatenation of user input.
- [ ] **Message Length**: Check for limits on incoming text or media size.

## 3. Secret Management
- [ ] **.env Usage**: Ensure no secrets are hardcoded in source files.
- [ ] **Logging Secrets**: Audit logs to ensure no tokens or IDs are logged in plain text.
- [ ] **Environment Mapping**: Centralize all `process.env` access in `src/config/`.

## 4. Resource Protection
- [ ] **Rate Limiting**: Check if the bot has protection against flooding.
- [ ] **File Cleanup**: Ensure temporary uploads are unlinked after processing.
