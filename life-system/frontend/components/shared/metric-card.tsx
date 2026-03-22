import { ProgressBar } from "@/components/shared/progress-bar";
import { ScoreRing } from "@/components/shared/score-ring";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  description,
  ringValue,
  className,
}: {
  title: string;
  value: number;
  description: string;
  ringValue?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.14)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--text-tertiary)]">
            {title}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--text-primary)]">
            {value}%
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            {description}
          </p>
        </div>
        {ringValue !== undefined ? <ScoreRing value={ringValue} size={74} /> : null}
      </div>
      <ProgressBar className="mt-5" label={title} value={value} />
    </div>
  );
}
