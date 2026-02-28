# Feature Proposal: The Virtual Operator Protocol (Phase 6)

## 1. Objective
Eliminate the "Fix and Hope" cycle by creating a local simulation environment that emulates the Telegram Bot API lifecycle. This allows the AI agent to verify commands, button callbacks, and complex multi-step workflows (like `/reflect` or `/mission`) without manual operator testing.

## 2. Technical Design

### A. The Simulation Factory (`src/__tests__/sim/factory.js`)
- **Fake Context**: A Javascript class that mimics the Telegraf `ctx` object.
- **Spy Methods**: 
    - `reply`, `editMessageText`, `sendMessage`: Capture output into a local `eventBuffer`.
    - `answerCbQuery`: Verify that button clicks are acknowledged.
- **State Persistence**: The factory will link the fake context to the actual `global.chatSettings` and `global.activeProcesses` to ensure realistic state handling.

### B. Subsystem Shadowing (`SHADOW_MODE`)
- **Logic Interception**: Add a `SHADOW_MODE` flag to `src/config/index.js`.
- **Mock Responses**: When active, `lib/google.js` and `lib/twitter.js` will return pre-defined "Success" objects instead of making network calls.
- **Parsing Stress-Tests**: Allow the simulator to inject known "corrupted" LLM output (trailing commas, dotenv noise) to verify our `robustParse` utility.

### C. Interaction Sequencer (`scripts/simulate.js`)
- A CLI runner that takes a scenario name (e.g., `REFLECT_THEME_FLOW`).
- **Sequencing**:
    1. Triggers `bot.handleCommand('/reflect ...')`.
    2. Waits for the "Consulting Intelligence" response.
    3. Automates the button click: `bot.handleAction('dispatch_broadcast')`.
    4. Verifies the final "Broadcast Complete" message appears in the buffer.

## 3. Development Roadmap

### Phase 1: Context Mocking
- Implement `SimulationContext` factory.
- Verify that a simple `/ping` command can be executed and its response captured locally.

### Phase 2: Action Emulation
- Implement the ability to trigger `bot.action` handlers via simulation.
- **Goal**: Successfully simulate clicking "Initiate Protocol" on a blueprint.

### Phase 3: Shadow Subsystems
- Implement `SHADOW_MODE` for X.com and Google Workspace.
- Ensure `ReflectionEngine` can run through the simulator using a cached Gemini response to save time/tokens.

### Phase 4: Integration Scenarios
- Convert all scenarios in `MISSION_CONTROL_TESTS.txt` into automated simulation scripts.
- Integrate into `npm test` so I can run `npm run test:sim`.

## 4. Maintenance & Reliability
- **Regression Protocol**: Before any Git push, I must run the simulator.
- **Verification**: If the simulator passes, the bot is guaranteed to be stable at the API layer.
