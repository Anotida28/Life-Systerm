"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Circle, PenLine, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/shared/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared/dialog";
import { Input } from "@/components/shared/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { DailyTaskItem } from "@/types";

export function TaskItem({
  task,
  onToggle,
  onSave,
  onDelete,
  onMove,
  isBusy,
}: {
  task: DailyTaskItem;
  onToggle: (taskId: string, completed: boolean) => Promise<void>;
  onSave: (taskId: string, title: string) => Promise<boolean>;
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, direction: "up" | "down") => Promise<void>;
  isBusy?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  return (
    <div
      className={cn(
        "rounded-[1.45rem] border px-4 py-4 transition",
        task.completed
          ? "border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.08)]"
          : "border-[color:var(--line)] bg-[color:var(--surface)]",
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id, !task.completed)}
          disabled={isBusy}
          className="mt-0.5 shrink-0 text-[color:var(--accent)]"
          aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5 text-[color:var(--text-tertiary)]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <form
                className="w-full"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const nextTitle = draft.trim();

                  if (!nextTitle) {
                    return;
                  }

                  const didSave = await onSave(task.id, nextTitle);

                  if (didSave) {
                    setIsEditing(false);
                  }
                }}
              >
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  autoFocus
                  disabled={isBusy}
                />
              </form>
            ) : (
              <p
                className={cn(
                  "text-sm font-medium text-[color:var(--text-primary)]",
                  task.completed && "text-[color:var(--text-secondary)] line-through",
                )}
              >
                {task.title}
              </p>
            )}
            {task.isCarriedOver ? (
              <StatusBadge tone="accent" label="Carried over" />
            ) : null}
          </div>

          {task.isCarriedOver && task.carriedOverFromDate ? (
            <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">
              Rolled forward from {task.carriedOverFromDate}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isBusy}
              onClick={() => onMove(task.id, "up")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isBusy}
              onClick={() => onMove(task.id, "down")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            {isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => {
                  setDraft(task.title);
                  setIsEditing(false);
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => setIsEditing(true)}
              >
                <PenLine className="h-4 w-4" />
                Edit
              </Button>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" disabled={isBusy}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete task?</DialogTitle>
                  <DialogDescription>
                    This removes the task from today and updates your score immediately.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Keep task
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDelete(task.id)}
                    >
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
