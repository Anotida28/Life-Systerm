import { Sparkles } from "lucide-react";

import { InsightPatternCard } from "@/components/insights/insight-pattern-card";

export function ImprovementSuggestionsPanel({
  suggestions,
}: {
  suggestions: string[];
}) {
  return (
    <InsightPatternCard
      title="Recommendations"
      description="Practical adjustments generated from your actual performance data."
    >
      <div className="space-y-3">
        {suggestions.length ? (
          suggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="flex gap-3 rounded-[1.4rem] bg-[rgba(255,255,255,0.03)] p-4"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
              <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
                {suggestion}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
            The system does not have enough variance yet to recommend meaningful adjustments.
          </p>
        )}
      </div>
    </InsightPatternCard>
  );
}
