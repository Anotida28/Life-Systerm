import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const toneMap = {
  info: {
    icon: Info,
    className:
      "border-[rgba(91,96,255,0.18)] bg-[rgba(91,96,255,0.1)] text-[color:var(--text-primary)]",
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-[rgba(45,212,191,0.18)] bg-[rgba(45,212,191,0.1)] text-[color:var(--text-primary)]",
  },
  danger: {
    icon: AlertCircle,
    className:
      "border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.1)] text-[color:var(--text-primary)]",
  },
} as const;

export function ActionNotice({
  tone,
  message,
  className,
}: {
  tone: keyof typeof toneMap;
  message: string;
  className?: string;
}) {
  const Icon = toneMap[tone].icon;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 text-sm leading-6",
        toneMap[tone].className,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
