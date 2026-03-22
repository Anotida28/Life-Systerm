import { CheckCircle2, XCircle } from "lucide-react";

import { InsightPatternCard } from "@/components/insights/insight-pattern-card";
import type { HabitStrength } from "@/types";

export function HabitStrengthCard({
  strongest,
  weakest,
}: {
  strongest: HabitStrength[];
  weakest: HabitStrength[];
}) {
  return (
    <InsightPatternCard
      title="Habit strength"
      description="Your strongest and weakest recurring disciplines across the latest seven tracked days."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
            Strongest
          </div>
          {strongest.map((habit) => (
            <div key={habit.label} className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-sm font-medium text-[color:var(--text-primary)]">
                {habit.label}
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                {habit.completionRate}% completion ({habit.completed}/{habit.total})
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
            <XCircle className="h-4 w-4 text-[color:var(--danger)]" />
            Weakest
          </div>
          {weakest.map((habit) => (
            <div key={habit.label} className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-sm font-medium text-[color:var(--text-primary)]">
                {habit.label}
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                {habit.completionRate}% completion ({habit.completed}/{habit.total})
              </p>
            </div>
          ))}
        </div>
      </div>
    </InsightPatternCard>
  );
}
