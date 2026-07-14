import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  progress: defineTable({
    attempted: v.number(),
    correct: v.number(),
    streak: v.number(),
    updatedAt: v.number(),
  }),

  // Tutoring-session tracking, written only by the chaoslingua-lite-mcp server —
  // deliberately separate from `progress` (the app's own drill stats). Lets a tutor
  // ask "what's she weak on" instead of just an aggregate accuracy percentage.
  attempts: defineTable({
    drillType: v.string(),
    chapter: v.number(),
    correct: v.boolean(),
    timestamp: v.number(),
  }).index("by_chapter", ["chapter"]),
});
