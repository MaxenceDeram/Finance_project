import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-motion-field
        className={cn(
          "flex min-h-28 w-full rounded-2xl border border-input bg-white px-3.5 py-3 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-offset-background placeholder:text-muted-foreground transition-all duration-200 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
