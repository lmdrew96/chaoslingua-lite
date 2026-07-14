import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: { name: v.string(), keyHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { ...args, createdAt: Date.now() });
  },
});

async function sha256Hex(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const resolveApiKey = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const keyHash = await sha256Hex(args.token);
    const user = await ctx.db
      .query("users")
      .withIndex("by_keyHash", (q) => q.eq("keyHash", keyHash))
      .unique();
    if (!user) return null;
    return { userId: user._id, name: user.name };
  },
});
