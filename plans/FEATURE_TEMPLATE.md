# Feature Proposal: [Feature Name]

## 1. Objective
*What problem does this solve? How does the user interact with it?*

## 2. Technical Design
- **Entry Point**: (e.g., New command `/cmd`, new event handler)
- **Dependencies**: (e.g., New npm packages, external scripts)
- **State Changes**: (e.g., New environment variables, changes to `data/` storage)

## 3. Security Impact
- [ ] **Auth**: Is it protected by `authMiddleware`?
- [ ] **Input**: How is user input sanitized?
- [ ] **Secrets**: Are there new API keys required? (Add to `.env.template`)

## 4. Performance & Resilience
- [ ] **Async**: Are all operations non-blocking?
- [ ] **Timeouts**: Are all external calls capped?
- [ ] **Cleanup**: Does it create temporary files that need unlinking?

## 5. Verification Plan
- **Automated Tests**: Describe the test case to be added to `src/__tests__/`.
- **Manual Verification**: Step-by-step instructions to verify the feature in Telegram.
