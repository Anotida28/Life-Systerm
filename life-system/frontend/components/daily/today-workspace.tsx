"use client";

import type { TaskType } from "@prisma/client";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import {
  createTaskAction,
  deleteTaskAction,
  moveTaskAction,
  toggleDailyHabitAction,
  toggleTaskAction,
  updateDailyNotesAction,
  updateDailyReviewAction,
  updateTaskAction,
} from "@/actions/daily";
import { DailySummaryStrip } from "@/components/daily/daily-summary-strip";
import { EndOfDayReviewForm } from "@/components/daily/end-of-day-review-form";
import { HabitChecklist } from "@/components/daily/habit-checklist";
import { NotesEditor } from "@/components/daily/notes-editor";
import { ScoreBreakdownCard } from "@/components/daily/score-breakdown-card";
import { StreakCard } from "@/components/daily/streak-card";
import { TaskSection } from "@/components/daily/task-section";
import { syncDailyRecordViewMetrics } from "@/lib/domain/scoring";
import type { DailyRecordView, DailyTaskItem } from "@/types";

function sortTasks(tasks: DailyTaskItem[]) {
  return [...tasks].sort((left, right) => {
    if (left.isCarriedOver !== right.isCarriedOver) {
      return left.isCarriedOver ? -1 : 1;
    }

    return left.order - right.order;
  });
}

function swapTaskOrder(
  current: DailyRecordView,
  taskType: TaskType,
  taskId: string,
  direction: "up" | "down",
) {
  const scoped = sortTasks(current.dailyTasks.filter((task) => task.type === taskType));
  const index = scoped.findIndex((task) => task.id === taskId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || swapIndex < 0 || swapIndex >= scoped.length) {
    return current;
  }

  const nextScoped = [...scoped];
  [nextScoped[index], nextScoped[swapIndex]] = [
    nextScoped[swapIndex],
    nextScoped[index],
  ];

  const mapped = nextScoped.map((task, order) => ({ ...task, order }));

  return {
    ...current,
    dailyTasks: current.dailyTasks.map(
      (task) => mapped.find((candidate) => candidate.id === task.id) ?? task,
    ),
  };
}

export function TodayWorkspace({ initialRecord }: { initialRecord: DailyRecordView }) {
  const [record, setRecord] = useState(initialRecord);
  const [isBusy, setIsBusy] = useState(false);

  const personalTasks = useMemo(
    () => sortTasks(record.dailyTasks.filter((task) => task.type === "PERSONAL")),
    [record.dailyTasks],
  );
  const workTasks = useMemo(
    () => sortTasks(record.dailyTasks.filter((task) => task.type === "WORK")),
    [record.dailyTasks],
  );

  async function mutateRecord(
    optimisticUpdater: (current: DailyRecordView) => DailyRecordView,
    action: () => Promise<DailyRecordView>,
  ) {
    const previous = record;
    setRecord((current) => syncDailyRecordViewMetrics(optimisticUpdater(current)));
    setIsBusy(true);

    try {
      const next = await action();
      setRecord(next);
    } catch (error) {
      console.error(error);
      setRecord(previous);
    } finally {
      setIsBusy(false);
    }
  }

  async function addTask(title: string, type: TaskType) {
    await mutateRecord(
      (current) => ({
        ...current,
        dailyTasks: [
          ...current.dailyTasks,
          {
            id: `temp-${type}-${Date.now()}`,
            title,
            type,
            completed: false,
            isCarriedOver: false,
            carriedOverFromDate: null,
            order:
              current.dailyTasks.filter((task) => task.type === type).length,
          },
        ],
      }),
      () =>
        createTaskAction({
          dailyRecordId: record.id,
          title,
          type,
        }),
    );
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await mutateRecord(
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task,
        ),
      }),
      () => toggleTaskAction({ id: taskId, completed }),
    );
  }

  async function saveTask(taskId: string, title: string) {
    await mutateRecord(
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.map((task) =>
          task.id === taskId ? { ...task, title } : task,
        ),
      }),
      () => updateTaskAction({ taskId, title }),
    );
  }

  async function deleteTask(taskId: string) {
    await mutateRecord(
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.filter((task) => task.id !== taskId),
      }),
      () => deleteTaskAction({ id: taskId }),
    );
  }

  async function moveTask(taskId: string, type: TaskType, direction: "up" | "down") {
    await mutateRecord(
      (current) => swapTaskOrder(current, type, taskId, direction),
      () => moveTaskAction({ id: taskId, direction }),
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="sticky top-24 z-20">
        <DailySummaryStrip record={record} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="space-y-6">
          <HabitChecklist
            habits={record.dailyHabits}
            completionRate={Math.round(record.habitsScore * 100)}
            onToggle={(habitId, completed) =>
              mutateRecord(
                (current) => ({
                  ...current,
                  dailyHabits: current.dailyHabits.map((habit) =>
                    habit.id === habitId ? { ...habit, completed } : habit,
                  ),
                }),
                () => toggleDailyHabitAction({ id: habitId, completed }),
              )
            }
            isBusy={isBusy}
          />

          <TaskSection
            title="Personal Tasks"
            description="Flexible personal work that still matters today."
            placeholder="Add a personal task"
            tasks={personalTasks}
            onAdd={(title) => addTask(title, "PERSONAL")}
            onToggle={toggleTask}
            onSave={saveTask}
            onDelete={deleteTask}
            onMove={(taskId, direction) => moveTask(taskId, "PERSONAL", direction)}
            isBusy={isBusy}
          />

          <TaskSection
            title="Work Tasks"
            description="Focused work commitments that should move forward today."
            placeholder="Add a work task"
            tasks={workTasks}
            onAdd={(title) => addTask(title, "WORK")}
            onToggle={toggleTask}
            onSave={saveTask}
            onDelete={deleteTask}
            onMove={(taskId, direction) => moveTask(taskId, "WORK", direction)}
            isBusy={isBusy}
          />
        </div>

        <div className="space-y-6">
          <NotesEditor
            value={record.notes}
            onSave={(notes) =>
              mutateRecord(
                (current) => ({
                  ...current,
                  notes,
                }),
                () => updateDailyNotesAction({ dailyRecordId: record.id, notes }),
              )
            }
            isBusy={isBusy}
          />

          <EndOfDayReviewForm
            mood={record.mood}
            energy={record.energy}
            winOfTheDay={record.winOfTheDay}
            whatSlowedMeDown={record.whatSlowedMeDown}
            onSave={(review) =>
              mutateRecord(
                (current) => ({
                  ...current,
                  ...review,
                }),
                () =>
                  updateDailyReviewAction({
                    dailyRecordId: record.id,
                    ...review,
                  }),
              )
            }
            isBusy={isBusy}
          />

          <ScoreBreakdownCard record={record} />
          <StreakCard record={record} />
        </div>
      </div>
    </motion.div>
  );
}
