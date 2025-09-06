import { query } from "./_generated/server";
import { v } from "convex/values";

// Get analytics data for a user
export const getUserAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const completions = await ctx.db
      .query("taskCompletions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const goalSets = await ctx.db
      .query("goalSets")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Calculate completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate streak (simplified - consecutive days with completions)
    const completionDates = completions.map(c => new Date(c.completedAt).toDateString());
    const uniqueDates = [...new Set(completionDates)].sort();
    
    let streakDays = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateString = currentDate.toDateString();
      if (uniqueDates.includes(dateString)) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate average completion time
    const completedTasksWithDuration = tasks.filter(task => task.actualDuration);
    const averageCompletionTime = completedTasksWithDuration.length > 0 
      ? completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length
      : 0;

    // Calculate productivity score (simplified)
    const productivityScore = Math.min(100, (completionRate * 0.4) + (streakDays * 2) + (averageCompletionTime > 0 ? 20 : 0));

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayCompletions = completions.filter(c => 
        new Date(c.completedAt).toISOString().split('T')[0] === dateString
      ).length;
      
      const dayTasks = tasks.filter(t => 
        t.scheduledDate && new Date(t.scheduledDate).toISOString().split('T')[0] === dateString
      ).length;

      weeklyProgress.push({
        date: dateString,
        completed: dayCompletions,
        total: Math.max(dayTasks, dayCompletions),
        
      });
    }

    // Goal set progress
    const goalSetProgress = goalSets.map(goalSet => {
      const goalSetTasks = tasks.filter(task => task.goalSetId === goalSet._id);
      const completedGoalSetTasks = goalSetTasks.filter(task => task.isCompleted);
      
      return {
        goalSetId: goalSet._id,
        name: goalSet.name,
        completionRate: goalSetTasks.length > 0 ? (completedGoalSetTasks.length / goalSetTasks.length) * 100 : 0,
        tasksCompleted: completedGoalSetTasks.length,
        totalTasks: goalSetTasks.length,
      };
    });

    return {
      completionRate,
      streakDays,
      totalTasksCompleted: completedTasks,
      averageCompletionTime,
      productivityScore,
      weeklyProgress,
      goalSetProgress,
    };
  },
});
