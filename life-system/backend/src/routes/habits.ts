import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { resolveUserIdFromRequest } from "../lib/auth.js";
import { normalizeDate } from "../lib/date.js";
import { prisma } from "../lib/prisma.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { serializeHabit } from "../lib/serializers.js";

const createHabitSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

const updateHabitSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
});

const toggleHabitSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
});

const moveHabitSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export async function registerHabitRoutes(app: FastifyInstance) {
  app.get("/api/habits", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    reply.send(successResponse(habits.map(serializeHabit)));
  });

  app.post("/api/habits", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = createHabitSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid habit payload"));
      return;
    }

    await prisma.$transaction(
      async (tx: any) => {
        const lastHabit = await tx.habit.findFirst({
          where: { userId },
          orderBy: [{ order: "desc" }, { createdAt: "desc" }],
        });

        const habit = await tx.habit.create({
          data: {
            userId,
            name: parsed.data.name,
            order: lastHabit ? lastHabit.order + 1 : 0,
          },
        });

        const todayRecord = await tx.dailyRecord.findUnique({
          where: { userId_date: { userId, date: normalizeDate() } },
          include: {
            dailyHabits: true,
          },
        });

        if (todayRecord) {
          const alreadyPresent = todayRecord.dailyHabits.some(
            (dailyHabit: { habitId: string | null }) => dailyHabit.habitId === habit.id,
          );

          if (!alreadyPresent) {
            const order = todayRecord.dailyHabits.length;
            await tx.dailyHabit.create({
              data: {
                dailyRecordId: todayRecord.id,
                habitId: habit.id,
                labelSnapshot: habit.name,
                order,
              },
            });
          }
        }
      },
    );

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    reply.code(201).send(successResponse(habits.map(serializeHabit)));
  });

  app.patch("/api/habits/:id", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = updateHabitSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid habit payload"));
      return;
    }

    await prisma.$transaction(
      async (tx: any) => {
        const habit = await tx.habit.update({
          where: {
            id: (
              await tx.habit.findFirstOrThrow({
                where: { id: parsed.data.id, userId },
                select: { id: true },
              })
            ).id,
          },
          data: { name: parsed.data.name },
        });

        const todayRecord = await tx.dailyRecord.findUnique({
          where: { userId_date: { userId, date: normalizeDate() } },
        });

        if (todayRecord) {
          await tx.dailyHabit.updateMany({
            where: {
              dailyRecordId: todayRecord.id,
              habitId: habit.id,
            },
            data: {
              labelSnapshot: habit.name,
            },
          });
        }
      },
    );

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    reply.send(successResponse(habits.map(serializeHabit)));
  });

  app.patch("/api/habits/:id/active", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = toggleHabitSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid habit payload"));
      return;
    }

    await prisma.habit.update({
      where: {
        id: (
          await prisma.habit.findFirstOrThrow({
            where: { id: parsed.data.id, userId },
            select: { id: true },
          })
        ).id,
      },
      data: { isActive: parsed.data.isActive },
    });

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    reply.send(successResponse(habits.map(serializeHabit)));
  });

  app.patch("/api/habits/:id/position", async (request, reply) => {
    const userId = resolveUserIdFromRequest(request);
    const parsed = moveHabitSchema.safeParse({
      id: (request.params as { id?: string }).id,
      ...(request.body as object),
    });

    if (!parsed.success) {
      reply.code(400).send(errorResponse("VALIDATION_ERROR", "Invalid move payload"));
      return;
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    const currentIndex = habits.findIndex((habit: { id: string }) => habit.id === parsed.data.id);
    const swapIndex = parsed.data.direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || swapIndex < 0 || swapIndex >= habits.length) {
      reply.send(successResponse(habits.map(serializeHabit)));
      return;
    }

    const current = habits[currentIndex];
    const target = habits[swapIndex];

    if (!current || !target) {
      reply.send(successResponse(habits.map(serializeHabit)));
      return;
    }

    await prisma.$transaction(
      async (tx: any) => {
        await tx.habit.update({ where: { id: current.id }, data: { order: target.order } });
        await tx.habit.update({ where: { id: target.id }, data: { order: current.order } });

        const todayRecord = await tx.dailyRecord.findUnique({
          where: { userId_date: { userId, date: normalizeDate() } },
          include: {
            dailyHabits: true,
          },
        });

        if (todayRecord) {
          const reorderedHabits = await tx.habit.findMany({
            where: { userId },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          });

          for (const habit of reorderedHabits) {
            const matchingDailyHabit = todayRecord.dailyHabits.find(
              (dailyHabit: { habitId: string | null }) => dailyHabit.habitId === habit.id,
            );

            if (matchingDailyHabit) {
              await tx.dailyHabit.update({
                where: { id: matchingDailyHabit.id },
                data: { order: habit.order },
              });
            }
          }
        }
      },
    );

    const reordered = await prisma.habit.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    reply.send(successResponse(reordered.map(serializeHabit)));
  });
}
