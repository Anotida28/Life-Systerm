import type {
  DailyHabit,
  DailyRecord,
  DailyTask,
  Habit,
  WeeklyReview,
} from "@prisma/client";

import { calculateDayStatus } from "@/lib/domain/scoring";
import { toDateKey } from "@/lib/date";
import type {
  DailyRecordSummary,
  DailyRecordView,
  HabitView,
  WeeklyReviewView,
} from "@/types";

type DailyRecordWithItems = DailyRecord & {
  dailyHabits: DailyHabit[];
  dailyTasks: DailyTask[];
};

export function serializeDailyRecord(record: DailyRecordWithItems): DailyRecordView {
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

export function serializeDailyRecordSummary(record: DailyRecord): DailyRecordSummary {
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
    totalCompletedItems,
    totalMissedItems,
    habitsScore: record.habitsScore,
    personalScore: record.personalScore,
    workScore: record.workScore,
    dayStatus: calculateDayStatus({
      date: record.date,
      scorePercent: record.scorePercent,
      totalCompletedItems,
    }),
  };
}

export function serializeHabit(habit: Habit): HabitView {
  return {
    id: habit.id,
    name: habit.name,
    isActive: habit.isActive,
    order: habit.order,
    createdAt: habit.createdAt.toISOString(),
  };
}

export function serializeWeeklyReview(review: WeeklyReview): WeeklyReviewView {
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
