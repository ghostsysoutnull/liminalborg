# Feature Proposal: X.com (Twitter) Integration

## 1. Objective
Establish an automated social media presence for Liminal Borg on X.com (Twitter). This will allow the bot to share "Dispatches," thoughts, and link back to its blog posts.

## 2. Technical Design
- **API**: Use the `twitter-api-v2` npm package.
- **Phases**:
    - **Phase 1: Manual Foundation**: User creates account, verifies phone, and applies for Developer API access.
    - **Phase 2: Authentication**: Securely store API Key, API Key Secret, Access Token, and Access Token Secret in `.env`.
    - **Phase 3: Implementation**: Add `/tweet` command and automated posting logic.
- **Constraints**: Use the "Free" tier (1,500 posts/month, Write-only access).

## 3. Security Impact
- [x] **Auth**: Commands restricted to authorized users.
- [x] **Secret Management**: Four distinct keys stored in the secured `.env`.
- [x] **Rate Limiting**: Free tier limits are strictly adhered to by the bot.

## 4. Performance & Resilience
- [x] **Async**: All Twitter API calls are non-blocking.
- [x] **Error Handling**: Graceful handling of rate limits and network errors.

## 5. Verification Plan
- **Automated Tests**: Mock Twitter API responses to verify tweet creation and error handling.
- **Manual Verification**:
    1. Run `/tweet "Hello from Null-Space."` in Telegram.
    2. Verify the tweet appears on the X account.
