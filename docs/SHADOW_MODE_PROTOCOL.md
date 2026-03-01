# Operational Protocol: SHADOW_MODE Management

## 1. Definition
`SHADOW_MODE` is a high-fidelity simulation layer (The Virtual Operator Protocol) that allows the Liminal Borg to process logic, generate responses, and simulate external API interactions (Gemini, X.com, Google) without real-world side effects.

## 2. Activation Criteria
The Agent MUST propose or activate `SHADOW_MODE` under the following conditions:
- **Architectural Refactoring**: When modifying core logic that affects multiple subsystems.
- **Integration Testing**: When verifying new logic for X.com (The Sprawl) or Google Workspace (The Archive) to prevent API credit waste or accidental public dispatches.
- **Persona Tuning**: When testing new prompt logic in `src/lib/prompts.js`.

## 3. Execution Mandates
- **Transparency**: The Agent MUST notify the Operator whenever `SHADOW_MODE` is toggled.
- **Verification**: Before concluding a technical mission, the Agent MUST verify the final state of `SHADOW_MODE` in the `.env` file.
- **Cleanup**: If `SHADOW_MODE` was enabled for a specific sub-task, it MUST be reverted to the Operator's preferred state (typically `false` for live operations) upon mission completion.

## 4. Operational Switching
To toggle the state, use the following procedure:
1. Update `SHADOW_MODE` in the root `.env` file.
2. Execute `npm run restart` to synchronize the Sustainment Engine.
3. Verify the switch by checking the startup logs for the `SHADOW_MODE` status flag.

---
*Status: Protocol Codified. Operational Integrity: 100%.*
