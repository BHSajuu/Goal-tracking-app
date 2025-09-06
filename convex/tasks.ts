import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new task
export const createTask = mutation({
  args: {
    goalSetId: v.id("goalSets"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    isCompleted: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    estimatedDuration: v.optional(v.number()),
    actualDuration: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    recurrence: v.optional(v.object({
      type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      daysOfWeek: v.optional(v.array(v.number())),
      endDate: v.optional(v.number()),
    })),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      goalSetId: args.goalSetId,
      userId: args.userId,
      title: args.title,
      description: args.description,
      isCompleted: args.isCompleted,
      priority: args.priority,
      estimatedDuration: args.estimatedDuration,
      actualDuration: args.actualDuration,
      scheduledDate: args.scheduledDate,
      completedAt: args.completedAt,
      recurrence: args.recurrence,
      tags: args.tags,
    });
    return taskId;
  },
});

// Get all tasks for a user
export const getTasksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    return tasks;
  },
});

// Get tasks by goal set
export const getTasksByGoalSet = query({
  args: { goalSetId: v.id("goalSets") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("goalSetId"), args.goalSetId))
      .collect();
    return tasks;
  },
});

// Get a specific task
export const getTask = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    return task;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      isCompleted: v.optional(v.boolean()),
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      estimatedDuration: v.optional(v.number()),
      actualDuration: v.optional(v.number()),
      scheduledDate: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      recurrence: v.optional(v.object({
        type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
        interval: v.number(),
        daysOfWeek: v.optional(v.array(v.number())),
        endDate: v.optional(v.number()),
      })),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return await ctx.db.get(args.id);
  },
});

// Delete a task
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    // Delete all completions for this task
    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("taskId"), args.id))
      .collect();
    
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    await ctx.db.delete(args.id);
  },
});
