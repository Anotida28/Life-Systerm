"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import {
  createTaskAction,
  deleteTaskAction,
  moveTaskAction,
  refreshTodayAction,
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
import { ActionNotice } from "@/components/shared/action-notice";
import { getBackendErrorMessage } from "@/lib/backend-api";
import { syncDailyRecordViewMetrics } from "@/lib/scoring";
import type { DailyRecordView, DailyTaskItem, TaskType } from "@/types";

type WorkspaceSection = "habits" | "personal" | "work" | "notes" | "review";

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
  const [pendingSections, setPendingSections] = useState<WorkspaceSection[]>([]);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);

  const personalTasks = useMemo(
    () => sortTasks(record.dailyTasks.filter((task) => task.type === "PERSONAL")),
    [record.dailyTasks],
  );
  const workTasks = useMemo(
    () => sortTasks(record.dailyTasks.filter((task) => task.type === "WORK")),
    [record.dailyTasks],
  );

  function startPending(section: WorkspaceSection) {
    setPendingSections((current) =>
      current.includes(section) ? current : [...current, section],
    );
  }

  function finishPending(section: WorkspaceSection) {
    setPendingSections((current) => current.filter((entry) => entry !== section));
  }

  function isPending(section: WorkspaceSection) {
    return pendingSections.includes(section);
  }

  async function restoreRecord(previous: DailyRecordView) {
    try {
      const refreshed = await refreshTodayAction();
      setRecord(refreshed);
    } catch {
      setRecord(previous);
    }
  }

  async function mutateRecord(
    section: WorkspaceSection,
    optimisticUpdater: (current: DailyRecordView) => DailyRecordView,
    action: () => Promise<DailyRecordView>,
    successMessage: string,
  ) {
    const previous = record;
    setFeedback(null);
    setRecord((current) => syncDailyRecordViewMetrics(optimisticUpdater(current)));
    startPending(section);

    try {
      const next = await action();
      setRecord(next);
      setFeedback({
        tone: "success",
        message: successMessage,
      });
      return true;
    } catch (error) {
      console.error(error);
      await restoreRecord(previous);
      setFeedback({
        tone: "danger",
        message: getBackendErrorMessage(error, "Could not save your changes."),
      });
      return false;
    } finally {
      finishPending(section);
    }
  }

  async function addTask(title: string, type: TaskType) {
    const section = type === "PERSONAL" ? "personal" : "work";
    const label = type === "PERSONAL" ? "Personal task" : "Work task";

    return mutateRecord(
      section,
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
            order: current.dailyTasks.filter((task) => task.type === type).length,
          },
        ],
      }),
      () =>
        createTaskAction({
          dailyRecordId: record.id,
          title,
          type,
        }),
      `${label} added successfully.`,
    );
  }

  async function toggleTask(taskId: string, completed: boolean, type: TaskType) {
    const section = type === "PERSONAL" ? "personal" : "work";

    await mutateRecord(
      section,
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task,
        ),
      }),
      () => toggleTaskAction({ id: taskId, completed }),
      "Task progress updated successfully.",
    );
  }

  async function saveTask(taskId: string, title: string, type: TaskType) {
    const section = type === "PERSONAL" ? "personal" : "work";

    return mutateRecord(
      section,
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.map((task) =>
          task.id === taskId ? { ...task, title } : task,
        ),
      }),
      () => updateTaskAction({ taskId, title }),
      "Task updated successfully.",
    );
  }

  async function deleteTask(taskId: string, type: TaskType) {
    const section = type === "PERSONAL" ? "personal" : "work";

    await mutateRecord(
      section,
      (current) => ({
        ...current,
        dailyTasks: current.dailyTasks.filter((task) => task.id !== taskId),
      }),
      () => deleteTaskAction({ id: taskId }),
      "Task deleted successfully.",
    );
  }

  async function moveTask(taskId: string, type: TaskType, direction: "up" | "down") {
    const section = type === "PERSONAL" ? "personal" : "work";

    await mutateRecord(
      section,
      (current) => swapTaskOrder(current, type, taskId, direction),
      () => moveTaskAction({ id: taskId, direction }),
      "Task order updated successfully.",
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

      {feedback ? <ActionNotice tone={feedback.tone} message={feedback.message} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <div className="space-y-6">
          <HabitChecklist
            habits={record.dailyHabits}
            completionRate={Math.round(record.habitsScore * 100)}
            onToggle={(habitId, completed) =>
              mutateRecord(
                "habits",
                (current) => ({
                  ...current,
                  dailyHabits: current.dailyHabits.map((habit) =>
                    habit.id === habitId ? { ...habit, completed } : habit,
                  ),
                }),
                () => toggleDailyHabitAction({ id: habitId, completed }),
                "Habit progress updated successfully.",
              ).then(() => undefined)
            }
            isBusy={isPending("habits")}
          />

          <TaskSection
            title="Personal Tasks"
            description="Flexible personal work that still matters today."
            placeholder="Add a personal task"
            tasks={personalTasks}
            onAdd={(title) => addTask(title, "PERSONAL")}
            onToggle={(taskId, completed) => toggleTask(taskId, completed, "PERSONAL")}
            onSave={(taskId, title) => saveTask(taskId, title, "PERSONAL")}
            onDelete={(taskId) => deleteTask(taskId, "PERSONAL")}
            onMove={(taskId, direction) => moveTask(taskId, "PERSONAL", direction)}
            isBusy={isPending("personal")}
          />

          <TaskSection
            title="Work Tasks"
            description="Focused work commitments that should move forward today."
            placeholder="Add a work task"
            tasks={workTasks}
            onAdd={(title) => addTask(title, "WORK")}
            onToggle={(taskId, completed) => toggleTask(taskId, completed, "WORK")}
            onSave={(taskId, title) => saveTask(taskId, title, "WORK")}
            onDelete={(taskId) => deleteTask(taskId, "WORK")}
            onMove={(taskId, direction) => moveTask(taskId, "WORK", direction)}
            isBusy={isPending("work")}
          />
        </div>

        <div className="space-y-6">
          <NotesEditor
            key={`${record.id}:${record.notes}`}
            value={record.notes}
            onSave={(notes) =>
              mutateRecord(
                "notes",
                (current) => ({
                  ...current,
                  notes,
                }),
                () => updateDailyNotesAction({ dailyRecordId: record.id, notes }),
                "Notes saved successfully.",
              ).then(() => undefined)
            }
            isBusy={isPending("notes")}
          />

          <EndOfDayReviewForm
            key={`${record.id}:${record.mood ?? "none"}:${record.energy ?? "none"}:${record.winOfTheDay}:${record.whatSlowedMeDown}`}
            mood={record.mood}
            energy={record.energy}
            winOfTheDay={record.winOfTheDay}
            whatSlowedMeDown={record.whatSlowedMeDown}
            onSave={(review) =>
              mutateRecord(
                "review",
                (current) => ({
                  ...current,
                  ...review,
                }),
                () =>
                  updateDailyReviewAction({
                    dailyRecordId: record.id,
                    ...review,
                  }),
                "End-of-day review saved successfully.",
              ).then(() => undefined)
            }
            isBusy={isPending("review")}
          />

          <ScoreBreakdownCard record={record} />
          <StreakCard record={record} />
        </div>
      </div>
    </motion.div>
  );
}
