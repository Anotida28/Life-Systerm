"use client";

import { useState } from "react";
import { Flame } from "lucide-react";

import {
  createHabitAction,
  moveHabitAction,
  toggleHabitActiveAction,
  updateHabitAction,
} from "@/actions/habits";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import type { HabitView } from "@/types";

export function HabitsList({ initialHabits }: { initialHabits: HabitView[] }) {
  const [habits, setHabits] = useState(initialHabits);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<HabitView[]>) {
    setIsBusy(true);

    try {
      const next = await action();
      setHabits(next);
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  const activeHabits = habits.filter((habit) => habit.isActive);
  const archivedHabits = habits.filter((habit) => !habit.isActive);

  return (
    <div className="space-y-6">
      <HabitForm
        onCreate={(name) => run(() => createHabitAction({ name }))}
        isBusy={isBusy}
      />

      <SectionCard
        title="Habit library"
        description="Order and maintain the recurring disciplines that shape your daily score."
      >
        {habits.length ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {activeHabits.map((habit) => (
                <HabitCard
                  key={`${habit.id}-${habit.name}-${habit.isActive ? "active" : "archived"}`}
                  habit={habit}
                  onSave={(id, name) => run(() => updateHabitAction({ id, name }))}
                  onToggleActive={(id, isActive) =>
                    run(() => toggleHabitActiveAction({ id, isActive }))
                  }
                  onMove={(id, direction) => run(() => moveHabitAction({ id, direction }))}
                  isBusy={isBusy}
                />
              ))}
            </div>

            {archivedHabits.length ? (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.26em] text-[color:var(--text-tertiary)]">
                  Archived
                </div>
                {archivedHabits.map((habit) => (
                  <HabitCard
                    key={`${habit.id}-${habit.name}-${habit.isActive ? "active" : "archived"}`}
                    habit={habit}
                    onSave={(id, name) => run(() => updateHabitAction({ id, name }))}
                    onToggleActive={(id, isActive) =>
                      run(() => toggleHabitActiveAction({ id, isActive }))
                    }
                    onMove={(id, direction) => run(() => moveHabitAction({ id, direction }))}
                    isBusy={isBusy}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            icon={Flame}
            title="No habits configured yet"
            description="Create your first non-negotiable and it will automatically load into new daily records."
          />
        )}
      </SectionCard>
    </div>
  );
}
