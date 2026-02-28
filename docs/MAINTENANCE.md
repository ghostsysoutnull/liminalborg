# AI Agent Quick-Start: Bot Maintenance

If the bot is unresponsive, perform these steps in order:

1. **Verify Visibility**:
   `npx pm2 list`
   If the list is empty but you think it should be running, the PM2 daemon might have been reset.

2. **The "Hard Reset" (Fixes most issues including 409 Conflict)**:
   `npx pm2 kill && pkill -f node && npm start`
   *This stops the PM2 daemon, kills all node processes, and starts a fresh instance.*

3. **Check Connection**:
   `npx pm2 logs telegram-bot --lines 20 --nostream`
   Ensure you see `🚀 Bot online and polling for updates`. If not, it's still connecting or timed out.

4. **Gemini CLI Issues (Error 42)**:
   If Gemini fails to run, it's usually a project path mismatch in `~/.gemini/projects.json`. The bot has auto-fallback, but a manual check of that file helps.

*Refer to GEMINI.md for full architectural standards.*
