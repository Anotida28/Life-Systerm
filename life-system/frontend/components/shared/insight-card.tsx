import { Lightbulb, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { InsightCardData } from "@/types";

const severityLabel = {
  LOW: { tone: "accent", icon: Sparkles },
  MEDIUM: { tone: "warning", icon: TrendingUp },
  HIGH: { tone: "danger", icon: TrendingDown },
} as const;

export function InsightCard({
  insight,
  className,
}: {
  insight: InsightCardData;
  className?: string;
}) {
  const severity = severityLabel[insight.severity];
  const Icon = severity?.icon ?? Lightbulb;

  return (
    <article
      className={cn(
        "rounded-[1.6rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.14)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-2xl bg-[rgba(91,96,255,0.12)] p-3 text-[color:var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <StatusBadge
          tone={severity?.tone ?? "accent"}
          label={insight.severity.toLowerCase()}
          className="capitalize"
        />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[color:var(--text-primary)]">
        {insight.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
        {insight.message}
      </p>
      <div className="mt-4 rounded-[1.25rem] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
        {insight.evidence}
      </div>
      {insight.recommendation ? (
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-primary)]">
          {insight.recommendation}
        </p>
      ) : null}
    </article>
  );
}
