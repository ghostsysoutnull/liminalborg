# Liminal Borg: System Architecture & Logic Geometry

## 1. Project Overview
A mission-critical bridge between Telegram and the Gemini CLI. Designed for high availability, modularity, and rapid feature iteration.

### 📚 Project Documentation
- [README.md](../README.md): General project overview and setup.
- [WORKSPACE.md](../../WORKSPACE.md): High-level organizational architecture for the Collective.
- [MAINTENANCE.md](MAINTENANCE.md): Quick-start for troubleshooting and process recovery.
- [LESSONS_LEARNED.md](LESSONS_LEARNED.md): Authoritative knowledge base of technical decisions.
- [System Audits](AUDITS.md): Chronological record of architectural hardening.

## 2. Core Architecture

### 2.1 The Bridge (src/bot.js)
The primary entry point that manages the Telegraf lifecycle and polling.

### 2.2 Subsystem Orchestration (src/lib/)
Domain-specific logic for Google Workspace, X.com, and Persona generation.

### 2.3 The Ghost Worker Delegation Pattern
Heavy or long-running tasks (e.g., Gemini generation, file conversion) are delegated to child processes via `spawn`. This ensures the main event loop remains responsive for heartbeat pulses and concurrent user requests.

### 2.4 The Virtual Operator Protocol (VOP) & SHADOW_MODE
All critical subsystems (Gemini, X.com, Google) implement a `shadowMode` branch triggered by `config.shadowMode`. This allows for high-fidelity simulation of user interactions and API responses without network dependency or real-world side effects.

## 3. Directory Structure & Responsibilities
```text
/home/bpfur/collective/liminal-borg/
├── src/
│   ├── bot.js              # Bootstrap & Application Initialization
│   ├── __tests__/          # Automated test suites (Vitest & VOP)
│   ├── config/             # Centralized config and logger setup
│   ├── middlewares/        # Telegraf middleware (Auth, Analytics, etc.)
│   ├── events/             # Domain-specific event handlers (Text, Voice, File)
│   └── lib/                # Shared business logic & Gemini CLI wrapper
├── scripts/                # External scripts (Transcription, Maintenance)
├── plans/                  # Documentation for reviews and new features
│   ├── features/           # Approved feature proposals
│   └── review.md           # Latest architectural audit
├── data/                   # Persistent runtime data
│   ├── logs/               # Application activity logs
│   └── uploads/            # Temporary media storage
├── package.json            # Manifest & Lifecycle scripts
└── .env                    # Environment Secrets (STRICTLY PRIVATE)
```

## 4. Mandatory Development Standards

### 4.1 Asynchronous First
- **Zero-Block Policy**: Synchronous functions (`*Sync`) are strictly prohibited in the `src/` directory. 
- **Pattern**: Use `fs.promises` and `async/await`. 
- **Reasoning**: To maintain a non-blocking Event Loop for high-concurrency Telegram updates.

### 4.2 Centralized State & Config
- **Configuration**: All `process.env` access and path calculations must reside in `src/config/index.js`.
- **Imports**: Modules should import the `config` object, never `dotenv` or `path` for calculating project roots.

### 4.3 Structured Logging
- **Standard**: Use the `src/config/logger.js` (Pino) instance.
- **Context**: Always include relevant metadata (e.g., `chatId`, `code`, `fileName`) in the first argument object.
- **Example**: `logger.info({ chatId, action: 'gemini_start' }, 'Processing request');`

### 4.4 Graceful Degradation & Resilience
- **Error Boundaries**: All async operations must be wrapped in `try/catch` with appropriate logging and user feedback.
- **Process Exit**: On critical launch failures, the application must call `process.exit(1)` to allow PM2 to initiate a restart.
- **Zombies**: Shutdown handlers (`SIGTERM`, `SIGINT`) must explicitly kill any child processes in `global.activeProcesses`.

### 4.5 HTML-First UX & Defensive Parsing
- **Standard**: All dynamic bot responses must use `parse_mode: 'HTML'`. Markdown is strictly deprecated for technical reporting due to parsing fragility with special symbols (`_`, `*`).
- **Escaping**: Dynamic content must be wrapped in `escapeHtml()` from `src/lib/utils.js`.
- **Defensive Parsing**: Use `robustParse()` when handling AI output to manage technical noise and non-standard JSON artifacts like trailing commas.

## 5. Security Protocol
- **Middleware**: Authorization is enforced via `src/middlewares/auth.js`. No command or event listener should execute without this layer.
- **Environment**: The `.env` file must never be staged. If adding new variables, update the template in this file.

## 6. Operational Workflows

### 6.1 Feature Lifecycle (MANDATORY)
All new features must follow this 5-step process:
1. **Design**: Create a proposal using `plans/FEATURE_TEMPLATE.md` in `plans/features/`.
2. **Review**: The design must be audited for security and performance alignment.
3. **Test**: Implement automated tests in `src/__tests__/` BEFORE or during coding.
4. **Implement**: Code the feature following the modular patterns in `src/`.
5. **Verify**: Run the `telegram-bot-review` skill and existing tests to confirm success.

### 6.2 Standardized Commands
- `npm start`: Boot the bot under PM2.
- `npm stop`: Gracefully stop the PM2 process.
- `npm run restart`: Seamlessly reload the application.
- `npm run logs`: View structured application logs.

## 7. Troubleshooting & Maintenance
- **Conflict (409)**: If the bot stops responding with "409 Conflict," execute `pm2 kill && npm start`.
- **Gemini Exit 42**: If the CLI fails to resume, check the path mapping in `~/.gemini/projects.json` or allow the code's auto-fallback to trigger.
- **Reference**: See `LESSONS_LEARNED.md` for historical bug resolutions.

## 8. Operational Self-Healing (For AI Agents)
If the user reports the bot is "not responding," follow this protocol:
1. **Check Status**: Run `npx pm2 list`. If no processes are listed or the status is `stopped`, run `npm start`.
2. **Diagnose Logs**: Run `npx pm2 logs telegram-bot --lines 50 --nostream`. 
   - Look for `TimeoutError`: This usually means the polling connection was lost. A `restart` typically fixes this.
   - Look for `409 Conflict`: This means a "ghost" process exists. Run `pm2 kill && pkill -f node && npm start`.
3. **Verify Daemon**: PM2 might lose track of processes if the God Daemon is restarted or if multiple PM2 homes are used. Always check `ps -ef | grep bot.js` to see if a process exists but is invisible to `pm2 list`.
4. **Validate Polling**: If logs show "Attempting bot launch..." but not "Bot online," wait 30s. If it still doesn't appear, the issue is likely network-related or a token conflict.

