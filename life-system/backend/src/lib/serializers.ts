import { toDateKey } from "./date.js";

type DayStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUCCESSFUL" | "MISSED";

type HabitLike = {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
};

type DailyHabitLike = {
  id: string;
  habitId: string | null;
  labelSnapshot: string;
  completed: boolean;
  order: number;
};

type DailyTaskLike = {
  id: string;
  title: string;
  type: "PERSONAL" | "WORK";
  completed: boolean;
  isCarriedOver: boolean;
  carriedOverFromDate: Date | null;
  order: number;
};

type DailyRecordLike = {
  id: string;
  date: Date;
  notes: string | null;
  mood: number | null;
  energy: number | null;
  winOfTheDay: string | null;
  whatSlowedMeDown: string | null;
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
};

type WeeklyReviewLike = {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  totalTrackedDays: number;
  averageScore: number;
  bestDay: Date | null;
  worstDay: Date | null;
  successCount: number;
  currentStreak: number;
  longestStreak: number;
  whatWentWell: string | null;
  whatWentBadly: string | null;
  whatNeedsToImprove: string | null;
  nextWeekGoals: string | null;
};

type DailyRecordWithItems = DailyRecordLike & {
  dailyHabits: DailyHabitLike[];
  dailyTasks: DailyTaskLike[];
};

export function serializeHabit(habit: HabitLike) {
  return {
    id: habit.id,
    name: habit.name,
    isActive: habit.isActive,
    order: habit.order,
    createdAt: habit.createdAt.toISOString(),
  };
}

export function serializeDailyRecord(record: DailyRecordWithItems) {
  const totalCompletedItems =
    record.completedHabits + record.completedPersonalTasks + record.completedWorkTasks;
  const totalMissedItems =
    record.missedHabits + record.missedPersonalTasks + record.missedWorkTasks;

  return {
    id: record.id,
    date: toDateKey(record.date),
    notes: record.notes ?? "",
    mood: record.mood,
    energy: record.energy,
    winOfTheDay: record.winOfTheDay ?? "",
    whatSlowedMeDown: record.whatSlowedMeDown ?? "",
    totalHabits: record.totalHabits,
    completedHabits: record.completedHabits,
    missedHabits: record.missedHabits,
    totalPersonalTasks: record.totalPersonalTasks,
    completedPersonalTasks: record.completedPersonalTasks,
    missedPersonalTasks: record.missedPersonalTasks,
    totalWorkTasks: record.totalWorkTasks,
    completedWorkTasks: record.completedWorkTasks,
    missedWorkTasks: record.missedWorkTasks,
    habitsScore: record.habitsScore,
    personalScore: record.personalScore,
    workScore: record.workScore,
    scorePercent: record.scorePercent,
    wasSuccessfulDay: record.wasSuccessfulDay,
    currentStreakSnapshot: record.currentStreakSnapshot,
    longestStreakSnapshot: record.longestStreakSnapshot,
    dayStatus: calculateDayStatus({
      date: record.date,
      scorePercent: record.scorePercent,
      totalCompletedItems,
    }),
    totalCompletedItems,
    totalMissedItems,
    dailyHabits: [...record.dailyHabits]
      .sort((left, right) => left.order - right.order)
      .map((habit) => ({
        id: habit.id,
        habitId: habit.habitId,
        labelSnapshot: habit.labelSnapshot,
        completed: habit.completed,
        order: habit.order,
      })),
    dailyTasks: [...record.dailyTasks]
      .sort((left, right) => {
        if (left.type !== right.type) {
          return left.type.localeCompare(right.type);
        }

        if (left.isCarriedOver !== right.isCarriedOver) {
          return left.isCarriedOver ? -1 : 1;
        }

        return left.order - right.order;
      })
      .map((task) => ({
        id: task.id,
        title: task.title,
        type: task.type,
        completed: task.completed,
        isCarriedOver: task.isCarriedOver,
        carriedOverFromDate: task.carriedOverFromDate
          ? toDateKey(task.carriedOverFromDate)
          : null,
        order: task.order,
      })),
  };
}

export function serializeDailyRecordSummary(record: DailyRecordLike) {
  const totalCompletedItems =
    record.completedHabits + record.completedPersonalTasks + record.completedWorkTasks;
  const totalMissedItems =
    record.missedHabits + record.missedPersonalTasks + record.missedWorkTasks;

  return {
    id: record.id,
    date: toDateKey(record.date),
    scorePercent: record.scorePercent,
    wasSuccessfulDay: record.wasSuccessfulDay,
    currentStreakSnapshot: record.currentStreakSnapshot,
    longestStreakSnapshot: record.longestStreakSnapshot,
    dayStatus: calculateDayStatus({
      date: record.date,
      scorePercent: record.scorePercent,
      totalCompletedItems,
    }),
    totalCompletedItems,
    totalMissedItems,
    habitsScore: record.habitsScore,
    personalScore: record.personalScore,
    workScore: record.workScore,
  };
}

export function serializeWeeklyReview(review: WeeklyReviewLike) {
  return {
    id: review.id,
    weekStart: toDateKey(review.weekStart),
    weekEnd: toDateKey(review.weekEnd),
    totalTrackedDays: review.totalTrackedDays,
    averageScore: review.averageScore,
    bestDay: review.bestDay ? toDateKey(review.bestDay) : null,
    worstDay: review.worstDay ? toDateKey(review.worstDay) : null,
    successCount: review.successCount,
    currentStreak: review.currentStreak,
    longestStreak: review.longestStreak,
    whatWentWell: review.whatWentWell ?? "",
    whatWentBadly: review.whatWentBadly ?? "",
    whatNeedsToImprove: review.whatNeedsToImprove ?? "",
    nextWeekGoals: review.nextWeekGoals ?? "",
  };
}

function calculateDayStatus(input: {
  date: Date;
  scorePercent: number;
  totalCompletedItems: number;
}): DayStatus {
  if (input.scorePercent >= 80) {
    return "SUCCESSFUL";
  }

  const isToday = toDateKey(input.date) === toDateKey(new Date());

  if (input.totalCompletedItems === 0 && isToday) {
    return "NOT_STARTED";
  }

  if (isToday) {
    return "IN_PROGRESS";
  }

  return "MISSED";
}
