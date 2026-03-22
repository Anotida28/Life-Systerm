"use client";

import { NotebookPen, Save } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/shared/button";
import { SectionCard } from "@/components/shared/section-card";
import { Textarea } from "@/components/shared/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

export function NotesEditor({
  value,
  onSave,
  isBusy,
}: {
  value: string;
  onSave: (notes: string) => Promise<void>;
  isBusy?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextarea(ref, draft);

  return (
    <SectionCard
      title="Notes"
      description="Capture context, observations, and anything worth remembering from the day."
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onSave(draft)}
          disabled={isBusy}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      }
    >
      <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--text-tertiary)]">
          <NotebookPen className="h-4 w-4" />
          Daily notes
        </div>
        <Textarea
          ref={ref}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What happened today? What needs context tomorrow?"
          className="min-h-[180px] border-transparent bg-transparent px-0 py-0 focus:border-transparent focus:ring-0"
        />
      </div>
    </SectionCard>
  );
}
