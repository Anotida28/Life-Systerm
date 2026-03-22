import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionCard } from "@/components/shared/section-card";
import type { DailyRecordView } from "@/types";

export function ScoreBreakdownCard({ record }: { record: DailyRecordView }) {
  return (
    <SectionCard
      title="Score Breakdown"
      description="Weighted daily performance across non-negotiables, personal tasks, and work tasks."
    >
      <div className="space-y-5">
        <ProgressBar
          value={Math.round(record.habitsScore * 100)}
          label="Non-negotiables"
          detail={`${record.completedHabits}/${record.totalHabits} • 50% weight`}
        />
        <ProgressBar
          value={Math.round(record.personalScore * 100)}
          label="Personal tasks"
          detail={`${record.completedPersonalTasks}/${record.totalPersonalTasks} • 25% weight`}
        />
        <ProgressBar
          value={Math.round(record.workScore * 100)}
          label="Work tasks"
          detail={`${record.completedWorkTasks}/${record.totalWorkTasks} • 25% weight`}
        />
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-6 text-[color:var(--text-secondary)]">
        Final score = <span className="text-[color:var(--text-primary)]">{record.scorePercent}%</span>.
        Empty categories score as complete, so the system rewards execution quality rather than forcing filler tasks.
      </div>
    </SectionCard>
  );
}
