import "dotenv/config";

import { TaskType } from "@prisma/client";
import { subDays } from "date-fns";

import { DEFAULT_HABITS, SUCCESS_THRESHOLD } from "@/lib/constants";
import { getMetricsFromCollections, getStreakSnapshots } from "@/lib/domain/scoring";
import { normalizeDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

async function seedDefaultHabits() {
  for (const [index, habitName] of DEFAULT_HABITS.entries()) {
    await prisma.habit.upsert({
      where: {
        name: habitName,
      },
      update: {
        order: index,
        isActive: true,
      },
      create: {
        name: habitName,
        order: index,
      },
    });
  }
}

async function seedDemoDay() {
  if (process.env.SEED_DEMO_DAY !== "true") {
    return;
  }

  const today = normalizeDate();
  const yesterday = normalizeDate(subDays(today, 1));
  const existing = await prisma.dailyRecord.findUnique({
    where: { date: yesterday },
  });

  if (existing) {
    return;
  }

  const activeHabits = await prisma.habit.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const created = await prisma.dailyRecord.create({
    data: {
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
  const streaks = getStreakSnapshots([{ wasSuccessfulDay: metrics.scorePercent >= SUCCESS_THRESHOLD }]);

  await prisma.dailyRecord.update({
    where: { id: created.id },
    data: {
      ...metrics,
      ...streaks[0],
    },
  });
}

async function main() {
  await seedDefaultHabits();
  await seedDemoDay();
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
