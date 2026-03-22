import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { resolveUserIdFromRequest } from "../lib/auth.js";
import { getWeekRange, parseDateKey } from "../lib/date.js";
import { prisma } from "../lib/prisma.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { serializeDailyRecordSummary, serializeWeeklyReview } from "../lib/serializers.js";
import { average } from "../lib/utils.js";

const updateWeeklyReviewSchema = z.object({
  id: z.string().min(1),
  whatWentWell: z.string().max(2000),
  whatWentBadly: z.string().max(2000),
  whatNeedsToImprove: z.string().max(2000),
  nextWeekGoals: z.string().max(2000),
});

async function getRecordsBetween(userId: string, start: Date, end: Date) {
  return prisma.dailyRecord.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function registerWeeklyRoutes(app: FastifyInstance) {
  app.get("/api/weekly/summary", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const { weekStart, weekEnd } = getWeekRange();
    const records = await getRecordsBetween(userId, weekStart, weekEnd);
    const summaries = records.map(serializeDailyRecordSummary);
    const bestDay =
      [...summaries].sort((left, right) => right.scorePercent - left.scorePercent)[0] ??
      null;
    const worstDay =
      [...summaries].sort((left, right) => left.scorePercent - right.scorePercent)[0] ??
      null;
    const latestRecord = summaries[summaries.length - 1] ?? null;

    const existingReview = await prisma.weeklyReview.findFirst({
      where: { userId, weekStart },
    });

    const reviewPayload = {
      weekEnd,
      totalTrackedDays: records.length,
      averageScore: average(records.map((record) => record.scorePercent)),
      bestDay: bestDay ? parseDateKey(bestDay.date) : null,
      worstDay: worstDay ? parseDateKey(worstDay.date) : null,
      successCount: records.filter((record) => record.wasSuccessfulDay).length,
      currentStreak: latestRecord?.currentStreakSnapshot ?? 0,
      longestStreak: Math.max(0, ...records.map((record) => record.longestStreakSnapshot)),
    };

    const weeklyReview = existingReview
      ? await prisma.weeklyReview.update({
          where: { id: existingReview.id },
          data: reviewPayload,
        })
      : await prisma.weeklyReview.create({
          data: {
            userId,
            weekStart,
            ...reviewPayload,
          },
        });

    const payload = {
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

    reply.send(successResponse(payload));
  });

  app.patch("/api/weekly/reviews/:id", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = updateWeeklyReviewSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid weekly review payload"));
      return;
    }

    const review = await prisma.weeklyReview.update({
      where: { id: parsed.data.id, userId },
      data: {
        whatWentWell: parsed.data.whatWentWell,
        whatWentBadly: parsed.data.whatWentBadly,
        whatNeedsToImprove: parsed.data.whatNeedsToImprove,
        nextWeekGoals: parsed.data.nextWeekGoals,
      },
    });

    reply.send(successResponse(serializeWeeklyReview(review)));
  });
}
