import type { ReactNode } from "react";

import { ShellChrome } from "@/components/layout/shell-chrome";
import { getOptionalSession } from "@/lib/session";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getOptionalSession();

  return (
    <ShellChrome userDisplayName={session?.displayName}>
      {children}
    </ShellChrome>
  );
}
