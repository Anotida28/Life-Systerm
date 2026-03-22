"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { backendRequest } from "@/lib/backend-api";
import type { WeeklyReviewView } from "@/types";

export async function updateWeeklyReviewAction(input: {
  reviewId: string;
  whatWentWell: string;
  whatWentBadly: string;
  whatNeedsToImprove: string;
  nextWeekGoals: string;
}) {
  const parsed = z
    .object({
      reviewId: z.string().min(1),
      whatWentWell: z.string().max(2000),
      whatWentBadly: z.string().max(2000),
      whatNeedsToImprove: z.string().max(2000),
      nextWeekGoals: z.string().max(2000),
    })
    .parse(input);

  const review = await backendRequest<WeeklyReviewView>(`/api/weekly/reviews/${parsed.reviewId}`, {
    method: "PATCH",
    body: JSON.stringify({
      whatWentWell: parsed.whatWentWell,
      whatWentBadly: parsed.whatWentBadly,
      whatNeedsToImprove: parsed.whatNeedsToImprove,
      nextWeekGoals: parsed.nextWeekGoals,
    }),
  });
  revalidatePath("/weekly");
  return review;
}
