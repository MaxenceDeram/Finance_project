import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "mt-2 text-2xl font-semibold tracking-normal",
                tone === "positive" && "text-emerald-700",
                tone === "negative" && "text-red-700"
              )}
            >
              {value}
            </p>
          </div>
          {Icon ? (
            <div className="rounded-md bg-accent p-2 text-accent-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        {detail ? <p className="mt-3 text-sm text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
