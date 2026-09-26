import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logTutoringAttempt = mutation({
  args: {
    userId: v.id("users"),
    drillType: v.string(),
    chapter: v.optional(v.number()),
    declension: v.optional(v.number()),
    case: v.optional(v.string()),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("attempts", { ...args, timestamp: Date.now() });
  },
});

interface WeakAreaStats {
  drillType: string;
  declension?: number;
  case?: string;
  attempted: number;
  correct: number;
}

// Grouped by drill type, and further by declension + case where the drill records
// them — "parse, 3rd declension genitive" is a weak spot; "parse" alone isn't useful.
export const getWeakAreas = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groups = new Map<string, WeakAreaStats>();
    for (const a of attempts) {
      const key = [a.drillType, a.declension ?? "", a.case ?? ""].join("|");
      const existing = groups.get(key) ?? {
        drillType: a.drillType,
        declension: a.declension,
        case: a.case,
        attempted: 0,
        correct: 0,
      };
      existing.attempted += 1;
      if (a.correct) existing.correct += 1;
      groups.set(key, existing);
    }

    return [...groups.values()]
      .map((stats) => ({ ...stats, accuracy: stats.correct / stats.attempted }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },
});
