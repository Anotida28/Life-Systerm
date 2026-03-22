"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import {
  createHabitAction,
  moveHabitAction,
  toggleHabitActiveAction,
  updateHabitAction,
} from "@/actions/habits";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { ActionNotice } from "@/components/shared/action-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { getBackendErrorMessage } from "@/lib/backend-api";
import type { HabitView } from "@/types";

export function HabitsList({ initialHabits }: { initialHabits: HabitView[] }) {
  const [habits, setHabits] = useState(initialHabits);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);

  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  async function run(
    action: () => Promise<HabitView[]>,
    successMessage: string,
  ) {
    setFeedback(null);
    setIsBusy(true);

    try {
      const next = await action();
      setHabits(next);
      setFeedback({
        tone: "success",
        message: successMessage,
      });
      return true;
    } catch (error) {
      console.error(error);
      setFeedback({
        tone: "danger",
        message: getBackendErrorMessage(error, "Could not save habit changes."),
      });
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  const activeHabits = habits.filter((habit) => habit.isActive);
  const archivedHabits = habits.filter((habit) => !habit.isActive);

  return (
    <div className="space-y-6">
      <HabitForm
        onCreate={(name) =>
          run(() => createHabitAction({ name }), "Habit added successfully.")
        }
        isBusy={isBusy}
      />

      {feedback ? (
        <ActionNotice tone={feedback.tone} message={feedback.message} />
      ) : null}

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
                  onSave={(id, name) =>
                    run(() => updateHabitAction({ id, name }), "Habit updated successfully.")
                  }
                  onToggleActive={async (id, isActive) => {
                    await run(
                      () => toggleHabitActiveAction({ id, isActive }),
                      isActive ? "Habit activated successfully." : "Habit archived successfully.",
                    );
                  }}
                  onMove={async (id, direction) => {
                    await run(
                      () => moveHabitAction({ id, direction }),
                      "Habit order updated successfully.",
                    );
                  }}
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
                    onSave={(id, name) =>
                      run(() => updateHabitAction({ id, name }), "Habit updated successfully.")
                    }
                    onToggleActive={async (id, isActive) => {
                      await run(
                        () => toggleHabitActiveAction({ id, isActive }),
                        isActive ? "Habit activated successfully." : "Habit archived successfully.",
                      );
                    }}
                    onMove={async (id, direction) => {
                      await run(
                        () => moveHabitAction({ id, direction }),
                        "Habit order updated successfully.",
                      );
                    }}
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
