import { describe, it, expect } from "vitest";
import { extractMentionedUserIds, renderMentionText } from "./mentionUtils";

describe("extractMentionedUserIds", () => {
  it("extracts single user id from mention", () => {
    const text = "Hello @[John Doe](abc-123) how are you?";
    expect(extractMentionedUserIds(text)).toEqual(["abc-123"]);
  });

  it("extracts multiple user ids", () => {
    const text = "@[Alice](id-1) and @[Bob](id-2) are here";
    expect(extractMentionedUserIds(text)).toEqual(["id-1", "id-2"]);
  });

  it("deduplicates repeated mentions", () => {
    const text = "@[Alice](id-1) said hi, then @[Alice](id-1) left";
    expect(extractMentionedUserIds(text)).toEqual(["id-1"]);
  });

  it("returns empty array for no mentions", () => {
    expect(extractMentionedUserIds("Just plain text")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(extractMentionedUserIds("")).toEqual([]);
  });

  it("handles mention at start and end", () => {
    const text = "@[Start](s1) middle @[End](e1)";
    expect(extractMentionedUserIds(text)).toEqual(["s1", "e1"]);
  });
});

describe("renderMentionText", () => {
  it("converts structured mention to display text", () => {
    expect(renderMentionText("Hi @[John Doe](abc-123)!")).toBe("Hi @John Doe!");
  });

  it("converts multiple mentions", () => {
    expect(renderMentionText("@[Alice](1) and @[Bob](2)")).toBe("@Alice and @Bob");
  });

  it("leaves plain text unchanged", () => {
    expect(renderMentionText("No mentions here")).toBe("No mentions here");
  });

  it("handles empty string", () => {
    expect(renderMentionText("")).toBe("");
  });
});
