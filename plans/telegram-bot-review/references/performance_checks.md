# Performance & Resilience Checklist

## 1. Event Loop & Async
- [ ] **No Sync Calls**: Search for `readFileSync`, `writeFileSync`, etc. (Zero-Block Policy).
- [ ] **Await Coverage**: Ensure all async operations are properly awaited or handled.
- [ ] **Pino Logging**: Verify non-blocking structured logging is used.

## 2. Network & External Services
- [ ] **Timeouts**: Every `axios` or external API call must have an explicit timeout.
- [ ] **Error Retries**: Check for basic retry logic on transient network failures.

## 3. Resource Management
- [ ] **Memory Buffering**: Ensure `stdout`/`stderr` from child processes is capped (e.g., 1MB).
- [ ] **Media Handling**: Check file streaming usage instead of loading whole files into memory.

## 4. Resilience
- [ ] **Graceful Shutdown**: Verify `SIGTERM` handlers kill lingering child processes and exit within a reasonable window (5s).
- [ ] **Uncaught Exceptions**: Ensure the process exits on `uncaughtException` to allow PM2 restart.
- [ ] **PM2 Config**: Check for `max_memory_restart` and `exp_backoff_restart_delay`.
