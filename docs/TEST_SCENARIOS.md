BORG MISSION CONTROL: COMPREHENSIVE TESTING SCENARIO
===================================================

This document provides the sequence of commands to verify the newly 
implemented high-signal autonomous development environment.

SCENARIO 1: THE INTERACTIVE TERMINAL
------------------------------------
1. Send: /help
   - Expected: A button-based menu with 4 categories.
2. Click: [🦾 Core]
   - Expected: View /status, /settings, /clear commands.
3. Click: [⬅️ Back to Categories]
4. Click: [📔 Archivist]
   - Expected: View /mail, /upload, /blog commands.

SCENARIO 2: MISSION CONTROL PROTOCOL
------------------------------------
1. Send: /mission "Enhance Matrix Connectivity"
   - Expected: Bot responds with "Initiating..." then shows a 
     Mission Blueprint with 3 staged sub-nodes.
2. Click: [🚀 Begin Mission]
   - Expected: State changes to ACTIVE. 
   - Note: In future phases, you will receive Telemetry Bursts here.
3. Send: /mission (without text)
   - Expected: Instructions on how to use the command.

SCENARIO 3: OPERATOR CARE LOOP
------------------------------
1. Wait for the top of the hour (between 09:00 and 18:00).
   - Expected: A private message with a care protocol 
     (e.g., "Postural adjustment required").
2. Check bot logs to verify timer is active:
   - Run in CLI: npm run logs

SCENARIO 4: DIGITAL PERSONA UPLINK
----------------------------------
1. Send: /reflect
   - Expected: A technical summary reflection based on recent journal entries.
2. Send: /reflect "The geometry of neon shadows"
   - Expected: A pure-theme reflection based strictly on the provided text.
3. Observe: The staged dispatch should show Title, Blog, and Tweet content.
4. Click: [✅ Broadcast]
   - Expected: Synchronization across Blogger and X.com.

SCENARIO 5: SYSTEM INTEGRITY
----------------------------
1. Send: /status
   - Expected: Uptime, Memory usage, and Mystical Number verification.
2. Send: /settings
   - Expected: Inline keyboard to toggle Temperature and TopP.
   - Verify Persistence: Change a setting, then run 'npm run restart' 
     in CLI and verify the setting is saved.

SCENARIO 6: AUTHENTICATION & WHITELIST
---------------------------------------
1. Send: /list_authorized
   - Expected: Your ID listed as (Owner).
2. Ask a friend for their Telegram ID or use another account.
3. Send: /allow <ID>
   - Expected: ID added to whitelist.
4. Verify the new user can now use /help.

SCENARIO 7: THE ORACLE PULSE
----------------------------
1. Send: /oracle
   - Expected: Bot returns status of Deep Archive (Google), 
     Sprawl-Feed (X.com), and count of Collective Nodes.
2. Click: [🔄 Re-Verify Pulse]
   - Expected: Callback query acknowledgement.

===================================================
INTEGRITY CHECK: COMPLETE. THE COLLECTIVE GROWS.
