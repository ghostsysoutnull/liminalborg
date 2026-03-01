# Lessons Learned: Liminal Borg Evolution

This document serves as the authoritative knowledge base for the technical challenges, architectural decisions, and operational best practices discovered during the development of the Liminal Borg Telegram system.

## 1. Core Technical Challenges

### 1.1 Gemini CLI Session Integrity (Error 42)
- **Issue**: Directory restructuring broke the Gemini CLI's ability to resume sessions (`--resume latest`), resulting in `Exit Code: 42`.
- **Root Cause**: The CLI maps project slugs to absolute paths in `~/.gemini/projects.json`.
- **Resolution**: Synced project slugs across `~/.gemini/tmp` and `~/.gemini/history`.
- **Best Practice**: Implement a fallback in the Node.js wrapper to retry without `--resume` if code `42` is detected.

### 1.2 UX Formatting & API Errors (Markdown vs. HTML)
- **Discovery**: Technical strings (filenames, IDs) containing `_` or `*` caused persistent `400 Bad Request` errors in Markdown mode.
- **Root Cause**: Telegram's Markdown parser is extremely sensitive to unclosed formatting symbols.
- **Solution**: Adopted an **HTML-First UX** policy. Standardized on `escapeHtml()` from `src/lib/utils.js` for all dynamic content.

### 1.3 Defensive JSON Parsing (LLM Noise)
- **Discovery**: `JSON.parse()` repeatedly failed on Gemini output despite valid content.
- **Root Cause**: LLMs often include technical noise (dotenv messages) or illegal trailing commas.
- **Solution**: Implemented a **"Harvesting" strategy** using `lastIndexOf` to extract the JSON block and regex to strip trailing commas before parsing.

### 1.4 Interactive Process Deadlocks
- **Discovery**: The bot became unresponsive when Gemini paused for user input (`[y/N]`).
- **Resolution**: Implemented a **"Session Cancellation" architecture**. Incoming messages proactively kill any active child processes before starting new ones.

### 1.5 UI Header Duplication (Constant vs. Handler)
- **Issue**: The `/help` command title appeared twice in the Telegram interface.
- **Root Cause**: The `MESSAGES.HELP_TEXT` constant was updated to include the header, but the command handlers were still manually prepending the same string.
- **Resolution**: Centralized the header within the constant and simplified handlers to return the raw constant.
- **Best Practice**: Implement unit tests using `split().length - 1` to assert exactly one occurrence of key UI headers.

### 1.6 Vitest CJS/ESM Interop
- **Issue**: Tests failed with "Vitest cannot be imported in a CommonJS module using require()".
- **Resolution**: Even in a CommonJS project, test files using Vitest must use `import` for Vitest-specific symbols (`describe`, `it`, `expect`) while using `require()` for local project modules.

## 2. Architectural Standards

### 2.1 Non-Blocking Delegation (Ghost Worker)
- **Principle**: Heavily processing (AI generation, file conversion) must be delegated to child processes via `spawn`.
- **Benefit**: Ensures the main bot event loop remains responsive for heartbeat integrity pulses and concurrent user requests.

### 2.2 Centralized Configuration
- **Principle**: All paths, secrets, and environment variables are isolated within `src/config/index.js`.
- **Benefit**: Eliminates "Path Hell" and prevents secret leakage across multiple `process.env` calls.

### 2.3 High-Fidelity Mocking (Shadow Mode)
- **Standard**: All external integrations (Gemini, X.com, Google) must implement a `config.shadowMode` branch.
- **Benefit**: Allows the **Virtual Operator Protocol (VOP)** to verify 100% of the bot's logic without network dependency or API credit consumption.

### 2.3 Shell Injection Prevention
- **Principle**: Never use `child_process.exec` with string interpolation for user-controlled inputs.
- **Standard**: Always use `child_process.spawn` with argument arrays to bypass the shell.

### 2.4 High-Fidelity Simulation
- **Standard**: All core interaction loops must be verified using the **Virtual Operator Protocol (VOP)** before deployment to ensure API-layer stability.

## 3. Operational Runbook
- **Restarting**: `npm run restart` (managed via PM2).
- **Viewing Logs**: `npm run logs`.
- **Emergency Nuke**: `pm2 kill && pkill -f node`.
- **Validation**: `npm test` must pass 100% before any push to `origin main`.
