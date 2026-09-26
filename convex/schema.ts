import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  progress: defineTable({
    attempted: v.number(),
    correct: v.number(),
    streak: v.number(),
    updatedAt: v.number(),
  }),

  // Multi-user accounts for the chaoslingua-lite-mcp tutoring server. Plaintext
  // bearer tokens are never stored — only their SHA-256 hash.
  users: defineTable({
    name: v.string(),
    keyHash: v.string(),
    createdAt: v.number(),
  }).index("by_keyHash", ["keyHash"]),

  // Tutoring-session tracking, written only by the chaoslingua-lite-mcp server —
  // deliberately separate from `progress` (the app's own drill stats). Lets a tutor
  // ask "what's she weak on" instead of just an aggregate accuracy percentage.
  // User-scoped so each tutoring account's weak areas stay isolated from others.
  attempts: defineTable({
    userId: v.id("users"),
    drillType: v.string(),
    // Suburani chapter, when the drill draws from one chapter's vocab.
    chapter: v.optional(v.number()),
    // Parse drills attribute each answer to the declension + case they tested.
    declension: v.optional(v.number()),
    case: v.optional(v.string()),
    correct: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_chapter", ["chapter"])
    .index("by_user", ["userId"]),
});
