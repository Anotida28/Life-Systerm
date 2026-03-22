import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/shared/button";
import { ScoreRing } from "@/components/shared/score-ring";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatLongDate, parseDateKey } from "@/lib/date";
import type { DashboardStats } from "@/types";

export function DashboardHero({ stats }: { stats: DashboardStats }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(18,24,40,0.96),rgba(10,14,24,0.98))] p-6 shadow-[var(--card-shadow)] sm:p-8">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-tertiary)]">
            Personal discipline platform
          </div>
          <h1 className="mt-4 max-w-3xl font-serif-display text-5xl leading-none tracking-[-0.06em] text-[color:var(--text-primary)] sm:text-6xl">
            Run your life with calm clarity and real performance data.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">
            Life System combines recurring discipline, flexible task execution, reflection, weighted scoring, streaks, and evidence-based insight generation in one mobile-first workflow.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/today">
                Open today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/insights">
                See insights
                <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.8rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-tertiary)]">
                {formatLongDate(parseDateKey(stats.today.date))}
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-primary)]">
                {stats.today.scorePercent}%
              </div>
            </div>
            <ScoreRing value={stats.today.scorePercent} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={stats.today.dayStatus} />
            <StatusBadge tone="accent" label={`${stats.weeklyAverage}% weekly average`} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
                Streak
              </div>
              <div className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                {stats.currentStreak} days
              </div>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
                Success rate
              </div>
              <div className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                {stats.successRate}%
              </div>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-tertiary)]">
                Longest run
              </div>
              <div className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                {stats.longestStreak} days
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
