import { z } from "zod";

export const taskTypeSchema = z.enum(["PERSONAL", "WORK"]);

export const createTaskSchema = z.object({
  dailyRecordId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  type: taskTypeSchema,
});

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
});

export const toggleEntitySchema = z.object({
  id: z.string().min(1),
  completed: z.boolean(),
});

export const moveEntitySchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export const updateNotesSchema = z.object({
  dailyRecordId: z.string().min(1),
  notes: z.string().max(5000),
});

export const updateReviewSchema = z.object({
  dailyRecordId: z.string().min(1),
  mood: z.number().int().min(1).max(5).nullable(),
  energy: z.number().int().min(1).max(5).nullable(),
  winOfTheDay: z.string().max(1000),
  whatSlowedMeDown: z.string().max(1000),
});

export const habitSchema = z.object({
  name: z.string().trim().min(1).max(80),
});
