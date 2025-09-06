import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Export all user data
export const exportUserData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const goalSets = await ctx.db
      .query("goalSets")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      user: {
        ...user,
        id: user._id,
        createdAt: user._creationTime,
        updatedAt: user._creationTime, // Convex doesn't track updates, so we use creation time
      },
      goalSets: goalSets.map(gs => ({
        ...gs,
        id: gs._id,
        createdAt: gs._creationTime,
        updatedAt: gs._creationTime,
      })),
      tasks: tasks.map(task => ({
        ...task,
        id: task._id,
        createdAt: task._creationTime,
        updatedAt: task._creationTime,
      })),
      completions: completions.map(completion => ({
        ...completion,
        id: completion._id,
      })),
    };
  },
});

// Import user data
export const importUserData = mutation({
  args: {
    userId: v.id("users"),
    data: v.object({
      version: v.string(),
      exportDate: v.string(),
      user: v.object({
        name: v.string(),
        email: v.string(),
        preferences: v.object({
          theme: v.union(v.literal("light"), v.literal("dark")),
          compactMode: v.boolean(),
          defaultView: v.union(v.literal("dashboard"), v.literal("analytics")),
        }),
      }),
      goalSets: v.array(v.object({
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        icon: v.optional(v.string()),
        isActive: v.boolean(),
        targetCompletionDate: v.optional(v.number()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      })),
      tasks: v.array(v.object({
        goalSetId: v.string(), // This will be mapped to new IDs
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
      })),
      completions: v.array(v.object({
        taskId: v.string(), // This will be mapped to new IDs
        completedAt: v.number(),
        duration: v.optional(v.number()),
        notes: v.optional(v.string()),
        mood: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5))),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const idMap = new Map<string, string>();

    // Import goal sets
    const importedGoalSets = [];
    for (const goalSetData of args.data.goalSets) {
      const goalSetId = await ctx.db.insert("goalSets", {
        userId: args.userId,
        name: goalSetData.name,
        description: goalSetData.description,
        color: goalSetData.color,
        icon: goalSetData.icon,
        isActive: goalSetData.isActive,
        targetCompletionDate: goalSetData.targetCompletionDate,
        priority: goalSetData.priority,
      });
      importedGoalSets.push(goalSetId);
    }

    // Import tasks with updated goal set IDs
    const importedTasks = [];
    for (let i = 0; i < args.data.tasks.length; i++) {
      const taskData = args.data.tasks[i];
      const goalSetId = importedGoalSets[i % importedGoalSets.length]; // Simple mapping
      
      const taskId = await ctx.db.insert("tasks", {
        goalSetId: goalSetId,
        userId: args.userId,
        title: taskData.title,
        description: taskData.description,
        isCompleted: taskData.isCompleted,
        priority: taskData.priority,
        estimatedDuration: taskData.estimatedDuration,
        actualDuration: taskData.actualDuration,
        scheduledDate: taskData.scheduledDate,
        completedAt: taskData.completedAt,
        recurrence: taskData.recurrence,
        tags: taskData.tags,
      });
      importedTasks.push(taskId);
    }

    // Import completions with updated task IDs
    const importedCompletions = [];
    for (let i = 0; i < args.data.completions.length; i++) {
      const completionData = args.data.completions[i];
      const taskId = importedTasks[i % importedTasks.length]; // Simple mapping
      
      const completionId = await ctx.db.insert("taskCompletions", {
        taskId: taskId,
        userId: args.userId,
        completedAt: completionData.completedAt,
        duration: completionData.duration,
        notes: completionData.notes,
        mood: completionData.mood,
      });
      importedCompletions.push(completionId);
    }

    return {
      success: true,
      message: "Data imported successfully",
      imported: {
        goalSets: importedGoalSets.length,
        tasks: importedTasks.length,
        completions: importedCompletions.length,
      },
    };
  },
});
