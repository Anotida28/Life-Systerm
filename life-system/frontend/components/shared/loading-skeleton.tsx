import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[1.5rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.08),rgba(255,255,255,0.04))]",
        className,
      )}
    />
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-12 w-72" />
        <LoadingSkeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
      </div>
      <LoadingSkeleton className="h-72" />
      <LoadingSkeleton className="h-64" />
    </div>
  );
}
