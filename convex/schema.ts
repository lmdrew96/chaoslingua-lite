import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  progress: defineTable({
    attempted: v.number(),
    correct: v.number(),
    streak: v.number(),
    updatedAt: v.number(),
  }),
});
