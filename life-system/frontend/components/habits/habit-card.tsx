"use client";

import { ArrowDown, ArrowUp, CheckCircle2, PauseCircle, PenLine, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { HabitView } from "@/types";

export function HabitCard({
  habit,
  onSave,
  onToggleActive,
  onMove,
  isBusy,
}: {
  habit: HabitView;
  onSave: (id: string, name: string) => Promise<boolean>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
  isBusy?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);

  return (
    <div
      className={cn(
        "rounded-[1.55rem] border p-4",
        habit.isActive
          ? "border-[color:var(--line)] bg-[color:var(--surface)]"
          : "border-[rgba(148,163,184,0.12)] bg-[rgba(255,255,255,0.02)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <form
                className="w-full"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const nextName = draft.trim();

                  if (!nextName) {
                    return;
                  }

                  const didSave = await onSave(habit.id, nextName);

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
              <h3 className="text-base font-semibold text-[color:var(--text-primary)]">
                {habit.name}
              </h3>
            )}
            <StatusBadge
              tone={habit.isActive ? "success" : "neutral"}
              label={habit.isActive ? "Active" : "Archived"}
            />
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            {habit.isActive
              ? "This habit will load into each new day automatically."
              : "Archived habits stay in history but stop loading into future days."}
          </p>
        </div>

        <div className="inline-flex rounded-2xl bg-[rgba(91,96,255,0.12)] p-3 text-[color:var(--accent)]">
          {habit.isActive ? <CheckCircle2 className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="icon" disabled={isBusy} onClick={() => onMove(habit.id, "up")}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={isBusy} onClick={() => onMove(habit.id, "down")}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => {
              setDraft(habit.name);
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
        <Button
          type="button"
          variant={habit.isActive ? "secondary" : "subtle"}
          size="sm"
          disabled={isBusy}
          onClick={() => onToggleActive(habit.id, !habit.isActive)}
        >
          {habit.isActive ? "Archive" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
