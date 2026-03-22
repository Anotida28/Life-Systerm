import { addHabitToTodayIfPresent, moveHabitOrder } from "@/lib/domain/daily-record";
import { normalizeDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { serializeHabit } from "@/lib/serializers";

export async function getHabits() {
  const habits = await prisma.habit.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return habits.map(serializeHabit);
}

export async function createHabit(name: string) {
  const lastHabit = await prisma.habit.findFirst({
    orderBy: [{ order: "desc" }, { createdAt: "desc" }],
  });

  const habit = await prisma.habit.create({
    data: {
      name,
      order: lastHabit ? lastHabit.order + 1 : 0,
    },
  });

  await addHabitToTodayIfPresent(habit);
  return getHabits();
}

export async function updateHabit(input: { id: string; name: string }) {
  const habit = await prisma.habit.update({
    where: { id: input.id },
    data: { name: input.name },
  });

  const todayRecord = await prisma.dailyRecord.findUnique({
    where: { date: normalizeDate() },
  });

  if (todayRecord) {
    await prisma.dailyHabit.updateMany({
      where: {
        dailyRecordId: todayRecord.id,
        habitId: habit.id,
      },
      data: {
        labelSnapshot: habit.name,
      },
    });
  }

  return getHabits();
}

export async function toggleHabitActive(id: string, isActive: boolean) {
  await prisma.habit.update({
    where: { id },
    data: { isActive },
  });

  return getHabits();
}

export async function moveHabit(id: string, direction: "up" | "down") {
  const habits = await moveHabitOrder(id, direction);
  return habits.map(serializeHabit);
}
