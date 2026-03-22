import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { resolveUserIdFromRequest } from "../lib/auth.js";
import { getPreviousDay, normalizeDate } from "../lib/date.js";
import { prisma } from "../lib/prisma.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { getMetricsFromCollections } from "../lib/scoring.js";
import { serializeDailyRecord } from "../lib/serializers.js";

function buildDailyRecordInclude() {
  const asc = "asc" as const;
  const desc = "desc" as const;

  return {
    dailyHabits: {
      orderBy: [{ order: asc }, { createdAt: asc }],
    },
    dailyTasks: {
      orderBy: [
        { type: asc },
        { isCarriedOver: desc },
        { order: asc },
        { createdAt: asc },
      ],
    },
  };
}

const createTaskSchema = z.object({
  dailyRecordId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  type: z.enum(["PERSONAL", "WORK"]),
});

const toggleEntitySchema = z.object({
  id: z.string().min(1),
  completed: z.boolean(),
});

const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
});

const moveTaskSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

const updateNotesSchema = z.object({
  dailyRecordId: z.string().min(1),
  notes: z.string().max(5000),
});

const updateReviewSchema = z.object({
  dailyRecordId: z.string().min(1),
  mood: z.number().int().min(1).max(5).nullable(),
  energy: z.number().int().min(1).max(5).nullable(),
  winOfTheDay: z.string().max(1000),
  whatSlowedMeDown: z.string().max(1000),
});

async function getDailyRecordById(id: string, userId: string) {
  return prisma.dailyRecord.findFirstOrThrow({
    where: { id, userId },
    include: buildDailyRecordInclude(),
  });
}

async function getDailyRecordByIdTx(client: any, id: string, userId: string) {
  return client.dailyRecord.findFirstOrThrow({
    where: { id, userId },
    include: buildDailyRecordInclude(),
  });
}

async function recalculateDailyRecord(client: any, dailyRecordId: string, userId: string) {
  const record = await getDailyRecordByIdTx(client, dailyRecordId, userId);
  const metrics = getMetricsFromCollections(record.dailyHabits, record.dailyTasks);

  await client.dailyRecord.update({
    where: { id: dailyRecordId },
    data: metrics,
  });

  return getDailyRecordByIdTx(client, dailyRecordId, userId);
}

function getStreakSnapshots(records: Array<{ wasSuccessfulDay: boolean }>) {
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

async function refreshAllStreakSnapshots(client: any, userId: string) {
  const records = await client.dailyRecord.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      wasSuccessfulDay: true,
    },
  });

  const snapshots = getStreakSnapshots(records);

  for (const [index, record] of records.entries()) {
    const snapshot = snapshots[index];

    if (!snapshot) {
      continue;
    }

    await client.dailyRecord.update({
      where: { id: record.id },
      data: snapshot,
    });
  }
}

