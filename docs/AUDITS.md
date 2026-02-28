# System Audit Log: Liminal Borg Hardening

This document tracks the historical architectural audits, security reviews, and optimization phases performed on the Liminal Borg system.

## [2026-02-26] - Initial Security & Resilience Audit
**Objective**: Review the bot for production-grade security, performance, and maintainability.

### Key Findings & Resolutions
*   **Security**: Identified and fixed a Path Traversal vulnerability in `handleFile` using `path.basename()`. Hardened `authMiddleware` to deny-by-default if configuration is missing.
*   **Performance**: Added explicit `axios` timeouts (30s-60s) to prevent event loop hangs. Implemented `MAX_OUTPUT_SIZE` (1MB) limits on process buffering.
*   **Resilience**: Increased graceful shutdown timeout to 5s to ensure child process cleanup.
*   **Maintainability**: Modularized `scheduler.js` and integrated its cleanup into the shutdown protocol.

---

## [2026-02-28] - Autonomy & Persona Audit
**Objective**: Audit the new Ghost Worker protocol and Reflection Engine.

### Key Findings & Resolutions
*   **Security [CRITICAL]**: Identified a Shell Injection risk in `reflection.js` due to `exec()` usage. **Resolution**: Refactored to `spawn()` with argument arrays.
*   **Secret Management**: Identified direct `process.env` calls in multiple modules. **Resolution**: Centralized all secrets in `src/config/index.js`.
*   **Robustness**: Identified frequent `400 Bad Request` errors in Telegram due to Markdown parsing of technical IDs. **Resolution**: Migrated to **HTML-First UX** and implemented `escapeHtml()` across all handlers.
*   **Utility Core**: Created `src/lib/utils.js` to centralize defensive parsing and HTML escaping logic.

### Status: PASSED
The system has been significantly hardened. All core interaction loops are now verified using the **Virtual Operator Protocol (VOP)** local simulation.
