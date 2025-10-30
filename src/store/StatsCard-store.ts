import type { LucideIcon } from "lucide-react";




export type StatCardItem = {
  title: string;
  value:  string | number;  
  description: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  descriptionColor: string;
};

type IconsParam = {
  Target: LucideIcon;
  Calendar: LucideIcon;
  BarChart3: LucideIcon;
  Award: LucideIcon;
};

type BuildParams = {
  activeGoalSets: Array<any>;
  todaysTasks: Array<any>;
  completionRate: number | string;
  completedTasks: Array<any>;
  totalTasks: number;
  analytics: { streakDays?: number } | any;
  goalSets: Array<any>;
  icons: IconsParam;
};

/**
 * Returns the array of StatCard items.
 * Pass in the runtime values from your Dashboard component to avoid TS scope errors.
 */
export default function buildStatsCardStore({
  activeGoalSets,
  todaysTasks,
  completionRate,
  completedTasks,
  totalTasks,
  analytics,
  goalSets,
  icons,
}: BuildParams): StatCardItem[] {
  const { Target, Calendar, BarChart3, Award } = icons;
  
  // Ensure icons are properly typed as LucideIcon
  const typedTarget = Target as LucideIcon;
  const typedCalendar = Calendar as LucideIcon;
  const typedBarChart3 = BarChart3 as LucideIcon;
  const typedAward = Award as LucideIcon;

  return [
    {
      title: "Active Goals",
      value: activeGoalSets.length,
      description:
        activeGoalSets.length === 0
          ? "No goals yet"
          : `${goalSets.length - activeGoalSets.length} paused`,
      icon: typedTarget,
      gradientFrom: "from-purple-500/5",
      gradientTo: "to-purple-600/10",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-50",
      iconColor: "text-purple-400",
      descriptionColor: "text-purple-200",
    },
    {
      title: "Tasks Today",
      value: todaysTasks.length,
      description: `${todaysTasks.filter((t) => t.isCompleted).length} completed`,
      icon: typedCalendar,
      gradientFrom: "from-cyan-500/5",
      gradientTo: "to-cyan-600/10",
      borderColor: "border-cyan-500/20",
      textColor: "text-cyan-50",
      iconColor: "text-cyan-400",
      descriptionColor: "text-cyan-200",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description: `${completedTasks.length} of ${totalTasks} tasks`,
      icon: typedBarChart3,
      gradientFrom: "from-emerald-500/5",
      gradientTo: "to-emerald-600/10",
      borderColor: "border-emerald-500/20",
      textColor: "text-emerald-50",
      iconColor: "text-emerald-400",
      descriptionColor: "text-emerald-200",
    },
    {
      title: "Current Streak",
      value: analytics?.streakDays ?? 0,
      description: `${analytics?.streakDays ?? 0} day streak`,
      icon: typedAward,
      gradientFrom: "from-amber-500/5",
      gradientTo: "to-amber-600/10",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-50",
      iconColor: "text-amber-400",
      descriptionColor: "text-amber-200",
    },
  ];
}
