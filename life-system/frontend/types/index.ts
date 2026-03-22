import type {
  InsightCategory,
  InsightSeverity,
  TaskType,
} from "@prisma/client";

export type DayStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUCCESSFUL" | "MISSED";

export interface DailyHabitItem {
  id: string;
  habitId: string | null;
  labelSnapshot: string;
  completed: boolean;
  order: number;
}

export interface DailyTaskItem {
  id: string;
  title: string;
  type: TaskType;
  completed: boolean;
  isCarriedOver: boolean;
  carriedOverFromDate: string | null;
  order: number;
}

export interface DailyRecordView {
  id: string;
  date: string;
  notes: string;
  mood: number | null;
  energy: number | null;
  winOfTheDay: string;
  whatSlowedMeDown: string;
  totalHabits: number;
  completedHabits: number;
  missedHabits: number;
  totalPersonalTasks: number;
  completedPersonalTasks: number;
  missedPersonalTasks: number;
  totalWorkTasks: number;
  completedWorkTasks: number;
  missedWorkTasks: number;
  habitsScore: number;
  personalScore: number;
  workScore: number;
  scorePercent: number;
  wasSuccessfulDay: boolean;
  currentStreakSnapshot: number;
  longestStreakSnapshot: number;
  dayStatus: DayStatus;
  totalCompletedItems: number;
  totalMissedItems: number;
  dailyHabits: DailyHabitItem[];
  dailyTasks: DailyTaskItem[];
}

export interface HabitView {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface DailyRecordSummary {
  id: string;
  date: string;
  scorePercent: number;
  wasSuccessfulDay: boolean;
  currentStreakSnapshot: number;
  longestStreakSnapshot: number;
  totalCompletedItems: number;
  totalMissedItems: number;
  habitsScore: number;
  personalScore: number;
  workScore: number;
  dayStatus: DayStatus;
}

export interface WeeklyReviewView {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalTrackedDays: number;
  averageScore: number;
  bestDay: string | null;
  worstDay: string | null;
  successCount: number;
  currentStreak: number;
  longestStreak: number;
  whatWentWell: string;
  whatWentBadly: string;
  whatNeedsToImprove: string;
  nextWeekGoals: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalTrackedDays: number;
  averageScore: number;
  successCount: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: DailyRecordSummary | null;
  worstDay: DailyRecordSummary | null;
  categoryCompletion: {
    habits: number;
    personal: number;
    work: number;
  };
  records: DailyRecordSummary[];
  review: WeeklyReviewView;
}

export interface InsightCardData {
  id: string;
  title: string;
  message: string;
  severity: InsightSeverity;
  category: InsightCategory;
  evidence: string;
  recommendation?: string;
}

export interface HabitStrength {
  label: string;
  completionRate: number;
  completed: number;
  total: number;
}

export interface RolloverTaskStat {
  title: string;
  count: number;
  type: TaskType;
}

export interface WeekdayPerformance {
  weekday: string;
  averageScore: number;
  trackedDays: number;
}

export interface InsightsView {
  insights: InsightCardData[];
  strongestHabits: HabitStrength[];
  weakestHabits: HabitStrength[];
  rolloverTasks: RolloverTaskStat[];
  completionTrend: {
    habits: number;
    personal: number;
    work: number;
  };
  weekdayPerformance: WeekdayPerformance[];
  successRate: number;
  mostProductiveDays: DailyRecordSummary[];
  lowestPerformanceDays: DailyRecordSummary[];
}

export interface DashboardStats {
  today: DailyRecordView;
  weeklyAverage: number;
  bestDayThisWeek: DailyRecordSummary | null;
  worstDayThisWeek: DailyRecordSummary | null;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  categoryCompletion: {
    habits: number;
    personal: number;
    work: number;
  };
  insightTeaser: InsightCardData | null;
}
