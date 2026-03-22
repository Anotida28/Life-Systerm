"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { updateWeeklyReviewAction } from "@/actions/weekly";
import { ActionNotice } from "@/components/shared/action-notice";
import { Button } from "@/components/shared/button";
import { SectionCard } from "@/components/shared/section-card";
import { Textarea } from "@/components/shared/textarea";
import { getBackendErrorMessage } from "@/lib/backend-errors";
import type { WeeklyReviewView } from "@/types";

export function WeeklyReviewForm({ initialReview }: { initialReview: WeeklyReviewView }) {
  const [review, setReview] = useState(initialReview);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);

  useEffect(() => {
    setReview(initialReview);
  }, [initialReview]);

  async function saveReview() {
    setFeedback(null);
    setIsSaving(true);

    try {
      const next = await updateWeeklyReviewAction({
        reviewId: review.id,
        whatWentWell: review.whatWentWell,
        whatWentBadly: review.whatWentBadly,
        whatNeedsToImprove: review.whatNeedsToImprove,
        nextWeekGoals: review.nextWeekGoals,
      });

      setReview(next);
      setFeedback({
        tone: "success",
        message: "Weekly review saved successfully.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        tone: "danger",
        message: getBackendErrorMessage(error, "Could not save the weekly review."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard
      title="Weekly reflection"
      description="Translate the week's data into practical adjustments for the next one."
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSaving}
          onClick={() => {
            void saveReview();
          }}
        >
          <Save className="h-4 w-4" />
          Save review
        </Button>
      }
    >
      <div className="grid gap-4">
        {feedback ? <ActionNotice tone={feedback.tone} message={feedback.message} /> : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            What went well
          </label>
          <Textarea
            value={review.whatWentWell}
            onChange={(event) =>
              setReview((current) => ({ ...current, whatWentWell: event.target.value }))
            }
            placeholder="What supported strong execution this week?"
            className="min-h-28"
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            What went badly
          </label>
          <Textarea
            value={review.whatWentBadly}
            onChange={(event) =>
              setReview((current) => ({ ...current, whatWentBadly: event.target.value }))
            }
            placeholder="Where did the system break down?"
            className="min-h-28"
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            What needs to improve
          </label>
          <Textarea
            value={review.whatNeedsToImprove}
            onChange={(event) =>
              setReview((current) => ({
                ...current,
                whatNeedsToImprove: event.target.value,
              }))
            }
            placeholder="What should change next week?"
            className="min-h-28"
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text-primary)]">
            Next week goals
          </label>
          <Textarea
            value={review.nextWeekGoals}
            onChange={(event) =>
              setReview((current) => ({ ...current, nextWeekGoals: event.target.value }))
            }
            placeholder="What outcomes will define a better next week?"
            className="min-h-28"
            disabled={isSaving}
          />
        </div>
      </div>
    </SectionCard>
  );
}
