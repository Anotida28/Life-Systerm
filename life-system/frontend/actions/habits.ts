"use server";

import { revalidatePath } from "next/cache";

import { backendRequest } from "@/lib/backend-api";
import type { HabitView } from "@/types";
import { habitSchema, moveEntitySchema } from "@/lib/validation";
import { z } from "zod";

function revalidateHabits() {
  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/");
}

export async function getHabitsAction() {
  return backendRequest<HabitView[]>("/api/habits");
}

export async function createHabitAction(input: { name: string }) {
  const parsed = habitSchema.parse(input);
  const habits = await backendRequest<HabitView[]>("/api/habits", {
    method: "POST",
    body: JSON.stringify(parsed),
  });
  revalidateHabits();
  return habits;
}

export async function updateHabitAction(input: { id: string; name: string }) {
  const parsed = habitSchema.extend({ id: z.string().min(1) }).parse(input);
  const habits = await backendRequest<HabitView[]>(`/api/habits/${parsed.id}`, {
    method: "PATCH",
    body: JSON.stringify({ name: parsed.name }),
  });
  revalidateHabits();
  return habits;
}

export async function toggleHabitActiveAction(input: {
  id: string;
  isActive: boolean;
}) {
  const parsed = z
    .object({
      id: z.string().min(1),
      isActive: z.boolean(),
    })
    .parse(input);
  const habits = await backendRequest<HabitView[]>(`/api/habits/${parsed.id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: parsed.isActive }),
  });
  revalidateHabits();
  return habits;
}

export async function moveHabitAction(input: { id: string; direction: "up" | "down" }) {
  const parsed = moveEntitySchema.parse(input);
  const habits = await backendRequest<HabitView[]>(`/api/habits/${parsed.id}/position`, {
    method: "PATCH",
    body: JSON.stringify({ direction: parsed.direction }),
  });
  revalidateHabits();
  return habits;
}
