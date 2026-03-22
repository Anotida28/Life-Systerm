import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { resolveUserIdFromRequest } from "../lib/auth.js";
import { parseDateKey } from "../lib/date.js";
import { prisma } from "../lib/prisma.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { serializeDailyRecord, serializeDailyRecordSummary } from "../lib/serializers.js";

function buildDailyRecordInclude() {
  const asc = "asc" as const;
  const desc = "desc" as const;

  return {
    dailyHabits: {
      orderBy: [{ order: asc }, { createdAt: asc }],
    },
    dailyTasks: {
      orderBy: [{ type: asc }, { isCarriedOver: desc }, { order: asc }, { createdAt: asc }],
    },
  };
}

const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function registerHistoryRoutes(app: FastifyInstance) {
  app.get("/api/history", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);

    const records = await prisma.dailyRecord.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 90,
    });

    reply.send(successResponse(records.map(serializeDailyRecordSummary)));
  });

  app.get("/api/history/:date", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = dateParamSchema.safeParse(request.params);

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid history date"));
      return;
    }

    const date = parseDateKey(parsed.data.date);

    const record = await prisma.dailyRecord.findUnique({
      where: { userId_date: { userId, date } },
      include: buildDailyRecordInclude(),
    });

    if (!record) {
      reply.code(404).send(errorResponse("NOT_FOUND", "History record not found"));
      return;
    }

    reply.send(successResponse(serializeDailyRecord(record)));
  });
}
