import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const EMPTY_PROGRESS = { attempted: 0, correct: 0, streak: 0 };

export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("progress").first();
    return existing ?? EMPTY_PROGRESS;
  },
});

export const saveProgress = mutation({
  args: {
    attempted: v.number(),
    correct: v.number(),
    streak: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("progress").first();
    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt });
    } else {
      await ctx.db.insert("progress", { ...args, updatedAt });
    }
  },
});
