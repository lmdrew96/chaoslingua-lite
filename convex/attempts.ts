import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logTutoringAttempt = mutation({
  args: {
    userId: v.id("users"),
    drillType: v.string(),
    chapter: v.number(),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("attempts", { ...args, timestamp: Date.now() });
  },
});

export const getWeakAreas = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const byDrillType = new Map<string, { chapter: number; attempted: number; correct: number }>();
    for (const a of attempts) {
      const existing = byDrillType.get(a.drillType) ?? { chapter: a.chapter, attempted: 0, correct: 0 };
      existing.attempted += 1;
      if (a.correct) existing.correct += 1;
      byDrillType.set(a.drillType, existing);
    }

    return [...byDrillType.entries()]
      .map(([drillType, stats]) => ({
        drillType,
        chapter: stats.chapter,
        attempted: stats.attempted,
        correct: stats.correct,
        accuracy: stats.correct / stats.attempted,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },
});
