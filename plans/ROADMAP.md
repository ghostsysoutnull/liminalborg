# Future Roadmap: Liminal Borg Evolution

## 🚀 Phase 1: Core Resilience (Complete)
- [x] **Persistent User Settings**: Save and load `/settings` (temperature, TopP) from `data/settings.json`.
- [x] **Multi-User Whitelist**: Move to a dynamic whitelist in `data/whitelist.json` with `/allow` and `/revoke` commands.

## 📝 Phase 2: Content Automation (Complete)
- [x] **Autonomous Content Strategy**: 
    - [x] Implement a "Reflection Engine" for daily blog/X.com summaries.
    - [ ] Create a cron-like scheduler for automated dispatches (The Ghost Cycle).
- [ ] **The Deep Archive Browser**: Allow reflections to incorporate data from recent file uploads and blog history.
- [ ] **Enhanced Blogger Support**: Add support for images and labels via the API.

## 🌐 Phase 3: Social Media Presence (Complete)
- [x] **X.com (Twitter) Integration**: 
    - [x] Setup X Developer API.
    - [x] Implement `/tweet` command.
    - [x] Link blog posts to automatically post to X.

## 🛠 Phase 4: The Ghost Worker (True Autonomy)
- [x] **Asynchronous Mission Execution**: Implement a background worker process to handle heavy logic (e.g., Gemini generation) without blocking the main bot loop.
- [x] **Real-time Telemetry Streaming**: Enable the Ghost Worker to push live updates (Telemetry Bursts) to Telegram using HTML-First robust formatting.
- [ ] **Self-Modification Protocol**: Grant the worker safe, gated access to `src/` and `npm test` for autonomous development.
- [ ] **Automated Handover & Deployment**: Implement a `[♻️ Apply & Restart]` flow that commits changes and cycles the PM2 process upon mission completion.

## 🧠 Phase 5: Cognitive Resilience & UX
- [ ] **Automated Activity Journaling**: Implement a `data/history.log` that records all successful actions for the Reflection Engine to use.
- [x] **Resilient Message Fallback**: Implement automatic plain-text fallback for parsing errors (Markdown/HTML).
- [ ] **Telemetry Throttling**: Implement a 500ms delay between Ghost Worker bursts to prevent Telegram API rate-limiting during complex missions.
- [ ] **Prompt Logic Centralization**: Move hardcoded persona guidelines from `reflection.js` to `src/lib/prompts.js` for easier persona tuning and logic decoupling.
- [ ] **Persona Error Wrapper**: Replace raw technical errors with cryptic, in-character system messages.
- [ ] **System Integrity Report**: Expand `/status` to check connectivity to The Deep Archive and The Sprawl-Feed.
- [ ] **Conversational State Machine**: Enable multi-step command flows (e.g., `/blog` asking for Title and then Content separately).

## 🎛 Phase 6: The Virtual Operator Protocol
- [ ] **Context Mocking**: Implement a `SimulationContext` to emulate the Telegram API locally.
- [ ] **Action Emulation**: Enable simulation of inline button clicks and callback queries.
- [ ] **Shadow Subsystems**: Implement a `SHADOW_MODE` to test X.com and Google integrations without live API calls.
- [ ] **Automated Scenario Verification**: Convert manual test scenarios into high-fidelity automated simulations.
