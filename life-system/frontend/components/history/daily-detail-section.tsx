import { CheckCircle2, Circle } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

export function DailyDetailSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{
    id: string;
    label: string;
    completed: boolean;
    badge?: string;
  }>;
}) {
  return (
    <SectionCard title={title} description={description}>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[1.4rem] border px-4 py-3",
              item.completed
                ? "border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.08)]"
                : "border-[color:var(--line)] bg-[color:var(--surface)]",
            )}
          >
            <div className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />
              ) : (
                <Circle className="h-5 w-5 text-[color:var(--text-tertiary)]" />
              )}
              <span className="text-sm font-medium text-[color:var(--text-primary)]">
                {item.label}
              </span>
            </div>
            {item.badge ? <StatusBadge tone="accent" label={item.badge} /> : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
