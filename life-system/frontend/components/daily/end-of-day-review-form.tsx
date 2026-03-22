"use client";

import { BatteryCharging, HeartPulse, Save } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/shared/button";
import { SectionCard } from "@/components/shared/section-card";
import { Textarea } from "@/components/shared/textarea";
import { cn } from "@/lib/utils";

const scale = [1, 2, 3, 4, 5];

export function EndOfDayReviewForm({
  mood,
  energy,
  winOfTheDay,
  whatSlowedMeDown,
  onSave,
  isBusy,
}: {
  mood: number | null;
  energy: number | null;
  winOfTheDay: string;
  whatSlowedMeDown: string;
  onSave: (review: {
    mood: number | null;
    energy: number | null;
    winOfTheDay: string;
    whatSlowedMeDown: string;
  }) => Promise<void>;
  isBusy?: boolean;
}) {
  const [draft, setDraft] = useState({
    mood,
    energy,
    winOfTheDay,
    whatSlowedMeDown,
  });

  const summary = useMemo(() => {
    if (!draft.mood && !draft.energy) {
      return "Add a quick reflection so your data keeps its human context.";
    }

    return `Mood ${draft.mood ?? "-"} / 5 and energy ${draft.energy ?? "-"} / 5.`;
  }, [draft.energy, draft.mood]);

  return (
    <SectionCard
      title="End-of-Day Review"
      description={summary}
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onSave(draft)}
          disabled={isBusy}
        >
          <Save className="h-4 w-4" />
          Save review
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
              <HeartPulse className="h-4 w-4 text-[color:var(--accent)]" />
              Mood
            </div>
            <div className="grid grid-cols-5 gap-2">
              {scale.map((value) => (
                <button
                  key={`mood-${value}`}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, mood: value }))}
                  className={cn(
                    "rounded-[1rem] border px-3 py-2 text-sm transition",
                    draft.mood === value
                      ? "border-[rgba(91,96,255,0.24)] bg-[rgba(91,96,255,0.14)] text-[color:var(--text-primary)]"
                      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--text-secondary)]",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
              <BatteryCharging className="h-4 w-4 text-[color:var(--accent-soft)]" />
              Energy
            </div>
            <div className="grid grid-cols-5 gap-2">
              {scale.map((value) => (
                <button
                  key={`energy-${value}`}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, energy: value }))}
                  className={cn(
                    "rounded-[1rem] border px-3 py-2 text-sm transition",
                    draft.energy === value
                      ? "border-[rgba(77,214,196,0.24)] bg-[rgba(77,214,196,0.14)] text-[color:var(--text-primary)]"
                      : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--text-secondary)]",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
              Win of the day
            </label>
            <Textarea
              value={draft.winOfTheDay}
              onChange={(event) =>
                setDraft((current) => ({ ...current, winOfTheDay: event.target.value }))
              }
              placeholder="What are you proud of today?"
              className="min-h-24"
              disabled={isBusy}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
              What slowed you down?
            </label>
            <Textarea
              value={draft.whatSlowedMeDown}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  whatSlowedMeDown: event.target.value,
                }))
              }
              placeholder="What friction showed up today?"
              className="min-h-24"
              disabled={isBusy}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
