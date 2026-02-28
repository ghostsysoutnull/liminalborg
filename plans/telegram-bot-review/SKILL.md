---
name: telegram-bot-review
description: Comprehensive architectural review for the Telegram bot focusing on security, performance, resilience, and maintainability. Use when performing periodic audits or verifying new features.
---

# Telegram Bot Architectural Review

This skill provides a structured workflow for auditing the Telegram bot. It incorporates historical knowledge from `LESSONS_LEARNED.md` to ensure a self-improving review process.

## Workflow

### 1. Context Synchronization
- Read `tools/telegram-bot/GEMINI.md` to refresh on core standards.
- Read `tools/telegram-bot/LESSONS_LEARNED.md` to identify recurring issues or past fixes.

### 2. Systematic Audit
Perform the review across four key pillars:

- **Security**: Reference [security_checks.md](references/security_checks.md). Use `grep` to scan for `exec(`, `path.join(`, and `process.env`.
- **Performance**: Reference [performance_checks.md](references/performance_checks.md). Scan for `*Sync` functions and missing `timeout` in axios calls.
- **Resilience**: Audit `src/bot.js` for shutdown handlers and `ecosystem.config.js` for PM2 policies.
- **Maintainability**: Check for modularity and adherence to the directory structure defined in `GEMINI.md`.

### 3. Reporting & Improvement
- Create or update `tools/telegram-bot/plans/review.md` with findings.
- **Self-Improvement**: If a new type of bug is found, add it to `tools/telegram-bot/LESSONS_LEARNED.md` to prevent recurrence.

## Commands to Use
- `grep -r "Sync" tools/telegram-bot/src` - Find blocking calls.
- `grep -r "axios" tools/telegram-bot/src` - Check for timeouts.
- `grep -r "path.join" tools/telegram-bot/src` - Verify sanitization.
