export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/shared/page-header";
import { WeeklyReviewForm } from "@/components/weekly/weekly-review-form";
import { WeeklyStatsGrid } from "@/components/weekly/weekly-stats-grid";
import { formatWeekRangeLabel, parseDateKey } from "@/lib/date";
import { backendRequest } from "@/lib/backend-api";
import type { WeeklySummary } from "@/types";

export const metadata = {
  title: "Weekly Review",
};

export default async function WeeklyPage() {
  const summary = await backendRequest<WeeklySummary>("/api/weekly/summary");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Weekly review"
        title={formatWeekRangeLabel(parseDateKey(summary.weekStart), parseDateKey(summary.weekEnd))}
        description="Study the current week’s performance, spot pressure points, and record next week’s adjustments."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WeeklyStatsGrid summary={summary} />
        <WeeklyReviewForm initialReview={summary.review} />
      </div>
    </div>
  );
}
