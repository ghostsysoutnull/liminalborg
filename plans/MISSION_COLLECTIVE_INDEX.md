# Mission Blueprint: The Collective Index (Bookmarks)

## 🎯 Objective
Transform the Liminal Borg into an active data archivist by automatically bookmarking, categorizing, and synchronizing URIs into a local JSON database and a visual HTML Dashboard on Google Drive.

## 🛠️ Phase Checklist

### Phase 1: Metadata Extraction
- [x] Update `src/lib/prompts.js` with the `BOOKMARK_EXTRACTION` schema.
- [x] Enhance `src/lib/gemini.js` to handle dual-payload (Text + JSON) responses.

### Phase 2: Database Management
- [x] Create `src/lib/index-manager.js`.
- [x] Logic for appending to `nexus/research/COLLECTIVE_INDEX.json`.
- [x] HTML Rendering Engine with "Borg Terminal" aesthetic for `nexus/research/COLLECTIVE_INDEX.html`.

### Phase 3: Google Drive Stateful Sync
- [x] Update `src/lib/google.js` to support `updateFile` via specific File ID.
- [x] Logic to persist the Drive `fileId` in `data/drive_refs.json`.

### Phase 4: System Integration
- [x] Detect URIs in `src/events/index.js:onText`.
- [x] Trigger the full Ingest -> Render -> Uplink loop.
- [x] Add Telegram confirmation message.

---

## 📊 Progress Log
- **2026-03-02**: Strategy approved by Operator. Mission Initialized.
- **2026-03-02**: Mission Accomplished. The Collective Index is operational.

---
*Status: Synchronizing Staging Area. Ready for Phase 1.*
