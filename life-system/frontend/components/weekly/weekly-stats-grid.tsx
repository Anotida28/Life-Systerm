import { formatHistoryDate, parseDateKey } from "@/lib/date";
import type { WeeklySummary } from "@/types";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Flame, Goal, Medal, TrendingUp } from "lucide-react";

export function WeeklyStatsGrid({ summary }: { summary: WeeklySummary }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Weekly stats"
        description="Track the health of the current week at a glance."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tracked days" value={`${summary.totalTrackedDays}`} meta="days captured this week" icon={Goal} />
          <StatCard label="Average score" value={`${summary.averageScore}%`} meta="current weekly performance" icon={TrendingUp} />
          <StatCard label="Current streak" value={`${summary.currentStreak}`} meta="successful days in a row" icon={Flame} />
          <StatCard label="Longest streak" value={`${summary.longestStreak}`} meta="best historical run" icon={Medal} />
        </div>
      </SectionCard>

      <SectionCard
        title="Category completion"
        description="Average completion rates for the current week."
      >
        <div className="space-y-5">
          <ProgressBar value={summary.categoryCompletion.habits} label="Non-negotiables" />
          <ProgressBar value={summary.categoryCompletion.personal} label="Personal tasks" />
          <ProgressBar value={summary.categoryCompletion.work} label="Work tasks" />
        </div>
      </SectionCard>

      <SectionCard
        title="Weekly landmarks"
        description="Best and worst performances from the current week."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              Best day
            </div>
            <div className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">
              {summary.bestDay
                ? formatHistoryDate(parseDateKey(summary.bestDay.date))
                : "No data"}
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              {summary.bestDay ? `${summary.bestDay.scorePercent}% score` : "Track a day to populate this."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              Worst day
            </div>
            <div className="mt-3 text-xl font-semibold text-[color:var(--text-primary)]">
              {summary.worstDay
                ? formatHistoryDate(parseDateKey(summary.worstDay.date))
                : "No data"}
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              {summary.worstDay ? `${summary.worstDay.scorePercent}% score` : "Track a day to populate this."}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
