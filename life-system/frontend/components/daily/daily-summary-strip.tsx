import { Target, TimerReset, Trophy } from "lucide-react";

import { ScoreRing } from "@/components/shared/score-ring";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatLongDate, parseDateKey } from "@/lib/date";
import type { DailyRecordView } from "@/types";

export function DailySummaryStrip({ record }: { record: DailyRecordView }) {
  return (
    <SectionCard
      title={formatLongDate(parseDateKey(record.date))}
      description="Live performance, streak pressure, and today's execution status."
      className="rounded-[1.9rem]"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <ScoreRing value={record.scorePercent} size={92} label="Today" />
          <div className="space-y-3">
            <StatusBadge status={record.dayStatus} />
            <p className="max-w-md text-sm leading-6 text-[color:var(--text-secondary)]">
              A successful day begins at{" "}
              <span className="text-[color:var(--text-primary)]">80%</span>. You have
              completed{" "}
              <span className="text-[color:var(--text-primary)]">
                {record.totalCompletedItems}
              </span>{" "}
              items so far.
            </p>
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              <Trophy className="h-4 w-4" />
              Current streak
            </div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
              {record.currentStreakSnapshot} days
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              <Target className="h-4 w-4" />
              Completion
            </div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
              {record.totalCompletedItems}/{record.totalCompletedItems + record.totalMissedItems}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              <TimerReset className="h-4 w-4" />
              Longest streak
            </div>
            <div className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
              {record.longestStreakSnapshot} days
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
