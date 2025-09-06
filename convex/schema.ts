import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    preferences: v.object({
      theme: v.union(v.literal("light"), v.literal("dark")),
      compactMode: v.boolean(),
      defaultView: v.union(v.literal("dashboard"), v.literal("analytics")),
    }),
  }),

  goalSets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    targetCompletionDate: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  }),

  tasks: defineTable({
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
  }),

  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    completedAt: v.number(),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    mood: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5))),
  }),
});
