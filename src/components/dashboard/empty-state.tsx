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
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-12 text-center">
      <div className="rounded-md bg-accent p-3 text-accent-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-normal">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { Button };
