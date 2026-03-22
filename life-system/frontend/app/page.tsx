export const dynamic = "force-dynamic";

import { backendRequest } from "@/lib/backend-api";
import { CategoryPerformanceCard } from "@/components/dashboard/category-performance-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { StreakOverviewCard } from "@/components/dashboard/streak-overview-card";
import { TodayStatusCard } from "@/components/dashboard/today-status-card";
import { WeeklySummaryCard } from "@/components/dashboard/weekly-summary-card";
import { InsightCard } from "@/components/shared/insight-card";
import { average } from "@/lib/utils";
import type { DashboardStats, DailyRecordSummary, DailyRecordView, InsightsView, WeeklySummary } from "@/types";

export default async function DashboardPage() {
  const [today, weekly, insights] = await Promise.all([
    backendRequest<DailyRecordView>("/api/daily/today"),
    backendRequest<WeeklySummary>("/api/weekly/summary"),
    backendRequest<InsightsView>("/api/insights"),
  ]);

  const recentRecords = [...weekly.records]
    .sort((left: DailyRecordSummary, right: DailyRecordSummary) =>
      right.date.localeCompare(left.date),
    )
    .slice(0, 30);

  const stats: DashboardStats = {
    today,
    weeklyAverage: weekly.averageScore,
    bestDayThisWeek: weekly.bestDay,
    worstDayThisWeek: weekly.worstDay,
    successRate: average(recentRecords.map((record) => (record.wasSuccessfulDay ? 100 : 0))),
    currentStreak: today.currentStreakSnapshot,
    longestStreak: Math.max(
      today.longestStreakSnapshot,
      ...recentRecords.map((record) => record.longestStreakSnapshot),
    ),
    categoryCompletion: weekly.categoryCompletion,
    insightTeaser: insights.insights[0] ?? null,
  };

  return (
    <div className="space-y-6">
      <DashboardHero stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <TodayStatusCard today={stats.today} />
          <WeeklySummaryCard stats={stats} />
          <CategoryPerformanceCard stats={stats} />
        </div>
        <div className="space-y-6">
          <StreakOverviewCard stats={stats} />
          <QuickActionCard />
          {stats.insightTeaser ? (
            <InsightCard insight={stats.insightTeaser} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
