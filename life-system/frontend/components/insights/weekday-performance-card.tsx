import { InsightPatternCard } from "@/components/insights/insight-pattern-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { WeekdayPerformance } from "@/types";

export function WeekdayPerformanceCard({
  weekdays,
}: {
  weekdays: WeekdayPerformance[];
}) {
  return (
    <InsightPatternCard
      title="Weekday performance"
      description="Average score by weekday across the latest insight window."
    >
      <div className="space-y-4">
        {weekdays.map((day) => (
          <ProgressBar
            key={day.weekday}
            value={day.averageScore}
            label={day.weekday}
            detail={`${day.averageScore}% • ${day.trackedDays} day${day.trackedDays === 1 ? "" : "s"}`}
          />
        ))}
      </div>
    </InsightPatternCard>
  );
}
