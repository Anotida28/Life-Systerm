import {
  type DailyHabit,
  Prisma,
  type PrismaClient,
  type TaskType,
} from "@prisma/client";

import { getPreviousDay, normalizeDate, parseDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { getMetricsFromCollections, getStreakSnapshots } from "@/lib/domain/scoring";

type DBClient = PrismaClient | Prisma.TransactionClient;

export const dailyRecordInclude = {
  dailyHabits: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  },
  dailyTasks: {
    orderBy: [
      { type: "asc" },
      { isCarriedOver: "desc" },
      { order: "asc" },
      { createdAt: "asc" },
    ],
  },
} satisfies Prisma.DailyRecordInclude;

export type DailyRecordWithItems = Prisma.DailyRecordGetPayload<{
  include: typeof dailyRecordInclude;
}>;

async function getDailyRecordById(client: DBClient, id: string) {
  return client.dailyRecord.findUniqueOrThrow({
    where: { id },
    include: dailyRecordInclude,
  });
}

async function recalculateDailyRecord(
  client: DBClient,
  dailyRecordId: string,
): Promise<DailyRecordWithItems> {
  const record = await getDailyRecordById(client, dailyRecordId);
  const metrics = getMetricsFromCollections(record.dailyHabits, record.dailyTasks);

  await client.dailyRecord.update({
    where: { id: dailyRecordId },
    data: metrics,
  });

  return getDailyRecordById(client, dailyRecordId);
}

async function refreshAllStreakSnapshots(client: DBClient) {
  const records = await client.dailyRecord.findMany({
    orderBy: { date: "asc" },
    select: {
      id: true,
      wasSuccessfulDay: true,
    },
  });

  const streaks = getStreakSnapshots(records);

  for (const [index, record] of records.entries()) {
    await client.dailyRecord.update({
      where: { id: record.id },
      data: streaks[index],
    });
  }
}

export async function loadActiveHabitsIntoDay(
  client: DBClient,
  dailyRecordId: string,
) {
  const activeHabits = await client.habit.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  if (!activeHabits.length) {
    return;
  }

  await client.dailyHabit.createMany({
    data: activeHabits.map((habit, index) => ({
      dailyRecordId,
      habitId: habit.id,
      labelSnapshot: habit.name,
      order: index,
    })),
  });
}

export async function rolloverIncompleteTasksFromPreviousDay(
  client: DBClient,
  dailyRecordId: string,
  date: Date,
) {
  const previousRecord = await client.dailyRecord.findUnique({
    where: { date: getPreviousDay(date) },
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
    (task) => task.type === "PERSONAL",
  );
  const workTasks = previousRecord.dailyTasks.filter((task) => task.type === "WORK");

  const rolloverData = [...personalTasks, ...workTasks].map((task, index) => ({
    dailyRecordId,
    title: task.title,
    type: task.type,
    completed: false,
    isCarriedOver: true,
    carriedOverFromDate: previousRecord.date,
    order: index,
  }));

  await client.dailyTask.createMany({
    data: rolloverData,
  });
}

export async function createDailyRecord(date = normalizeDate()) {
  const normalizedDate = normalizeDate(date);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.dailyRecord.findUnique({
      where: { date: normalizedDate },
      include: dailyRecordInclude,
    });

    if (existing) {
      return existing;
    }

    const created = await tx.dailyRecord.create({
      data: {
        date: normalizedDate,
      },
    });

    await loadActiveHabitsIntoDay(tx, created.id);
    await rolloverIncompleteTasksFromPreviousDay(tx, created.id, normalizedDate);
    await recalculateDailyRecord(tx, created.id);
    await refreshAllStreakSnapshots(tx);

    return getDailyRecordById(tx, created.id);
  });
}

export async function getOrCreateDailyRecord(date = normalizeDate()) {
  const normalizedDate = normalizeDate(date);
  const existing = await prisma.dailyRecord.findUnique({
    where: { date: normalizedDate },
    include: dailyRecordInclude,
  });

  if (existing) {
    return existing;
  }

  return createDailyRecord(normalizedDate);
}

export async function getOrCreateTodayRecord() {
  return getOrCreateDailyRecord(normalizeDate());
}

export async function getDailyRecordByDateKey(dateKey: string) {
  return prisma.dailyRecord.findUnique({
    where: { date: parseDateKey(dateKey) },
    include: dailyRecordInclude,
  });
}

async function touchRecordAfterMutation(client: DBClient, dailyRecordId: string) {
  await recalculateDailyRecord(client, dailyRecordId);
  await refreshAllStreakSnapshots(client);
  return getDailyRecordById(client, dailyRecordId);
}

export async function toggleDailyHabit(dailyHabitId: string, completed: boolean) {
  return prisma.$transaction(async (tx) => {
    const habit = await tx.dailyHabit.update({
      where: { id: dailyHabitId },
      data: { completed },
      select: { dailyRecordId: true },
    });

    return touchRecordAfterMutation(tx, habit.dailyRecordId);
  });
}

export async function createTask(input: {
  dailyRecordId: string;
  title: string;
  type: TaskType;
}) {
  return prisma.$transaction(async (tx) => {
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

    return touchRecordAfterMutation(tx, input.dailyRecordId);
  });
}

