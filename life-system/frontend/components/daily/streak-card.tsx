import { Flame, Medal } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DailyRecordView } from "@/types";

export function StreakCard({ record }: { record: DailyRecordView }) {
  return (
    <SectionCard
      title="Streak Summary"
      description="A successful day requires a score of at least 80%."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
            <Flame className="h-4 w-4 text-[color:var(--warning)]" />
            Current streak
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-primary)]">
            {record.currentStreakSnapshot}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">successful days in a row</p>
        </div>
        <div className="rounded-[1.5rem] bg-[rgba(255,255,255,0.03)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--text-primary)]">
            <Medal className="h-4 w-4 text-[color:var(--accent)]" />
            Longest streak
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-primary)]">
            {record.longestStreakSnapshot}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">best historical run</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <StatusBadge
          tone={record.wasSuccessfulDay ? "success" : "warning"}
          label={record.wasSuccessfulDay ? "Successful day" : "Below threshold"}
        />
        <p className="text-sm text-[color:var(--text-secondary)]">
          {record.wasSuccessfulDay
            ? "You are currently protecting the streak."
            : "One more push can still move today above the success line."}
        </p>
      </div>
    </SectionCard>
  );
}
