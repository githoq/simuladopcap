import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md", className)}
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-subtle p-5 space-y-4" style={{ background: "#161B22" }}>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="rounded-lg border border-border-subtle p-4 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-11/12" />
      <div className="space-y-2 pt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
