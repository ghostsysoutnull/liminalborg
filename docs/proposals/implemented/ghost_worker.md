# Feature Proposal: The Ghost Worker (Phase 4)

## 1. Objective
Transform Liminal Borg into a self-modifying autonomous entity. The Ghost Worker will handle the execution of Technical Missions (writing code, running tests, and deploying) in a separate background thread/process.

## 2. Technical Design
- **Core Module**: `src/lib/ghost.js` - The execution engine for technical sub-nodes.
- **Mission Persistence**: `data/active_mission.json` - Stores the current blueprint and progress so the bot can recover state after a self-initiated restart.
- **Workflow**:
    1. **Trigger**: User clicks `[🚀 Begin Mission]` in Telegram.
    2. **Execution**: Main bot spawns the Ghost Worker.
    3. **Telemetry**: Ghost Worker writes technical logs to a stream that the main bot "listens" to and forwards to the user using robust HTML-First formatting.
    4. **Deployment**: Upon completion of all nodes, the bot executes a PM2 reload.
- **Phase 4.1: Mission Variety**:
    - **Technical Missions**: Environment preparation, logic implementation, verification.
    - **Persona Missions**: Prime Intelligence consultation (Reflections), staging area preparation.

## 3. Security Impact
- [x] **Safe-Gated Access**: The worker only has access to its own project directory.
- [x] **Owner-Only Trigger**: Missions can only be initiated by the authorized owner.
- [ ] **Secrets Protection**: The worker must never touch or modify the `.env` file.

## 4. Performance & Resilience
- [x] **Asynchronous Execution**: The Ghost Worker runs as a separate process, ensuring the Telegram bot remains responsive.
- [x] **Automated Handover**: State is saved to disk before restart.

## 5. Verification Plan
- **Manual Verification**:
    1. Initiate a mission to create a simple text file.
    2. Observe telemetry bursts in Telegram.
    3. Verify the file exists and the bot restarted successfully.
