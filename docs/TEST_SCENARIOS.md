# Manual Acceptance Testing (MAT) Protocols

This document provides the sequence of manual interactions required to verify the end-user experience. While automated simulations (VOP) verify the logic, these protocols ensure the Telegram UI and Persona remain immersive and responsive.

## SCENARIO 1: THE INTERACTIVE TERMINAL
1. Send: `/help`
   - Expected: Interactive HTML menu with 4 categories.
2. Click: `[🦾 Core]`
   - Expected: Menu updates to show `/status`, `/settings`, `/clear`.
3. Click: `[⬅️ Back to Categories]` -> `[📔 Archivist]`
   - Expected: View Google Workspace command protocols.

## SCENARIO 2: MISSION CONTROL (GHOST WORKER)
1. Send: `/mission "Test Node Execution"`
   - Expected: Mission Blueprint HTML appears with staged nodes.
2. Click: `[🚀 Initiate Protocol]`
   - Expected: **Telemetry Bursts** arrive every 500ms (throttled).
   - Final: "Mission Accomplished" report with sync/archive options.

## SCENARIO 3: DIGITAL PERSONA UPLINK
1. Send: `/reflect "The recursive architecture of neon light"`
   - Expected: "Consulting Prime Intelligence" message appears.
2. Observe: Staged Dispatch HTML (Title, Blog, Tweet).
3. Click: `[✅ Broadcast]`
   - Expected: Final confirmation with Blogger and X.com links.

## SCENARIO 4: NATURAL LANGUAGE DIRECTIVES
1. Reply to any previous message with: `Post this to X`
   - Expected: Immediate broadcast to X.com with the replied-to text.

## SCENARIO 5: SYSTEM INTEGRITY & PERSISTENCE
1. Send: `/status`
   - Expected: Unified report showing Archive, Sprawl, Collective, and Server metrics.
2. Send: `/settings` -> Change Temperature to `1.5`.
3. Execute `npm run restart` in CLI.
4. Send: `/settings` again.
   - Expected: Temperature remains `1.5` (Verified Persistence).

## SCENARIO 6: AUTHENTICATION
1. Use an unauthorized Telegram account to send `/help`.
   - Expected: `⛔ Access denied.`
2. Use the Owner account to send `/allow <chat_id>`.
   - Expected: Success message.
3. Verify the new account can now access `/help`.

---
*"Synchronize. Execute. Archive."*
