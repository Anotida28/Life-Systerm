import { CATEGORY_WEIGHTS, SUCCESS_THRESHOLD } from "./constants.js";

type HabitLike = {
  completed: boolean;
};

type TaskLike = {
  completed: boolean;
  type: "PERSONAL" | "WORK";
};

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
  dailyHabits: HabitLike[],
  dailyTasks: TaskLike[],
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
