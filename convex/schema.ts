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
    chapter: v.number(),
    correct: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_chapter", ["chapter"])
    .index("by_user", ["userId"]),
});
