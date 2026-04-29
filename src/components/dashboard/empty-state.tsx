import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="premium-card surface-hover-lift flex min-h-80 flex-col items-center justify-center rounded-[28px] border border-dashed border-border px-6 py-14 text-center"
      data-motion-panel
      data-motion-intro
    >
      <div
        className="brand-icon-shell rounded-2xl border border-border bg-[#f8faff] p-3 text-muted-foreground"
        data-motion-float
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export { Button };
