export const dynamic = "force-dynamic";

import { InsightsOverview } from "@/components/insights/insights-overview";
import { PageHeader } from "@/components/shared/page-header";
import { backendRequest } from "@/lib/backend-api";
import type { InsightsView } from "@/types";

export const metadata = {
  title: "Insights",
};

export default async function InsightsPage() {
  const insights = await backendRequest<InsightsView>("/api/insights");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights engine"
        title="Insights"
        description="Study recurring strengths, weak points, rollover pressure, weekday performance, and practical recommendations driven by your own data."
      />
      <InsightsOverview initialInsights={insights} />
    </div>
  );
}
