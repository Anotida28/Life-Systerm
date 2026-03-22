import { Flame, Medal, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import type { DashboardStats } from "@/types";

export function StreakOverviewCard({ stats }: { stats: DashboardStats }) {
  return (
    <SectionCard
      title="Consistency"
      description="A clean read on streak health and historical resilience."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Current streak" value={`${stats.currentStreak}`} meta="days in a row" icon={Flame} />
        <StatCard label="Longest streak" value={`${stats.longestStreak}`} meta="best historical run" icon={Medal} />
        <StatCard label="Success rate" value={`${stats.successRate}%`} meta="across tracked records" icon={ShieldCheck} />
      </div>
    </SectionCard>
  );
}
