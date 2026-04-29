import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      data-motion-field
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-white px-3.5 py-2 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-offset-background transition-all duration-200 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
