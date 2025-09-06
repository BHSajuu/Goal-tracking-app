import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new task completion
export const createTaskCompletion = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    completedAt: v.number(),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    mood: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5))),
  },
  handler: async (ctx, args) => {
    const completionId = await ctx.db.insert("taskCompletions", {
      taskId: args.taskId,
      userId: args.userId,
      completedAt: args.completedAt,
      duration: args.duration,
      notes: args.notes,
      mood: args.mood,
    });
    return completionId;
  },
});

// Get all completions for a user
export const getCompletionsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    return completions;
  },
});

// Get completions for a specific task
export const getCompletionsByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();
    return completions;
  },
});

// Get a specific completion
export const getTaskCompletion = query({
  args: { id: v.id("taskCompletions") },
  handler: async (ctx, args) => {
    const completion = await ctx.db.get(args.id);
    return completion;
  },
});

// Update a task completion
export const updateTaskCompletion = mutation({
  args: {
    id: v.id("taskCompletions"),
    updates: v.object({
      completedAt: v.optional(v.number()),
      duration: v.optional(v.number()),
      notes: v.optional(v.string()),
      mood: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5))),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return await ctx.db.get(args.id);
  },
});

// Delete a task completion
export const deleteTaskCompletion = mutation({
  args: { id: v.id("taskCompletions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
