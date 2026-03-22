import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionCard } from "@/components/shared/section-card";
import type { DailyRecordView } from "@/types";

export function TodayStatusCard({ today }: { today: DailyRecordView }) {
  return (
    <SectionCard
      title="Today at a glance"
      description="See how each category is contributing to today’s score."
    >
      <div className="space-y-5">
        <ProgressBar
          value={Math.round(today.habitsScore * 100)}
          label="Non-negotiables"
          detail={`${today.completedHabits}/${today.totalHabits}`}
        />
        <ProgressBar
          value={Math.round(today.personalScore * 100)}
          label="Personal"
          detail={`${today.completedPersonalTasks}/${today.totalPersonalTasks}`}
        />
        <ProgressBar
          value={Math.round(today.workScore * 100)}
          label="Work"
          detail={`${today.completedWorkTasks}/${today.totalWorkTasks}`}
        />
      </div>
    </SectionCard>
  );
}
