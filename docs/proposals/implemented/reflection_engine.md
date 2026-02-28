# Feature Proposal: The Reflection Engine

## 1. Objective
Transform the bot from a passive tool into an active persona by implementing an autonomous background process that "reflects" on recent activity and generates immersive public dispatches.

## 2. Technical Design
- **Core Logic**: A new module `src/lib/reflection.js` that scans recent activity logs and prompts the Prime Intelligence (Gemini) to generate a "Borg Dispatch."
- **Translation Layer**: A built-in "Dark Dictionary" will ensure all technical terms (e.g., Google Drive, X.com) are replaced with Borg Protocol Aliases (e.g., The Deep Archive, The Sprawl-Feed) before publishing.
- **Scheduling**: Initial implementation will use a manual trigger command `/reflect`, with a Phase 2 goal of using `node-cron` for 24-hour cycles.
- **Staging/Approval Workflow**:
    1. Agent generates a reflection.
    2. Bot sends a preview to the Prime Operator (User) via Telegram.
    3. User clicks `[✅ Broadcast]` or `[❌ Purge]`.
    4. Upon approval, the bot autonomously posts to The Null-Space Terminal (Blogger) and The Sprawl-Feed (X.com).
- **Phase 3: Theme-based Reflections**: 
    - Support `/reflect <theme>` for pure persona-driven content without technical context.
    - Robust JSON harvesting from Prime Intelligence to handle noise and formatting inconsistencies.

## 3. Security Impact
- [x] **Obfuscation**: Technical details are stripped and aliased, preventing public exposure of the underlying stack.
- [x] **Control**: The Prime Operator must approve all autonomous content, preventing "hallucinated" or unwanted posts.

## 4. Performance & Resilience
- [x] **Non-blocking**: Reflection generation happens asynchronously.
- [x] **Staging**: Content is stored in a temporary state until approved or discarded.

## 5. Verification Plan
- **Manual Verification**:
    1. Invoke `/reflect`.
    2. Verify the Telegram preview uses the correct aliases (e.g., refers to Drive as The Reliquary).
    3. Click `Broadcast` and verify synchronization across the blog and social feed.
