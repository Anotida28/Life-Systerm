export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { DailyDetailSection } from "@/components/history/daily-detail-section";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreBreakdownCard } from "@/components/daily/score-breakdown-card";
import { StreakCard } from "@/components/daily/streak-card";
import { SectionCard } from "@/components/shared/section-card";
import { backendRequest } from "@/lib/backend-api";
import { formatLongDate, parseDateKey } from "@/lib/date";
import type { DailyRecordView } from "@/types";

export default async function DailyDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  let record: DailyRecordView | null = null;

  try {
    record = await backendRequest<DailyRecordView>(`/api/history/${date}`);
  } catch {
    record = null;
  }

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily detail"
        title={formatLongDate(parseDateKey(record.date))}
        description="A full readout of habits, flexible tasks, reflection, score, streak state, and any rollover pressure that showed up on this day."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <DailyDetailSection
            title="Non-Negotiables"
            description="The recurring foundations of the day."
            items={record.dailyHabits.map((habit) => ({
              id: habit.id,
              label: habit.labelSnapshot,
              completed: habit.completed,
            }))}
          />
          <DailyDetailSection
            title="Personal Tasks"
            description="Flexible personal work recorded for this day."
            items={record.dailyTasks
              .filter((task) => task.type === "PERSONAL")
              .map((task) => ({
                id: task.id,
                label: task.title,
                completed: task.completed,
                badge: task.isCarriedOver ? "Carried over" : undefined,
              }))}
          />
          <DailyDetailSection
            title="Work Tasks"
            description="Flexible work commitments recorded for this day."
            items={record.dailyTasks
              .filter((task) => task.type === "WORK")
              .map((task) => ({
                id: task.id,
                label: task.title,
                completed: task.completed,
                badge: task.isCarriedOver ? "Carried over" : undefined,
              }))}
          />
          <SectionCard title="Notes" description="Context and narrative captured for the day.">
            <p className="text-sm leading-7 text-[color:var(--text-secondary)]">
              {record.notes || "No notes were captured for this day."}
            </p>
          </SectionCard>
          <SectionCard
            title="End-of-Day Review"
            description="The reflective fields captured alongside the score."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  Mood
                </div>
                <div className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {record.mood ?? "-"}
                </div>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  Energy
                </div>
                <div className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {record.energy ?? "-"}
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  Win of the day
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                  {record.winOfTheDay || "No entry"}
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  What slowed me down
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                  {record.whatSlowedMeDown || "No entry"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <ScoreBreakdownCard record={record} />
          <StreakCard record={record} />
        </div>
      </div>
    </div>
  );
}
