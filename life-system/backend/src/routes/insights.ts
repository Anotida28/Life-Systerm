import type { FastifyInstance } from "fastify";
import { InsightCategory, InsightSeverity } from "@prisma/client";

import { resolveUserIdFromRequest } from "../lib/auth.js";
import { MAX_INSIGHT_RECORDS, SUCCESS_THRESHOLD } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { successResponse } from "../lib/response.js";
import { serializeDailyRecordSummary } from "../lib/serializers.js";
import { average } from "../lib/utils.js";

async function loadInsightDataset(userId: string) {
  const recentRecords = await prisma.dailyRecord.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: MAX_INSIGHT_RECORDS,
    include: {
      dailyHabits: true,
      dailyTasks: true,
    },
  });

  return recentRecords.reverse();
}

function getHabitStrengthData(records: Awaited<ReturnType<typeof loadInsightDataset>>) {
  const recentSeven = records.slice(-7);
  const habitMap = new Map<string, { completed: number; total: number }>();

  for (const record of recentSeven) {
    for (const habit of record.dailyHabits) {
      const current = habitMap.get(habit.labelSnapshot) ?? { completed: 0, total: 0 };
      current.total += 1;
      current.completed += habit.completed ? 1 : 0;
      habitMap.set(habit.labelSnapshot, current);
    }
  }

  const ranked = Array.from(habitMap.entries())
    .map(([label, value]) => ({
      label,
      completionRate: value.total === 0 ? 0 : Math.round((value.completed / value.total) * 100),
      completed: value.completed,
      total: value.total,
    }))
    .sort((left, right) => right.completionRate - left.completionRate);

  return {
    strongestHabits: ranked.slice(0, 3),
    weakestHabits: [...ranked].reverse().slice(0, 3),
  };
}

