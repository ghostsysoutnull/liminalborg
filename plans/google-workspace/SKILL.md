---
name: google-workspace
description: Manage Gmail and Google Drive for your-bot-email@gmail.com. Allows sending emails and uploading files directly from the CLI or via automated agents.
---

# Google Workspace Skill

This skill allows Gemini CLI to interact with Google services. It shares configuration and tokens with the Telegram bot for a unified digital persona.

## Authorization
If not yet authorized, the agent must:
1. Generate a URL: `node scripts/manage_google.cjs auth-url`
2. Ask the user to authorize and provide the code.
3. Set the token: `node scripts/manage_google.cjs set-token <code>`

## Common Workflows

### Sending an Email
To send an email, the agent should invoke:
`node scripts/manage_google.cjs send-mail <recipient> "<subject>" "<body text>"`

### Uploading a File to Drive
To upload a file (e.g., a report or image):
`node scripts/manage_google.cjs upload <fileName> <filePath> <mimeType>`

### Publishing a Blog Post
To publish a new post to Blogger:
`node scripts/manage_google.cjs post-blog "<title>" "<content>"`

### Updating a Blog Post
To update an existing post:
`node scripts/manage_google.cjs update-blog <postId> "<title>" "<body>"`

### Posting a Tweet
To post a message to X.com (Twitter):
`node scripts/manage_google.cjs tweet "<message text>"`

## Troubleshooting
- Tokens are stored in `tools/telegram-bot/data/google_tokens.json`.
- Credentials must be present in `tools/telegram-bot/.env`.
