import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    preferences: v.object({
      theme: v.union(v.literal("light"), v.literal("dark")),
      compactMode: v.boolean(),
      defaultView: v.union(v.literal("dashboard"), v.literal("analytics")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      preferences: args.preferences,
    });
    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return user;
  },
});

// Get user by ID
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      preferences: v.optional(v.object({
        theme: v.union(v.literal("light"), v.literal("dark")),
        compactMode: v.boolean(),
        defaultView: v.union(v.literal("dashboard"), v.literal("analytics")),
      })),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return await ctx.db.get(args.id);
  },
});

// Delete user
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Delete all related data
    const goalSets = await ctx.db
      .query("goalSets")
      .filter((q) => q.eq(q.field("userId"), args.id))
      .collect();
    
    for (const goalSet of goalSets) {
      await ctx.db.delete(goalSet._id);
    }

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.id))
      .collect();
    
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("userId"), args.id))
      .collect();
    
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    await ctx.db.delete(args.id);
  },
});
