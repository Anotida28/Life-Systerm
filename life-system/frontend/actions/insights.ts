"use server";

import { revalidatePath } from "next/cache";

import { backendRequest } from "@/lib/backend-api";
import type { InsightsView } from "@/types";

export async function refreshInsightsAction() {
  const insights = await backendRequest<InsightsView>("/api/insights/refresh", {
    method: "POST",
  });
  revalidatePath("/insights");
  return insights;
}
