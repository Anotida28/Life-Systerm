"use server";

import { revalidatePath } from "next/cache";

import { backendRequest } from "@/lib/backend-api";
import type { DailyRecordView } from "@/types";
import {
  createTaskSchema,
  moveEntitySchema,
  toggleEntitySchema,
  updateNotesSchema,
  updateReviewSchema,
  updateTaskSchema,
} from "@/lib/validation";

function revalidateApp(dateKey?: string) {
  revalidatePath("/");
  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/weekly");
  revalidatePath("/insights");

  if (dateKey) {
    revalidatePath(`/history/${dateKey}`);
  }
}

export async function toggleDailyHabitAction(input: {
  id: string;
  completed: boolean;
}) {
  const parsed = toggleEntitySchema.parse(input);
  const record = await backendRequest<DailyRecordView>(`/api/daily/habits/${parsed.id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ completed: parsed.completed }),
  });
  revalidateApp(record.date);
  return record;
}

export async function refreshTodayAction() {
  return backendRequest<DailyRecordView>("/api/daily/today");
}

export async function createTaskAction(input: {
  dailyRecordId: string;
  title: string;
  type: "PERSONAL" | "WORK";
}) {
  const parsed = createTaskSchema.parse(input);
  const record = await backendRequest<DailyRecordView>("/api/daily/tasks", {
    method: "POST",
    body: JSON.stringify(parsed),
  });
  revalidateApp(record.date);
  return record;
}

export async function updateTaskAction(input: { taskId: string; title: string }) {
  const parsed = updateTaskSchema.parse(input);
  const record = await backendRequest<DailyRecordView>(`/api/daily/tasks/${parsed.taskId}/title`, {
    method: "PATCH",
    body: JSON.stringify({ title: parsed.title }),
  });
  revalidateApp(record.date);
  return record;
}

export async function toggleTaskAction(input: {
  id: string;
  completed: boolean;
}) {
  const parsed = toggleEntitySchema.parse(input);
  const record = await backendRequest<DailyRecordView>(`/api/daily/tasks/${parsed.id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ completed: parsed.completed }),
  });
  revalidateApp(record.date);
  return record;
}

export async function deleteTaskAction(input: { id: string }) {
  const parsed = toggleEntitySchema.pick({ id: true }).parse(input);
  const record = await backendRequest<DailyRecordView>(`/api/daily/tasks/${parsed.id}`, {
    method: "DELETE",
  });
  revalidateApp(record.date);
  return record;
}

export async function moveTaskAction(input: { id: string; direction: "up" | "down" }) {
  const parsed = moveEntitySchema.parse(input);
  const record = await backendRequest<DailyRecordView>(`/api/daily/tasks/${parsed.id}/move`, {
    method: "PATCH",
    body: JSON.stringify({ direction: parsed.direction }),
  });
  revalidateApp(record.date);
  return record;
}

export async function updateDailyNotesAction(input: {
  dailyRecordId: string;
  notes: string;
}) {
  const parsed = updateNotesSchema.parse(input);
  const record = await backendRequest<DailyRecordView>("/api/daily/notes", {
    method: "PATCH",
    body: JSON.stringify(parsed),
  });
  revalidateApp(record.date);
  return record;
}

export async function updateDailyReviewAction(input: {
  dailyRecordId: string;
  mood: number | null;
  energy: number | null;
  winOfTheDay: string;
  whatSlowedMeDown: string;
}) {
  const parsed = updateReviewSchema.parse(input);
  const record = await backendRequest<DailyRecordView>("/api/daily/review", {
    method: "PATCH",
    body: JSON.stringify(parsed),
  });
  revalidateApp(record.date);
  return record;
}
