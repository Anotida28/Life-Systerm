"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export function ShellChrome({
  children,
  userDisplayName,
}: {
  children: ReactNode;
  userDisplayName?: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="relative min-h-screen">{children}</div>;
  }

  return (
    <div className="relative min-h-screen">
      <TopBar userDisplayName={userDisplayName} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
