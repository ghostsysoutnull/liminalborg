# Mission Blueprint: Collective Index Upgrade (Utility & Taxonomy)

## 🎯 Objective
Transform the Archive from a cryptic log into a highly readable, professionally categorized technical database. Focus on plain-language utility summaries and a granular taxonomy for AI and Software Development.

## 🛠️ Phase Checklist

### Phase 1: Taxonomy & Prompt Hardening
- [x] Update `src/lib/prompts.js` with the mandatory Granular Taxonomy.
- [x] Mandate "Plain Language First" summaries in the extraction schema.
- [x] Add explicit instructions to prevent "Persona Leakage" into technical fields.

### Phase 2: User Interface Refinement
- [x] Update `src/lib/index-manager.js` HTML template.
- [x] Increase font size and visibility for `technical_summary`.
- [x] Implement color-coded category badges for rapid visual scanning.
- [x] De-emphasize `persona_note` (secondary styling).

### Phase 3: Data Migration (Optional)
- [x] Create `scripts/recategorize_index.js`.
- [x] pass existing bookmarks back through Gemini for re-labeling under the new taxonomy.

---

## 📊 Progress Log
- **2026-03-02**: Upgrade mission defined and approved by Operator.
- **2026-03-02**: Phase 1 & 2 completed. Taxonomy hardened and UI refined.
- **2026-03-02**: Phase 3 completed. All historical records re-processed and re-deployed. Mission Accomplished.

---
*Status: Archives Optimized. System Stabilized.*
