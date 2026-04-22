import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-md border border-input bg-card px-3.5 py-2 text-sm text-foreground shadow-[0_1px_0_rgb(17_17_15_/_0.02)] ring-offset-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
