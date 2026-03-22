import type { DailyHabit, DailyTask } from "@prisma/client";

import { CATEGORY_WEIGHTS, SUCCESS_THRESHOLD } from "@/lib/constants";
import { isToday, parseDateKey } from "@/lib/date";
import type { DailyRecordView, DayStatus } from "@/types";

export function calculateCategoryScores(input: {
  totalHabits: number;
  completedHabits: number;
  totalPersonalTasks: number;
  completedPersonalTasks: number;
  totalWorkTasks: number;
  completedWorkTasks: number;
}) {
  const habitsScore =
    input.totalHabits === 0 ? 1 : input.completedHabits / input.totalHabits;
  const personalScore =
    input.totalPersonalTasks === 0
      ? 1
      : input.completedPersonalTasks / input.totalPersonalTasks;
  const workScore =
    input.totalWorkTasks === 0 ? 1 : input.completedWorkTasks / input.totalWorkTasks;

  return {
    habitsScore,
    personalScore,
    workScore,
  };
}

export function calculateOverallScore(scores: {
  habitsScore: number;
  personalScore: number;
  workScore: number;
}) {
  return Math.round(
    (scores.habitsScore * CATEGORY_WEIGHTS.habits +
      scores.personalScore * CATEGORY_WEIGHTS.personal +
      scores.workScore * CATEGORY_WEIGHTS.work) *
      100,
  );
}

export function getMetricsFromCollections(
  dailyHabits: Pick<DailyHabit, "completed">[],
  dailyTasks: Pick<DailyTask, "completed" | "type">[],
) {
  const personalTasks = dailyTasks.filter((task) => task.type === "PERSONAL");
  const workTasks = dailyTasks.filter((task) => task.type === "WORK");

  const totalHabits = dailyHabits.length;
  const completedHabits = dailyHabits.filter((habit) => habit.completed).length;
  const totalPersonalTasks = personalTasks.length;
  const completedPersonalTasks = personalTasks.filter((task) => task.completed).length;
  const totalWorkTasks = workTasks.length;
  const completedWorkTasks = workTasks.filter((task) => task.completed).length;

  const { habitsScore, personalScore, workScore } = calculateCategoryScores({
    totalHabits,
    completedHabits,
    totalPersonalTasks,
    completedPersonalTasks,
    totalWorkTasks,
    completedWorkTasks,
  });

  const scorePercent = calculateOverallScore({
    habitsScore,
    personalScore,
    workScore,
  });

  return {
    totalHabits,
    completedHabits,
    missedHabits: totalHabits - completedHabits,
    totalPersonalTasks,
    completedPersonalTasks,
    missedPersonalTasks: totalPersonalTasks - completedPersonalTasks,
    totalWorkTasks,
    completedWorkTasks,
    missedWorkTasks: totalWorkTasks - completedWorkTasks,
    habitsScore,
    personalScore,
    workScore,
    scorePercent,
    wasSuccessfulDay: scorePercent >= SUCCESS_THRESHOLD,
  };
}

export function getStreakSnapshots(records: Array<{ wasSuccessfulDay: boolean }>) {
  let currentStreak = 0;
  let longestStreak = 0;

  return records.map((record) => {
    if (record.wasSuccessfulDay) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    return {
      currentStreakSnapshot: currentStreak,
      longestStreakSnapshot: longestStreak,
    };
  });
}

export function calculateDayStatus(input: {
  date: Date;
  scorePercent: number;
  totalCompletedItems: number;
}): DayStatus {
  if (input.scorePercent >= SUCCESS_THRESHOLD) {
    return "SUCCESSFUL";
  }

  if (input.totalCompletedItems === 0 && isToday(input.date)) {
    return "NOT_STARTED";
  }

  if (isToday(input.date)) {
    return "IN_PROGRESS";
  }

  return "MISSED";
}

export function syncDailyRecordViewMetrics(record: DailyRecordView): DailyRecordView {
  const personalTasks = record.dailyTasks.filter((task) => task.type === "PERSONAL");
  const workTasks = record.dailyTasks.filter((task) => task.type === "WORK");
  const completedHabits = record.dailyHabits.filter((habit) => habit.completed).length;
  const completedPersonalTasks = personalTasks.filter((task) => task.completed).length;
  const completedWorkTasks = workTasks.filter((task) => task.completed).length;

  const { habitsScore, personalScore, workScore } = calculateCategoryScores({
    totalHabits: record.dailyHabits.length,
    completedHabits,
    totalPersonalTasks: personalTasks.length,
    completedPersonalTasks,
    totalWorkTasks: workTasks.length,
    completedWorkTasks,
  });

  const scorePercent = calculateOverallScore({
    habitsScore,
    personalScore,
    workScore,
  });

  const totalCompletedItems =
    completedHabits + completedPersonalTasks + completedWorkTasks;
  const totalMissedItems =
    record.dailyHabits.length -
    completedHabits +
    personalTasks.length -
    completedPersonalTasks +
    workTasks.length -
    completedWorkTasks;

  return {
    ...record,
    totalHabits: record.dailyHabits.length,
    completedHabits,
    missedHabits: record.dailyHabits.length - completedHabits,
    totalPersonalTasks: personalTasks.length,
    completedPersonalTasks,
    missedPersonalTasks: personalTasks.length - completedPersonalTasks,
    totalWorkTasks: workTasks.length,
    completedWorkTasks,
    missedWorkTasks: workTasks.length - completedWorkTasks,
    habitsScore,
    personalScore,
    workScore,
    scorePercent,
    wasSuccessfulDay: scorePercent >= SUCCESS_THRESHOLD,
    totalCompletedItems,
    totalMissedItems,
    dayStatus: calculateDayStatus({
      date: parseDateKey(record.date),
      scorePercent,
      totalCompletedItems,
    }),
  };
}
