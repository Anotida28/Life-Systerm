import { prisma } from "@/lib/prisma";
import { getWeekRange } from "@/lib/date";
import { getRecordsBetween } from "@/lib/domain/daily-record";
import { serializeDailyRecordSummary, serializeWeeklyReview } from "@/lib/serializers";
import { average } from "@/lib/utils";
import type { WeeklySummary } from "@/types";

export async function getWeeklySummary(referenceDate = new Date()): Promise<WeeklySummary> {
  const { weekStart, weekEnd } = getWeekRange(referenceDate);
  const records = await getRecordsBetween(weekStart, weekEnd);
  const summaries = records.map(serializeDailyRecordSummary);
  const bestDay = [...summaries].sort((left, right) => right.scorePercent - left.scorePercent)[0] ?? null;
  const worstDay = [...summaries].sort((left, right) => left.scorePercent - right.scorePercent)[0] ?? null;
  const latestRecord = summaries[summaries.length - 1] ?? null;

  const weeklyReview = await prisma.weeklyReview.upsert({
    where: { weekStart },
    update: {
      weekEnd,
      totalTrackedDays: records.length,
      averageScore: average(records.map((record) => record.scorePercent)),
      bestDay: bestDay ? weekStartFromSummary(bestDay.date) : null,
      worstDay: worstDay ? weekStartFromSummary(worstDay.date) : null,
      successCount: records.filter((record) => record.wasSuccessfulDay).length,
      currentStreak: latestRecord?.currentStreakSnapshot ?? 0,
      longestStreak: Math.max(0, ...records.map((record) => record.longestStreakSnapshot)),
    },
    create: {
      weekStart,
      weekEnd,
      totalTrackedDays: records.length,
      averageScore: average(records.map((record) => record.scorePercent)),
      bestDay: bestDay ? weekStartFromSummary(bestDay.date) : null,
      worstDay: worstDay ? weekStartFromSummary(worstDay.date) : null,
      successCount: records.filter((record) => record.wasSuccessfulDay).length,
      currentStreak: latestRecord?.currentStreakSnapshot ?? 0,
      longestStreak: Math.max(0, ...records.map((record) => record.longestStreakSnapshot)),
    },
  });

  return {
    weekStart: serializeWeeklyReview(weeklyReview).weekStart,
    weekEnd: serializeWeeklyReview(weeklyReview).weekEnd,
    totalTrackedDays: weeklyReview.totalTrackedDays,
    averageScore: weeklyReview.averageScore,
    successCount: weeklyReview.successCount,
    currentStreak: weeklyReview.currentStreak,
    longestStreak: weeklyReview.longestStreak,
    bestDay,
    worstDay,
    categoryCompletion: {
      habits: average(records.map((record) => record.habitsScore * 100)),
      personal: average(records.map((record) => record.personalScore * 100)),
      work: average(records.map((record) => record.workScore * 100)),
    },
    records: summaries,
    review: serializeWeeklyReview(weeklyReview),
  };
}

function weekStartFromSummary(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function updateWeeklyReview(input: {
  reviewId: string;
  whatWentWell: string;
  whatWentBadly: string;
  whatNeedsToImprove: string;
  nextWeekGoals: string;
}) {
  const review = await prisma.weeklyReview.update({
    where: { id: input.reviewId },
    data: {
      whatWentWell: input.whatWentWell,
      whatWentBadly: input.whatWentBadly,
      whatNeedsToImprove: input.whatNeedsToImprove,
      nextWeekGoals: input.nextWeekGoals,
    },
  });

  return serializeWeeklyReview(review);
}