export async function updateTask(taskId: string, title: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.dailyTask.update({
      where: { id: taskId },
      data: { title },
      select: { dailyRecordId: true },
    });

    return getDailyRecordById(tx, task.dailyRecordId);
  });
}

export async function toggleTask(taskId: string, completed: boolean) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.dailyTask.update({
      where: { id: taskId },
      data: { completed },
      select: { dailyRecordId: true },
    });

    return touchRecordAfterMutation(tx, task.dailyRecordId);
  });
}

export async function deleteTask(taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.dailyTask.delete({
      where: { id: taskId },
      select: { dailyRecordId: true },
    });

    return touchRecordAfterMutation(tx, task.dailyRecordId);
  });
}

export async function moveTask(taskId: string, direction: "up" | "down") {
  return prisma.$transaction(async (tx) => {
    const task = await tx.dailyTask.findUniqueOrThrow({
      where: { id: taskId },
    });

    const orderedTasks = await tx.dailyTask.findMany({
      where: {
        dailyRecordId: task.dailyRecordId,
        type: task.type,
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    const currentIndex = orderedTasks.findIndex((item) => item.id === taskId);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || swapIndex < 0 || swapIndex >= orderedTasks.length) {
      return getDailyRecordById(tx, task.dailyRecordId);
    }

    const current = orderedTasks[currentIndex];
    const target = orderedTasks[swapIndex];

    await tx.dailyTask.update({
      where: { id: current.id },
      data: { order: target.order },
    });

    await tx.dailyTask.update({
      where: { id: target.id },
      data: { order: current.order },
    });

    return getDailyRecordById(tx, task.dailyRecordId);
  });
}

export async function updateDailyNotes(dailyRecordId: string, notes: string) {
  await prisma.dailyRecord.update({
    where: { id: dailyRecordId },
    data: { notes },
  });

  return getDailyRecordById(prisma, dailyRecordId);
}

export async function updateDailyReview(input: {
  dailyRecordId: string;
  mood: number | null;
  energy: number | null;
  winOfTheDay: string;
  whatSlowedMeDown: string;
}) {
  await prisma.dailyRecord.update({
    where: { id: input.dailyRecordId },
    data: {
      mood: input.mood,
      energy: input.energy,
      winOfTheDay: input.winOfTheDay,
      whatSlowedMeDown: input.whatSlowedMeDown,
    },
  });

  return getDailyRecordById(prisma, input.dailyRecordId);
}

export async function getHistoryRecords(limit = 90) {
  return prisma.dailyRecord.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getRecordsBetween(start: Date, end: Date) {
  return prisma.dailyRecord.findMany({
    where: {
      date: {
        gte: normalizeDate(start),
        lte: normalizeDate(end),
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getRecentRecords(limit = 30) {
  return prisma.dailyRecord.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function addHabitToTodayIfPresent(habit: { id: string; name: string }) {
  const todayRecord = await prisma.dailyRecord.findUnique({
    where: { date: normalizeDate() },
  });

  if (!todayRecord) {
    return null;
  }

  const existing = await prisma.dailyHabit.findFirst({
    where: {
      dailyRecordId: todayRecord.id,
      habitId: habit.id,
    },
  });

  if (existing) {
    return getDailyRecordById(prisma, todayRecord.id);
  }

  const lastHabit = await prisma.dailyHabit.findFirst({
    where: { dailyRecordId: todayRecord.id },
    orderBy: [{ order: "desc" }, { createdAt: "desc" }],
  });

  await prisma.dailyHabit.create({
    data: {
      dailyRecordId: todayRecord.id,
      habitId: habit.id,
      labelSnapshot: habit.name,
      order: lastHabit ? lastHabit.order + 1 : 0,
    },
  });

  await recalculateDailyRecord(prisma, todayRecord.id);
  await refreshAllStreakSnapshots(prisma);

  return getDailyRecordById(prisma, todayRecord.id);
}

export async function moveHabitOrder(habitId: string, direction: "up" | "down") {
  const habits = await prisma.habit.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const currentIndex = habits.findIndex((habit) => habit.id === habitId);
  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex === -1 || swapIndex < 0 || swapIndex >= habits.length) {
    return prisma.habit.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  }

  const current = habits[currentIndex];
  const target = habits[swapIndex];

  await prisma.$transaction([
    prisma.habit.update({
      where: { id: current.id },
      data: { order: target.order },
    }),
    prisma.habit.update({
      where: { id: target.id },
      data: { order: current.order },
    }),
  ]);

  const reordered = await prisma.habit.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const todayRecord = await prisma.dailyRecord.findUnique({
    where: { date: normalizeDate() },
    include: {
      dailyHabits: true,
    },
  });

  if (todayRecord) {
    for (const habit of reordered) {
      const matchingHabit = todayRecord.dailyHabits.find(
        (dailyHabit) => dailyHabit.habitId === habit.id,
      );

      if (matchingHabit) {
        await prisma.dailyHabit.update({
          where: { id: matchingHabit.id },
          data: { order: habit.order },
        });
      }
    }
  }

  return reordered;
}

export function sortHabitsForDay(habits: DailyHabit[]) {
  return [...habits].sort((left, right) => left.order - right.order);
}
