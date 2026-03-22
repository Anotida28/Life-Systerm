import { formatHistoryDate, parseDateKey } from "@/lib/date";
import type { DashboardStats } from "@/types";
import { SectionCard } from "@/components/shared/section-card";

export function WeeklySummaryCard({ stats }: { stats: DashboardStats }) {
  return (
    <SectionCard
      title="Weekly pulse"
      description="How this week is trending so far."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
            Average
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-primary)]">
            {stats.weeklyAverage}%
          </div>
        </div>
        <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
            Best day
          </div>
          <div className="mt-3 text-lg font-semibold text-[color:var(--text-primary)]">
            {stats.bestDayThisWeek
              ? formatHistoryDate(parseDateKey(stats.bestDayThisWeek.date))
              : "No data"}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {stats.bestDayThisWeek ? `${stats.bestDayThisWeek.scorePercent}% score` : "Track a day to see this."}
          </p>
        </div>
        <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
            Worst day
          </div>
          <div className="mt-3 text-lg font-semibold text-[color:var(--text-primary)]">
            {stats.worstDayThisWeek
              ? formatHistoryDate(parseDateKey(stats.worstDayThisWeek.date))
              : "No data"}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {stats.worstDayThisWeek ? `${stats.worstDayThisWeek.scorePercent}% score` : "Track a day to see this."}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
