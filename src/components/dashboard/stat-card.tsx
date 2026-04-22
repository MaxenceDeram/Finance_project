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
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "mt-3 text-2xl font-semibold tracking-normal",
                tone === "positive" && "text-[color:var(--positive)]",
                tone === "negative" && "text-[color:var(--negative)]"
              )}
            >
              {value}
            </p>
          </div>
          {Icon ? (
            <div className="rounded-md border border-border/70 bg-[color:var(--surface)] p-2 text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        {detail ? (
          <p className="mt-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
            {detail}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
