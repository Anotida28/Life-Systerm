import { History } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { DailyRecordSummary } from "@/types";
import { HistoryDayCard } from "@/components/history/history-day-card";

export function HistoryList({ records }: { records: DailyRecordSummary[] }) {
  if (!records.length) {
    return (
      <EmptyState
        icon={History}
        title="No history yet"
        description="Once you start tracking days, they will appear here with score, streak, and completion details."
      />
    );
  }

  const bestId = [...records].sort((left, right) => right.scorePercent - left.scorePercent)[0]?.id;
  const worstId = [...records].sort((left, right) => left.scorePercent - right.scorePercent)[0]?.id;

  return (
    <div className="grid gap-4">
      {records.map((record) => (
        <HistoryDayCard
          key={record.id}
          record={record}
          highlight={
            record.id === bestId
              ? "best"
              : record.id === worstId
                ? "worst"
                : undefined
          }
        />
      ))}
    </div>
  );
}
