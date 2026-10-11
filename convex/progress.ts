import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const EMPTY_PROGRESS = { attempted: 0, correct: 0, streak: 0 };

// With a userId, that user's stats. Without one, the shared pre-accounts row, which
// the MCP's cll_get_progress still asks for until it passes its user.
export const getProgress = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return existing ?? EMPTY_PROGRESS;
  },
});

export const saveProgress = mutation({
  args: {
    userId: v.id("users"),
    attempted: v.number(),
    correct: v.number(),
    streak: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt });
    } else {
      await ctx.db.insert("progress", { ...args, updatedAt });
    }
  },
});
