import { describe, it, expect, vi } from "vitest";

// Mock supabase before importing the module
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { notifyMentionsIfNeeded } from "./mentionNotifier";

describe("notifyMentionsIfNeeded", () => {
  it("does nothing for empty text", async () => {
    await expect(
      notifyMentionsIfNeeded({
        text: "",
        senderUserId: "u1",
        senderName: "Test",
        contextType: "task",
        contextName: "My Task",
      })
    ).resolves.toBeUndefined();
  });

  it("does nothing for text without mentions", async () => {
    await expect(
      notifyMentionsIfNeeded({
        text: "Hello world, no mentions here",
        senderUserId: "u1",
        senderName: "Test",
        contextType: "task",
        contextName: "My Task",
      })
    ).resolves.toBeUndefined();
  });

  it("does not throw for text with mentions", async () => {
    await expect(
      notifyMentionsIfNeeded({
        text: "Hey @[John](user-123) check this",
        senderUserId: "u1",
        senderName: "Test",
        contextType: "task",
        contextName: "My Task",
        contextId: "task-1",
      })
    ).resolves.toBeUndefined();
  });
});
