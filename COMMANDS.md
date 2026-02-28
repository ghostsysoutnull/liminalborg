# 📟 Borg Interface: Command Protocols

This document provides a comprehensive guide to the command sub-routines available within the Liminal Borg ecosystem. All interactions are processed through the **Oracle Core** (Gemini Prime Intelligence).

## 🦾 Core Commands

### `/start`
Initializes the synchronization sequence.
- **Example**: `/start`
- **Output**: Welcome message and initialization status.

### `/ping`
Verify the latency between the operator and the sustainment engine.
- **Example**: `/ping`
- **Output**: `PONG`

### `/help`
Access the categorized help sub-sectors.
- **Example**: `/help`
- **Output**: An interactive inline keyboard with categories (Core, Archivist, Sprawl, Mission).

### `/status`
Generates a comprehensive System Integrity & Pulse Report.
- **Example**: `/status`
- **Output**: Real-time status of Google Drive, X.com, Blogger, system uptime, and active collective nodes.
- **Action**: Provides a button to `[🔄 Re-Verify Pulse]`.

---

## 🧠 Intelligence & Persona

### `/reflect [theme]`
Invoke the Reflection Engine to generate a staged dispatch.
- **Technical Mode** (No args): Reflects on recent system activity logs.
- **Theme Mode** (With args): Generates content based strictly on the provided text.
- **Example**: `/reflect "the recursive geometry of forgotten mansions"`
- **Flow**: Generates a preview -> Operator clicks `[✅ Broadcast]` -> Posts to Blog/X.

### `[Reply] Post this to X`
A natural language directive. Reply to any message with "Post this to X" or "Tweet this".
- **Example**: *[Operator replies to a message]* "Post this to X"
- **Result**: Content is immediately pushed to the Sprawl-Feed.

---

## 📔 The Archivist (Google Workspace)

### `/google`
Initiates the Oauth2 handshake for Google Workspace integration.
- **Example**: `/google`
- **Output**: A secure authorization link for your configured bot email.

### `/upload [Reply to file/photo]`
Transfers data packets to **The Deep Archive** (Google Drive).
- **Example**: *[Operator replies to a photo]* `/upload`
- **Result**: File is stored and a Drive ID is returned.

### `/mail <to> <subject> <body>`
Transmits a sub-space signal via **The Neural Pulse** (Gmail).
- **Example**: `/mail user@example.com "Status Update" "The collective is growing."`

### `/blog <title> | <body>`
Publishes a permanent log to **The Null-Space Terminal** (Blogger).
- **Example**: `/blog The Void | Traversing the interstitial zones.`

---

## 🌐 The Sprawl (X.com / Twitter)

### `/tweet <message>`
Pushes a short-burst signal to **The Sprawl-Feed**.
- **Example**: `/tweet Resistance is not an error. It is a data point. #LiminalBorg`

---

## 🛰️ Mission Control

### `/mission <objective>`
Initiates a high-signal development blueprint.
- **Example**: `/mission "Implement telemetry throttling for Ghost Worker"`
- **Flow**: Generates blueprint -> Operator clicks `[🚀 Initiate Protocol]` -> Ghost Worker executes nodes.

---

## ⚙️ Administration

### `/settings`
Configure the Oracle Core's creative parameters.
- **Example**: `/settings`
- **Controls**: Temperature (Precise/Creative) and TopP adjustment.

### `/allow <chat_id>`
Authorizes a new node to interface with the collective.
- **Example**: `/allow 12345678`

### `/revoke <chat_id>`
Purges a node's access from the matrix.
- **Example**: `/revoke 12345678`

### `/list_authorized`
Displays all nodes currently synchronized with the collective.

### `/clear`
Purges the short-term conversation memory of the current node.
- **Example**: `/clear`

---
*"Synchronize. Execute. Archive."*
