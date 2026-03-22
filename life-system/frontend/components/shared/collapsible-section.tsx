"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
  className,
  rightSlot,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  rightSlot?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={className}>
      <Collapsible.Trigger asChild>
        <button className="flex w-full items-center justify-between gap-4 rounded-[1.4rem] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-left transition hover:bg-[rgba(255,255,255,0.04)]">
          <div>
            <div className="text-sm font-medium text-[color:var(--text-primary)]">
              {title}
            </div>
            {description ? (
              <div className="mt-1 text-xs text-[color:var(--text-secondary)]">
                {description}
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {rightSlot}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[color:var(--text-tertiary)] transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </button>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {open ? (
          <Collapsible.Content forceMount asChild>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4">{children}</div>
            </motion.div>
          </Collapsible.Content>
        ) : null}
      </AnimatePresence>
    </Collapsible.Root>
  );
}
