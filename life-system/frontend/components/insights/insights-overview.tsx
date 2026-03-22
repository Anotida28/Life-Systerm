"use client";

import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { refreshInsightsAction } from "@/actions/insights";
import { HabitStrengthCard } from "@/components/insights/habit-strength-card";
import { ImprovementSuggestionsPanel } from "@/components/insights/improvement-suggestions-panel";
import { InsightPatternCard } from "@/components/insights/insight-pattern-card";
import { RolloverPressureCard } from "@/components/insights/rollover-pressure-card";
import { WeekdayPerformanceCard } from "@/components/insights/weekday-performance-card";
import { Button } from "@/components/shared/button";
import { InsightCard } from "@/components/shared/insight-card";
import { MetricCard } from "@/components/shared/metric-card";
import type { InsightsView } from "@/types";

export function InsightsOverview({ initialInsights }: { initialInsights: InsightsView }) {
  const [insights, setInsights] = useState(initialInsights);
  const [isPending, startTransition] = useTransition();

  const recommendations = insights.insights
    .map((item) => item.recommendation)
    .filter((recommendation): recommendation is string => Boolean(recommendation));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Success rate"
          value={insights.successRate}
          ringValue={insights.successRate}
          description="Share of tracked days that met or exceeded the 80% success threshold."
        />
        <MetricCard
          title="Personal trend"
          value={insights.completionTrend.personal}
          ringValue={insights.completionTrend.personal}
          description="Average completion rate for flexible personal work."
        />
        <MetricCard
          title="Work trend"
          value={insights.completionTrend.work}
          ringValue={insights.completionTrend.work}
          description="Average completion rate for flexible work commitments."
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              void (async () => {
                const next = await refreshInsightsAction();
                setInsights(next);
              })();
            });
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh analysis
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {insights.insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <HabitStrengthCard
          strongest={insights.strongestHabits}
          weakest={insights.weakestHabits}
        />
        <RolloverPressureCard tasks={insights.rolloverTasks} />
        <WeekdayPerformanceCard weekdays={insights.weekdayPerformance} />
        <ImprovementSuggestionsPanel suggestions={recommendations} />
        <InsightPatternCard
          title="Most productive days"
          description="The highest scoring days in the current insight window."
        >
          <div className="space-y-3">
            {insights.mostProductiveDays.map((day) => (
              <div
                key={day.id}
                className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[color:var(--text-secondary)]"
              >
                <div className="font-medium text-[color:var(--text-primary)]">{day.date}</div>
                <div className="mt-2">{day.scorePercent}% score</div>
              </div>
            ))}
          </div>
        </InsightPatternCard>
        <InsightPatternCard
          title="Lowest performance patterns"
          description="Days that deserve a second look when you study friction and overload."
        >
          <div className="space-y-3">
            {insights.lowestPerformanceDays.map((day) => (
              <div
                key={day.id}
                className="rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[color:var(--text-secondary)]"
              >
                <div className="font-medium text-[color:var(--text-primary)]">{day.date}</div>
                <div className="mt-2">{day.scorePercent}% score</div>
              </div>
            ))}
          </div>
        </InsightPatternCard>
      </div>
    </div>
  );
}
