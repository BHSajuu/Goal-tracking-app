import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new goal set
export const createGoalSet = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    targetCompletionDate: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const goalSetId = await ctx.db.insert("goalSets", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      isActive: args.isActive,
      targetCompletionDate: args.targetCompletionDate,
      priority: args.priority,
    });
    return goalSetId;
  },
});

// Get all goal sets for a user
export const getGoalSetsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const goalSets = await ctx.db
      .query("goalSets")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    return goalSets;
  },
});

// Get a specific goal set
export const getGoalSet = query({
  args: { id: v.id("goalSets") },
  handler: async (ctx, args) => {
    const goalSet = await ctx.db.get(args.id);
    return goalSet;
  },
});

// Update a goal set
export const updateGoalSet = mutation({
  args: {
    id: v.id("goalSets"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      targetCompletionDate: v.optional(v.number()),
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return await ctx.db.get(args.id);
  },
});

// Delete a goal set
export const deleteGoalSet = mutation({
  args: { id: v.id("goalSets") },
  handler: async (ctx, args) => {
    // Delete all related tasks
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("goalSetId"), args.id))
      .collect();
    
    for (const task of tasks) {
      // Delete all completions for this task
      const completions = await ctx.db
        .query("taskCompletions")
        .filter((q) => q.eq(q.field("taskId"), task._id))
        .collect();
      
      for (const completion of completions) {
        await ctx.db.delete(completion._id);
      }
      
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.id);
  },
});
