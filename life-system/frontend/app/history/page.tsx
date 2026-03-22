export const dynamic = "force-dynamic";

import { HistoryList } from "@/components/history/history-list";
import { PageHeader } from "@/components/shared/page-header";
import { backendRequest } from "@/lib/backend-api";
import type { DailyRecordSummary } from "@/types";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const records = await backendRequest<DailyRecordSummary[]>("/api/history");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily archive"
        title="History"
        description="Review previous days with score, streak snapshots, completion counts, and the details behind each performance."
      />
      <HistoryList records={records} />
    </div>
  );
}
