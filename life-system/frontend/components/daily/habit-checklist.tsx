import { CheckCircle2, Circle } from "lucide-react";

import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";
import type { DailyHabitItem } from "@/types";

export function HabitChecklist({
  habits,
  completionRate,
  onToggle,
  isBusy,
}: {
  habits: DailyHabitItem[];
  completionRate: number;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
  isBusy?: boolean;
}) {
  return (
    <SectionCard
      title="Non-Negotiables"
      description="Recurring discipline items that define a solid day."
    >
      <ProgressBar
        value={completionRate}
        label="Habit completion"
        detail={`${habits.filter((habit) => habit.completed).length}/${habits.length}`}
      />

      <div className="mt-5 grid gap-3">
        {habits.map((habit) => (
          <button
            key={habit.id}
            type="button"
            onClick={() => onToggle(habit.id, !habit.completed)}
            disabled={isBusy}
            className={cn(
              "flex w-full items-center gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition",
              habit.completed
                ? "border-[rgba(45,212,191,0.22)] bg-[rgba(45,212,191,0.1)]"
                : "border-[color:var(--line)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-strong)]",
            )}
          >
            <span className="text-[color:var(--accent)]">
              {habit.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5 text-[color:var(--text-tertiary)]" />
              )}
            </span>
            <span className="flex-1 text-sm font-medium text-[color:var(--text-primary)]">
              {habit.labelSnapshot}
            </span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
