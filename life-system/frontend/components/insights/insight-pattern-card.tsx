import type { ReactNode } from "react";

import { SectionCard } from "@/components/shared/section-card";

export function InsightPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <SectionCard title={title} description={description}>
      {children}
    </SectionCard>
  );
}
