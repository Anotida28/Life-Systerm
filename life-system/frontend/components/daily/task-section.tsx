import { BriefcaseBusiness, ListTodo } from "lucide-react";

import { AddTaskInput } from "@/components/daily/add-task-input";
import { TaskItem } from "@/components/daily/task-item";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DailyTaskItem } from "@/types";

export function TaskSection({
  title,
  description,
  placeholder,
  tasks,
  onAdd,
  onToggle,
  onSave,
  onDelete,
  onMove,
  isBusy,
}: {
  title: string;
  description: string;
  placeholder: string;
  tasks: DailyTaskItem[];
  onAdd: (title: string) => Promise<boolean>;
  onToggle: (taskId: string, completed: boolean) => Promise<void>;
  onSave: (taskId: string, title: string) => Promise<boolean>;
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, direction: "up" | "down") => Promise<void>;
  isBusy?: boolean;
}) {
  const carriedOverCount = tasks.filter((task) => task.isCarriedOver).length;

  return (
    <SectionCard title={title} description={description}>
      <CollapsibleSection
        title={`${tasks.length} task${tasks.length === 1 ? "" : "s"} planned`}
        description={
          carriedOverCount
            ? `${carriedOverCount} carried over into today`
            : "Fresh tasks for today"
        }
        rightSlot={
          carriedOverCount ? (
            <StatusBadge tone="accent" label={`${carriedOverCount} rollover`} />
          ) : null
        }
      >
        <div className="space-y-4">
          <AddTaskInput
            placeholder={placeholder}
            onSubmit={onAdd}
            isBusy={isBusy}
          />
          {tasks.length ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={`${task.id}-${task.title}-${task.completed ? "done" : "open"}`}
                  task={task}
                  onToggle={onToggle}
                  onSave={onSave}
                  onDelete={onDelete}
                  onMove={onMove}
                  isBusy={isBusy}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={title.toLowerCase().includes("work") ? BriefcaseBusiness : ListTodo}
              title={`No ${title.toLowerCase()} yet`}
              description="Add a focused task so today has a clear finish line."
            />
          )}
        </div>
      </CollapsibleSection>
    </SectionCard>
  );
}
