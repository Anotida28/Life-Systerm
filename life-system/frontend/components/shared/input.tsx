import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-[1.25rem] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-[color:var(--text-tertiary)] focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[rgba(91,96,255,0.18)]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