async function loadActiveHabitsIntoDay(client: any, dailyRecordId: string) {
  const record = await client.dailyRecord.findUniqueOrThrow({
    where: { id: dailyRecordId },
    select: { userId: true },
  });

  const activeHabits = await client.habit.findMany({
    where: { userId: record.userId, isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  if (!activeHabits.length) {
    return;
  }

  await client.dailyHabit.createMany({
    data: activeHabits.map((habit: { id: string; name: string }, index: number) => ({
      dailyRecordId,
      habitId: habit.id,
      labelSnapshot: habit.name,
      order: index,
    })),
  });
}

async function rolloverIncompleteTasksFromPreviousDay(
  client: any,
  dailyRecordId: string,
  date: Date,
) {
  const record = await client.dailyRecord.findUniqueOrThrow({
    where: { id: dailyRecordId },
    select: { userId: true },
  });

  const previousRecord = await client.dailyRecord.findUnique({
    where: { userId_date: { userId: record.userId, date: getPreviousDay(date) } },
    include: {
      dailyTasks: {
        where: { completed: false },
        orderBy: [{ type: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!previousRecord?.dailyTasks.length) {
    return;
  }

  const personalTasks = previousRecord.dailyTasks.filter(
    (task: { type: string }) => task.type === "PERSONAL",
  );
  const workTasks = previousRecord.dailyTasks.filter(
    (task: { type: string }) => task.type === "WORK",
  );

  const rolloverData = [...personalTasks, ...workTasks].map((task, index) => ({
    dailyRecordId,
    title: task.title,
    type: task.type,
    completed: false,
    isCarriedOver: true,
    carriedOverFromDate: previousRecord.date,
    order: index,
  }));

  await client.dailyTask.createMany({ data: rolloverData });
}

async function createDailyRecord(userId: string, date = normalizeDate()) {
  const normalizedDate = normalizeDate(date);

  return prisma.$transaction(
    async (tx: any) => {
      const existing = await tx.dailyRecord.findUnique({
        where: { userId_date: { userId, date: normalizedDate } },
        include: buildDailyRecordInclude(),
      });

      if (existing) {
        return existing;
      }

      const created = await tx.dailyRecord.create({
        data: { userId, date: normalizedDate },
      });

      await loadActiveHabitsIntoDay(tx, created.id);
      await rolloverIncompleteTasksFromPreviousDay(tx, created.id, normalizedDate);
      await recalculateDailyRecord(tx, created.id, userId);
      await refreshAllStreakSnapshots(tx, userId);

      return getDailyRecordByIdTx(tx, created.id, userId);
    },
  );
}

async function getOrCreateTodayRecord(userId: string) {
  const date = normalizeDate();

  const existing = await prisma.dailyRecord.findUnique({
    where: { userId_date: { userId, date } },
    include: buildDailyRecordInclude(),
  });

  if (existing) {
    return existing;
  }

  return createDailyRecord(userId, date);
}

async function createTask(input: {
  userId: string;
  dailyRecordId: string;
  title: string;
  type: "PERSONAL" | "WORK";
}) {
  return prisma.$transaction(
    async (tx: any) => {
      await tx.dailyRecord.findUniqueOrThrow({
        where: {
          id: (
            await tx.dailyRecord.findFirstOrThrow({
              where: { id: input.dailyRecordId, userId: input.userId },
              select: { id: true },
            })
          ).id,
        },
        select: { id: true },
      });

      const lastTask = await tx.dailyTask.findFirst({
        where: {
          dailyRecordId: input.dailyRecordId,
          type: input.type,
        },
        orderBy: [{ order: "desc" }, { createdAt: "desc" }],
      });

      await tx.dailyTask.create({
        data: {
          dailyRecordId: input.dailyRecordId,
          title: input.title,
          type: input.type,
          order: lastTask ? lastTask.order + 1 : 0,
        },
      });

      await recalculateDailyRecord(tx, input.dailyRecordId, input.userId);
      await refreshAllStreakSnapshots(tx, input.userId);
      return getDailyRecordByIdTx(tx, input.dailyRecordId, input.userId);
    },
  );
}

async function moveTask(userId: string, taskId: string, direction: "up" | "down") {
  return prisma.$transaction(
    async (tx: any) => {
      const task = await tx.dailyTask.findFirstOrThrow({
        where: { id: taskId, dailyRecord: { userId } },
      });

      const orderedTasks = await tx.dailyTask.findMany({
        where: {
          dailyRecordId: task.dailyRecordId,
          type: task.type,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });

      const currentIndex = orderedTasks.findIndex((item: { id: string }) => item.id === taskId);
      const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex === -1 || swapIndex < 0 || swapIndex >= orderedTasks.length) {
        return getDailyRecordByIdTx(tx, task.dailyRecordId, userId);
      }

      const current = orderedTasks[currentIndex];
      const target = orderedTasks[swapIndex];

      if (!current || !target) {
        return getDailyRecordByIdTx(tx, task.dailyRecordId, userId);
      }

      await tx.dailyTask.update({ where: { id: current.id }, data: { order: target.order } });
      await tx.dailyTask.update({ where: { id: target.id }, data: { order: current.order } });

      return getDailyRecordByIdTx(tx, task.dailyRecordId, userId);
    },
  );
}

export async function registerDailyRoutes(app: FastifyInstance) {
  app.get("/api/daily/today", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const record = await getOrCreateTodayRecord(userId);
    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.post("/api/daily/tasks", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = createTaskSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid task payload"));
      return;
    }

    const record = await createTask({ ...parsed.data, userId });
    reply.code(201).send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/tasks/:id/title", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = updateTaskSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid task payload"));
      return;
    }

    const existingTask = await prisma.dailyTask.findFirst({
      where: { id: parsed.data.id, dailyRecord: { userId } },
      select: { id: true },
    });

    if (!existingTask) {
      reply.code(404).send(errorResponse("NOT_FOUND", "Task not found"));
      return;
    }

    const task = await prisma.dailyTask.update({
      where: { id: existingTask.id },
      data: { title: parsed.data.title },
      select: { dailyRecordId: true },
    });

    const record = await getDailyRecordById(task.dailyRecordId, userId);
    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/tasks/:id/toggle", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = toggleEntitySchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid toggle payload"));
      return;
    }

    const record = await prisma.$transaction(
      async (tx: any) => {
        const task = await tx.dailyTask.update({
          where: {
            id: (
              await tx.dailyTask.findFirstOrThrow({
                where: { id: parsed.data.id, dailyRecord: { userId } },
                select: { id: true },
              })
            ).id,
          },
          data: { completed: parsed.data.completed },
          select: { dailyRecordId: true },
        });

        await recalculateDailyRecord(tx, task.dailyRecordId, userId);
        await refreshAllStreakSnapshots(tx, userId);
        return getDailyRecordByIdTx(tx, task.dailyRecordId, userId);
      },
    );

    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/habits/:id/toggle", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = toggleEntitySchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid habit toggle payload"));
      return;
    }

    const record = await prisma.$transaction(
      async (tx: any) => {
        const habit = await tx.dailyHabit.update({
          where: {
            id: (
              await tx.dailyHabit.findFirstOrThrow({
                where: { id: parsed.data.id, dailyRecord: { userId } },
                select: { id: true },
              })
            ).id,
          },
          data: { completed: parsed.data.completed },
          select: { dailyRecordId: true },
        });

        await recalculateDailyRecord(tx, habit.dailyRecordId, userId);
        await refreshAllStreakSnapshots(tx, userId);
        return getDailyRecordByIdTx(tx, habit.dailyRecordId, userId);
      },
    );

    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/tasks/:id/move", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = moveTaskSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid task move payload"));
      return;
    }

    const record = await moveTask(userId, parsed.data.id, parsed.data.direction);
    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/notes", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = updateNotesSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid notes payload"));
      return;
    }

    await prisma.dailyRecord.update({
      where: {
        id: (
          await prisma.dailyRecord.findFirstOrThrow({
            where: { id: parsed.data.dailyRecordId, userId },
            select: { id: true },
          })
        ).id,
      },
      data: { notes: parsed.data.notes },
    });

    const record = await getDailyRecordById(parsed.data.dailyRecordId, userId);
    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.patch("/api/daily/review", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = updateReviewSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid review payload"));
      return;
    }

    await prisma.dailyRecord.update({
      where: {
        id: (
          await prisma.dailyRecord.findFirstOrThrow({
            where: { id: parsed.data.dailyRecordId, userId },
            select: { id: true },
          })
        ).id,
      },
      data: {
        mood: parsed.data.mood,
        energy: parsed.data.energy,
        winOfTheDay: parsed.data.winOfTheDay,
        whatSlowedMeDown: parsed.data.whatSlowedMeDown,
      },
    });

    const record = await getDailyRecordById(parsed.data.dailyRecordId, userId);
    reply.send(successResponse(serializeDailyRecord(record)));
  });

  app.delete("/api/daily/tasks/:id", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const id = (request.params as { id?: string }).id;

    if (!id) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Task id is required"));
      return;
    }

    const record = await prisma.$transaction(
      async (tx: any) => {
        const deleted = await tx.dailyTask.delete({
          where: {
            id: (
              await tx.dailyTask.findFirstOrThrow({
                where: { id, dailyRecord: { userId } },
                select: { id: true },
              })
            ).id,
          },
          select: { dailyRecordId: true },
        });

        await recalculateDailyRecord(tx, deleted.dailyRecordId, userId);
        await refreshAllStreakSnapshots(tx, userId);
        return getDailyRecordByIdTx(tx, deleted.dailyRecordId, userId);
      },
    );

    reply.send(successResponse(serializeDailyRecord(record)));
  });
}
