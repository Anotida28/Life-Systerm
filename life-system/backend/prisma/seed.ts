import "dotenv/config";

import { PrismaClient, TaskType } from "@prisma/client";

import { DEFAULT_HABITS, SUCCESS_THRESHOLD } from "../src/lib/constants.js";
import { normalizeDate } from "../src/lib/date.js";
import { getMetricsFromCollections } from "../src/lib/scoring.js";

const prisma = new PrismaClient();
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? "local-zw-user";

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

async function ensureUserExists(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });
}

async function seedDefaultHabits(userId: string) {
  for (const [index, habitName] of DEFAULT_HABITS.entries()) {
    await prisma.habit.upsert({
      where: {
        userId_name: {
          userId,
          name: habitName,
        },
      },
      update: {
        order: index,
        isActive: true,
      },
      create: {
        userId,
        name: habitName,
        order: index,
      },
    });
  }
}

async function seedDemoDay(userId: string) {
  if (process.env.SEED_DEMO_DAY !== "true") {
    return;
  }

  const today = normalizeDate();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const existing = await prisma.dailyRecord.findUnique({
    where: {
      userId_date: {
        userId,
        date: yesterday,
      },
    },
  });

  if (existing) {
    return;
  }

  const activeHabits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const created = await prisma.dailyRecord.create({
    data: {
      userId,
      date: yesterday,
      notes:
        "Momentum felt strong after a focused morning. Afternoon context switching slowed me down.",
      mood: 4,
      energy: 3,
      winOfTheDay: "Finished the side-project sprint plan before lunch.",
      whatSlowedMeDown: "Too many work tasks pulled into the afternoon.",
    },
  });

  await prisma.dailyHabit.createMany({
    data: activeHabits.map((habit, index) => ({
      dailyRecordId: created.id,
      habitId: habit.id,
      labelSnapshot: habit.name,
      completed: index < 2,
      order: index,
    })),
  });

  await prisma.dailyTask.createMany({
    data: [
      {
        dailyRecordId: created.id,
        title: "Review side project backlog",
        type: TaskType.PERSONAL,
        completed: true,
        order: 0,
      },
      {
        dailyRecordId: created.id,
        title: "Renew vehicle insurance",
        type: TaskType.PERSONAL,
        completed: false,
        order: 1,
      },
      {
        dailyRecordId: created.id,
        title: "Ship weekly performance report",
        type: TaskType.WORK,
        completed: true,
        order: 0,
      },
      {
        dailyRecordId: created.id,
        title: "Close analytics dashboard bugs",
        type: TaskType.WORK,
        completed: false,
        order: 1,
      },
    ],
  });

  const refreshed = await prisma.dailyRecord.findUniqueOrThrow({
    where: { id: created.id },
    include: {
      dailyHabits: true,
      dailyTasks: true,
    },
  });

  const metrics = getMetricsFromCollections(refreshed.dailyHabits, refreshed.dailyTasks);
  const streaks = getStreakSnapshots([
    { wasSuccessfulDay: metrics.scorePercent >= SUCCESS_THRESHOLD },
  ]);

  await prisma.dailyRecord.update({
    where: { id: created.id },
    data: {
      ...metrics,
      ...streaks[0],
    },
  });
}

async function main() {
  await ensureUserExists(DEFAULT_USER_ID);
  await seedDefaultHabits(DEFAULT_USER_ID);
  await seedDemoDay(DEFAULT_USER_ID);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
