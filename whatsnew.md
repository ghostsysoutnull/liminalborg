# What's New: Liminal Borg Evolution

This document tracks the significant architectural and feature updates to the Liminal Borg system.

## [2026-02-28] - The Autonomy & Simulation Update

### 🦾 The Ghost Worker Protocol (Phase 4)
- **Asynchronous Execution**: Heavy tasks (like Gemini generation) are now delegated to child processes, ensuring the main Telegram bot remains 100% responsive.
- **Mission Orchestration**: A new `MissionManager` can plan and track multi-step technical or persona-driven objectives.
- **Telemetry Bursts**: Real-time progress updates are pushed to the operator via robust HTML-formatted messages.

### 🧠 Enhanced Reflection Engine
- **Pure Theme Mode**: Support for `/reflect <theme>` allowing the bot to generate immersive persona content based on abstract prompts.
- **Dark Dictionary 2.0**: Expanded translation layer to ensure consistent "Liminal Borg" terminology across all public dispatches.
- **Robust Persona Parsing**: Implemented "Defensive Parsing" to handle noisy LLM output, trailing commas, and technical metadata.

### 🛡️ Utility Core (`src/lib/utils.js`)
- **Robust JSON Harvesting**: A specialized parser that extracts valid JSON blocks from noisy string output.
- **HTML-First UX**: Centralized HTML escaping to prevent Telegram API parsing errors with technical strings.

### 🎛️ The Virtual Operator Protocol (Phase 6)
- **Local Simulation**: A high-fidelity testing harness that emulates the Telegram API locally.
- **SHADOW_MODE**: Enable full system testing (Twitter, Google, Gemini) without actual API calls or network dependency.
- **End-to-End Verification**: Automated simulation suites verify complete interaction flows from command to broadcast.

### 🔒 Security & Maintenance
- **Shell Injection Fix**: Migrated from `exec` to `spawn` with argument arrays for all Gemini interactions.
- **Centralized Config**: All secrets and environment variables are now isolated within `src/config/index.js`.
- **Test Suite Expansion**: Total automated tests increased from 11 to 33 passing cases.

## [2026-02-28] - Global Standardization Update

### 🛡️ HTML-First UX Migration
- **Robustness**: Converted all 30+ message handlers from Markdown to HTML to eliminate `400 Bad Request` parsing errors.
- **Safety**: Standardized on `escapeHtml()` for all dynamic content including filenames, transcripts, and technical metadata.

### 🐛 Logic Refinement
- **Voice Fix**: Corrected event mapping for voice messages, restoring the transcription pipeline.
- **Natural Language Directives**: Enabled "Post this to X" and "Tweet this" as replies to existing messages.

### 🛡️ Automated Hygiene (Sentinel Protocol)
- **Security Linter**: Implemented `scripts/sentinel.js` to automatically scan for sensitive environment variables (Chat IDs, API keys, emails) in the codebase.
- **Gated Deployment**: Mandatory `npm run scrub:check` integrated into the AI mission guide to prevent accidental leaks in future commits.

## [2026-02-28] - High-Signal Command Unification

### ⚡️ Simplified Architecture
- **Protocol Unification**: Merged `/oracle` and `/status` into a single, comprehensive `Borg Integrity Report`. This simplifies the command surface while providing both technical metrics and collective state data in one view.
- **Improved Re-verification**: Standardized the `[🔄 Re-Verify Pulse]` button to trigger a full system integrity check.
