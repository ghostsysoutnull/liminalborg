import { describe, it, expect, vi, beforeEach } from 'vitest';
const authMiddleware = require('../middlewares/auth');
const config = require('../config');

// Mock dependencies
vi.mock('../config/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.whitelist = ['12345'];
  });

  it('should allow authorized chatId from whitelist', async () => {
    const originalId = config.authorizedChatId;
    config.authorizedChatId = '12345';
    
    const ctx = {
      chat: { id: 12345 },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await authMiddleware(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
    
    config.authorizedChatId = originalId;
  });

  it('should deny unauthorized chatId not in whitelist', async () => {
    const originalId = config.authorizedChatId;
    config.authorizedChatId = '12345';

    const ctx = {
      chat: { id: 99999 },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await authMiddleware(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalled();
    
    config.authorizedChatId = originalId;
  });

  it('should deny if authorizedChatId is missing from config', async () => {
    const originalId = config.authorizedChatId;
    config.authorizedChatId = null;
    
    const ctx = {
      chat: { id: 12345 },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await authMiddleware(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('Access denied'));
    
    config.authorizedChatId = originalId;
  });
});
