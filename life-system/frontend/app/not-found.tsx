import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

import { Button } from "@/components/shared/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function NotFound() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Missing page"
        title="That view is not here."
        description="The route you opened could not be found. The rest of your system is still intact."
      />
      <EmptyState
        icon={SearchX}
        title="Nothing to show here"
        description="Try jumping back to the dashboard or your daily workspace."
        action={
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        }
      />
    </div>
  );
}
