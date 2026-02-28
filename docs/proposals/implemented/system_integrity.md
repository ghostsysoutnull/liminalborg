# Feature Proposal: System Integrity Protocol

## 1. Objective
Establish a proactive diagnostic layer that monitors the health of all integrated uplinks (Google, Blogger, X.com) and provides the Prime Operator with high-signal status reports.

## 2. Technical Design
- **Core Module**: `src/lib/integrity.js` - Houses the "Pulse" logic for each sub-system.
- **Diagnostic Handshakes**:
    - **Google Drive**: Rapid `files.list` call.
    - **X.com**: Auth-only `users.me` call.
    - **Blogger**: `blogs.listByUser` call.
    - **Journal**: Write-integrity check on `data/history.log`.
- **Interface**:
    - Enhanced `/status` command returning a visual (🟢/🔴) report.
    - Background "Watchdog" timer (6-hour interval) for proactive alerts.
- **UI**: Add `[🔄 Re-verify Uplinks]` button to the status report.

## 3. Security Impact
- [x] **Least Privilege**: Diagnostic calls are read-only and non-destructive.
- [x] **Rate Limiting**: Watchdog interval is sparse to prevent API quota exhaustion.

## 4. Performance & Resilience
- [x] **Async Parallelism**: All handshakes are executed simultaneously via `Promise.allSettled`.
- [x] **Caching**: Status is cached in memory to keep `/status` instantaneous.

## 5. Verification Plan
- **Automated Tests**: Create `src/__tests__/integrity.test.js` to mock failure scenarios for each uplink.
- **Manual Verification**:
    1. Run `/status` and verify all systems show 🟢.
    2. Temporarily revoke a token and verify the status switches to 🔴.
