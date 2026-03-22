import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionCard } from "@/components/shared/section-card";
import type { DashboardStats } from "@/types";

export function CategoryPerformanceCard({ stats }: { stats: DashboardStats }) {
  return (
    <SectionCard
      title="Category performance"
      description="Average completion by category for the current week."
    >
      <div className="space-y-5">
        <ProgressBar value={stats.categoryCompletion.habits} label="Non-negotiables" />
        <ProgressBar value={stats.categoryCompletion.personal} label="Personal tasks" />
        <ProgressBar value={stats.categoryCompletion.work} label="Work tasks" />
      </div>
    </SectionCard>
  );
}
