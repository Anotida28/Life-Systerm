export const dynamic = "force-dynamic";

import { TodayWorkspace } from "@/components/daily/today-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { backendRequest } from "@/lib/backend-api";
import type { DailyRecordView } from "@/types";

export const metadata = {
  title: "Today",
};

export default async function TodayPage() {
  const today = await backendRequest<DailyRecordView>("/api/daily/today");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily workflow"
        title="Today"
        description="Track your non-negotiables, personal tasks, work tasks, notes, reflection, and live score in one focused workspace."
      />
      <TodayWorkspace initialRecord={today} />
    </div>
  );
}