function getRolloverTasks(records: Awaited<ReturnType<typeof loadInsightDataset>>) {
  const taskMap = new Map<string, { count: number; type: "PERSONAL" | "WORK" }>();

  for (const record of records) {
    for (const task of record.dailyTasks.filter((entry) => entry.isCarriedOver)) {
      const current = taskMap.get(task.title) ?? {
        count: 0,
        type: task.type,
      };
      current.count += 1;
      taskMap.set(task.title, current);
    }
  }

  return Array.from(taskMap.entries())
    .map(([title, value]) => ({
      title,
      count: value.count,
      type: value.type,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function getWeekdayPerformance(records: Awaited<ReturnType<typeof loadInsightDataset>>) {
  const weekdayMap = new Map<string, number[]>();

  for (const record of records) {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Harare",
      weekday: "long",
    }).format(record.date);
    const existing = weekdayMap.get(weekday) ?? [];
    existing.push(record.scorePercent);
    weekdayMap.set(weekday, existing);
  }

  return Array.from(weekdayMap.entries())
    .map(([weekday, scores]) => ({
      weekday,
      averageScore: average(scores),
      trackedDays: scores.length,
    }))
    .sort((left, right) => right.averageScore - left.averageScore);
}

function generateRuleBasedInsights(
  records: Awaited<ReturnType<typeof loadInsightDataset>>,
  strongestHabits: Array<{ label: string; completionRate: number; completed: number; total: number }>,
  weakestHabits: Array<{ label: string; completionRate: number; completed: number; total: number }>,
  rolloverTasks: Array<{ title: string; count: number; type: "PERSONAL" | "WORK" }>,
  weekdayPerformance: Array<{ weekday: string; averageScore: number; trackedDays: number }>,
) {
  const insights: Array<{
    id: string;
    title: string;
    message: string;
    severity: InsightSeverity;
    category: InsightCategory;
    evidence: string;
    recommendation?: string;
  }> = [];

  const lastSeven = records.slice(-7);
  const previousSeven = records.slice(-14, -7);
  const recentAverage = average(lastSeven.map((record) => record.scorePercent));
  const previousAverage = average(previousSeven.map((record) => record.scorePercent));
  const personalAverage = average(records.map((record) => record.personalScore * 100));
  const workAverage = average(records.map((record) => record.workScore * 100));
  const rolloverWorkload = average(
    records.map(
      (record) =>
        record.dailyTasks.filter((task) => task.type === "WORK" && task.isCarriedOver).length,
    ),
  );

  if (
    weakestHabits[0] &&
    weakestHabits[0].total >= 4 &&
    weakestHabits[0].total - weakestHabits[0].completed > 3
  ) {
    insights.push({
      id: `weak-habit-${weakestHabits[0].label}`,
      title: `${weakestHabits[0].label} is slipping`,
      message: `${weakestHabits[0].label} has been missed ${weakestHabits[0].total - weakestHabits[0].completed} times in the last seven tracked days.`,
      severity: InsightSeverity.HIGH,
      category: InsightCategory.HABIT,
      evidence: `${weakestHabits[0].completionRate}% completion across ${weakestHabits[0].total} recent appearances.`,
      recommendation: `Reduce friction around ${weakestHabits[0].label.toLowerCase()} or anchor it to an earlier part of the day.`,
    });
  }

  if (personalAverage + 12 < workAverage) {
    insights.push({
      id: "balance-personal-vs-work",
      title: "Personal tasks are lagging behind work",
      message: "Your work completion is consistently outpacing your personal execution.",
      severity: InsightSeverity.MEDIUM,
      category: InsightCategory.BALANCE,
      evidence: `Personal completion averages ${personalAverage}%, while work completion averages ${workAverage}%.`,
      recommendation: "Cap work tasks slightly earlier so personal commitments keep a protected slot.",
    });
  }

  if (rolloverWorkload >= 1.5) {
    insights.push({
      id: "rollover-workload",
      title: "Work tasks are overloading your day",
      message:
        "Repeated work rollovers suggest your daily load is heavier than your actual finishing capacity.",
      severity: InsightSeverity.HIGH,
      category: InsightCategory.WORKLOAD,
      evidence: `You are carrying over an average of ${rolloverWorkload.toFixed(1)} work tasks per tracked day.`,
      recommendation: "Reduce planned work tasks tomorrow and separate must-finish work from nice-to-have work.",
    });
  }

  if (recentAverage >= previousAverage + 5 && lastSeven.length >= 4) {
    insights.push({
      id: "score-trend-improving",
      title: "Your weekly average is improving",
      message:
        "Recent performance is moving in the right direction, which usually means your system is getting easier to execute.",
      severity: InsightSeverity.LOW,
      category: InsightCategory.TREND,
      evidence: `Last 7 days average ${recentAverage}% vs previous 7 days ${previousAverage}%.`,
      recommendation: "Keep the same daily load for another week before you increase ambition.",
    });
  }

  const averageTaskLoad = average(
    records.map((record) => record.totalPersonalTasks + record.totalWorkTasks),
  );
  const averageCompletion = average(
    records.map((record) => {
      const totalTasks = record.totalPersonalTasks + record.totalWorkTasks;
      const completedTasks = record.completedPersonalTasks + record.completedWorkTasks;
      return totalTasks === 0 ? 100 : Math.round((completedTasks / totalTasks) * 100);
    }),
  );

  if (averageTaskLoad >= 5 && averageCompletion <= 55) {
    insights.push({
      id: "task-load-limit",
      title: "You may be planning more tasks than you can finish",
      message:
        "A fuller task list is not translating into completed work, which usually means the plan needs a tighter ceiling.",
      severity: InsightSeverity.MEDIUM,
      category: InsightCategory.PRODUCTIVITY,
      evidence: `Average flexible task load is ${averageTaskLoad} items with only ${averageCompletion}% completed.`,
      recommendation: "Try setting a daily cap of 3 essential flexible tasks before adding stretch items.",
    });
  }

  if (weekdayPerformance[0]) {
    insights.push({
      id: `best-weekday-${weekdayPerformance[0].weekday}`,
      title: `Your strongest day is ${weekdayPerformance[0].weekday}`,
      message:
        "That weekday is currently producing the highest average score in your recent data.",
      severity: InsightSeverity.LOW,
      category: InsightCategory.WEEKDAY,
      evidence: `${weekdayPerformance[0].averageScore}% average across ${weekdayPerformance[0].trackedDays} tracked ${weekdayPerformance[0].weekday.toLowerCase()}s.`,
      recommendation: "Protect your highest-value work for that day when possible.",
    });
  }

  if (!insights.length && strongestHabits[0]) {
    insights.push({
      id: "steady-system",
      title: "Your core system is holding",
      message:
        "There are no sharp warning signals in the latest data, which means consistency is doing its job.",
      severity: InsightSeverity.LOW,
      category: InsightCategory.SUCCESS,
      evidence: `${strongestHabits[0].label} is leading with ${strongestHabits[0].completionRate}% completion.`,
      recommendation: "Keep reinforcing the routines that already feel automatic.",
    });
  }

  if (!rolloverTasks.length && insights.length < 6) {
    insights.push({
      id: "rollover-stable",
      title: "Carry-over pressure is under control",
      message: "Recent days are not showing strong rollover accumulation.",
      severity: InsightSeverity.LOW,
      category: InsightCategory.SUCCESS,
      evidence: "No high-frequency rollover tasks in the current insight window.",
    });
  }

  return insights.slice(0, 6);
}

export async function registerInsightsRoutes(app: FastifyInstance) {
  app.get("/api/insights", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const records = await loadInsightDataset(userId);
    const summaries = records.map(serializeDailyRecordSummary);
    const { strongestHabits, weakestHabits } = getHabitStrengthData(records);
    const rolloverTasks = getRolloverTasks(records);
    const weekdayPerformance = getWeekdayPerformance(records);
    const insights = generateRuleBasedInsights(
      records,
      strongestHabits,
      weakestHabits,
      rolloverTasks,
      weekdayPerformance,
    );

    const payload = {
      insights,
      strongestHabits,
      weakestHabits,
      rolloverTasks,
      completionTrend: {
        habits: average(records.map((record) => record.habitsScore * 100)),
        personal: average(records.map((record) => record.personalScore * 100)),
        work: average(records.map((record) => record.workScore * 100)),
      },
      weekdayPerformance,
      successRate: average(
        records.map((record) => (record.scorePercent >= SUCCESS_THRESHOLD ? 100 : 0)),
      ),
      mostProductiveDays: [...summaries]
        .sort((left, right) => right.scorePercent - left.scorePercent)
        .slice(0, 3),
      lowestPerformanceDays: [...summaries]
        .sort((left, right) => left.scorePercent - right.scorePercent)
        .slice(0, 3),
    };

    reply.send(successResponse(payload));
  });

  app.post("/api/insights/refresh", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const records = await loadInsightDataset(userId);
    const summaries = records.map(serializeDailyRecordSummary);
    const { strongestHabits, weakestHabits } = getHabitStrengthData(records);
    const rolloverTasks = getRolloverTasks(records);
    const weekdayPerformance = getWeekdayPerformance(records);
    const insights = generateRuleBasedInsights(
      records,
      strongestHabits,
      weakestHabits,
      rolloverTasks,
      weekdayPerformance,
    );

    const payload = {
      insights,
      strongestHabits,
      weakestHabits,
      rolloverTasks,
      completionTrend: {
        habits: average(records.map((record) => record.habitsScore * 100)),
        personal: average(records.map((record) => record.personalScore * 100)),
        work: average(records.map((record) => record.workScore * 100)),
      },
      weekdayPerformance,
      successRate: average(
        records.map((record) => (record.scorePercent >= SUCCESS_THRESHOLD ? 100 : 0)),
      ),
      mostProductiveDays: [...summaries]
        .sort((left, right) => right.scorePercent - left.scorePercent)
        .slice(0, 3),
      lowestPerformanceDays: [...summaries]
        .sort((left, right) => left.scorePercent - right.scorePercent)
        .slice(0, 3),
    };

    reply.send(successResponse(payload));
  });
}
