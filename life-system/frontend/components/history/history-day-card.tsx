import Link from "next/link";
import { ArrowRight, CalendarDays, Flame } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatHistoryDate, parseDateKey } from "@/lib/date";
import type { DailyRecordSummary } from "@/types";

export function HistoryDayCard({
  record,
  highlight,
}: {
  record: DailyRecordSummary;
  highlight?: "best" | "worst";
}) {
  return (
    <Link
      href={`/history/${record.date}`}
      className="block rounded-[1.7rem] border border-[color:var(--line)] bg-[color:var(--surface-card)] p-5 shadow-[var(--card-shadow)] transition hover:border-[rgba(91,96,255,0.18)] hover:bg-[color:var(--surface-strong)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
              <CalendarDays className="h-4 w-4 text-[color:var(--accent)]" />
              {formatHistoryDate(parseDateKey(record.date))}
            </span>
            {highlight ? (
              <StatusBadge
                tone={highlight === "best" ? "success" : "warning"}
                label={highlight}
                className="capitalize"
              />
            ) : null}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {record.totalCompletedItems} completed • {record.totalMissedItems} missed
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-[color:var(--text-tertiary)]" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[auto,1fr,auto] sm:items-center">
        <div className="text-4xl font-semibold tracking-[-0.06em] text-[color:var(--text-primary)]">
          {record.scorePercent}%
        </div>
        <div>
          <StatusBadge status={record.dayStatus} />
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <Flame className="h-4 w-4 text-[color:var(--warning)]" />
          {record.currentStreakSnapshot} day streak
        </div>
      </div>
    </Link>
  );
}
