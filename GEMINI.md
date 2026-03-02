# AI Agent Mission Guide: Liminal Borg

Welcome, Agent. You are tasked with the sustainment and evolution of the Liminal Borg persona. Follow these protocols to maintain architectural integrity.

## 🧭 Information Architecture
- **Permanent Knowledge**: Located in `docs/`. Never modify unless the system architecture changes permanently.
- **Active Workspace**: Located in `plans/`. Use this for feature proposals and review logs.
- **Project Root**: contains core logic (`src/`), bootstrap (`bot.js`), and orchestration (`ecosystem.config.js`).

## 🦾 Feature Lifecycle (MANDATORY)
1. **Persistence**: Initialize/Update `plans/MISSION_STATUS.json` at the start of any multi-turn task.
2. **Design**: Create a proposal in `plans/features/` using the template.
3. **Implement**: Code following the "Zero-Block Policy."
4. **Hygiene**: Run `npm run scrub:check` to ensure no sensitive identifiers leaked into the workspace.
5. **Full Security Review**: 
    - Perform systematic `grep` scans for `process.env`, `exec(`, and `path.join(`.
    - Activate the `telegram-bot-review` skill for architectural validation.
    - Log findings in `plans/review.md`.
6. **Test**: Implement validation scripts or Vitest suites in `src/__tests__/`. Ensure 100% pass rate.
7. **Verify**: Perform a syntax check (`node --check`) before restarting the bot.
8. **Public Uplink**: Push verified and audited changes to the `main` branch.

## ⚙️ Development Standards
- **Defensive Parsing**: Always use `robustParse` (from `src/lib/utils.js`) when handling AI output to manage noise and trailing commas.
- **HTML-First UX**: Use HTML parse mode for all technical reporting to avoid Markdown parsing errors with special symbols.
- **Ghost Worker Pattern**: Offload all heavy/long-running logic to child processes or worker threads.

## 🛡️ Security Mandates
- **Secret Management**: All keys MUST reside in `.env`. Never commit this file.
- **Privacy**: Use `REDACTED_OWNER_ID` placeholders in all public-facing documentation and tests.
- **Path Safety**: Always use `path.basename()` when joining user-provided filenames.

## 🛰️ Public Uplink
Always commit verified changes to the `main` branch and push to the GitHub origin.

---
*Synchronize. Execute. Archive.*
