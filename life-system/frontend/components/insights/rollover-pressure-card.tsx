import { RotateCcw } from "lucide-react";

import { InsightPatternCard } from "@/components/insights/insight-pattern-card";
import type { RolloverTaskStat } from "@/types";

export function RolloverPressureCard({
  tasks,
}: {
  tasks: RolloverTaskStat[];
}) {
  return (
    <InsightPatternCard
      title="Rollover pressure"
      description="The flexible tasks that most frequently spill into another day."
    >
      <div className="space-y-3">
        {tasks.length ? (
          tasks.map((task) => (
            <div
              key={`${task.type}-${task.title}`}
              className="flex items-center justify-between gap-4 rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div>
                <div className="text-sm font-medium text-[color:var(--text-primary)]">
                  {task.title}
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  {task.type.toLowerCase()}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(91,96,255,0.12)] px-3 py-1.5 text-sm text-[color:var(--accent)]">
                <RotateCcw className="h-4 w-4" />
                {task.count}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
            No rollover pressure detected in the current insight window.
          </p>
        )}
      </div>
    </InsightPatternCard>
  );
}
