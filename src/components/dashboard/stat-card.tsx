import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  marker,
  tone = "neutral",
  highlight = false
}: {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  marker?: React.ReactNode;
  tone?: "neutral" | "positive" | "negative";
  highlight?: boolean;
}) {
  const sparkHeights = [18, 28, 24, 34, 22, 30, 20];

  return (
    <Card
      className={cn(
        "surface-hover-lift overflow-hidden border-border/80",
        highlight && "premium-dark-card border-transparent text-white"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-normal text-muted-foreground",
                highlight && "text-white/65"
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "mt-3 text-3xl font-semibold tracking-normal",
                tone === "positive" && "text-[color:var(--positive)]",
                tone === "negative" && "text-[color:var(--negative)]",
                highlight && "text-white"
              )}
            >
              {value}
            </p>
          </div>
          {marker ? marker : Icon ? (
            <div
              className={cn(
                "rounded-2xl border border-border bg-[#f8faff] p-2.5 text-muted-foreground shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
                highlight && "border-white/10 bg-white/10 text-white"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex items-end gap-1.5">
          {sparkHeights.map((height, index) => (
            <span
              key={`${label}-${index}`}
              className={cn(
                "spark-bar w-2 rounded-full bg-[#dfe5ff]",
                tone === "positive" && "bg-[#9ae6c1]",
                tone === "negative" && "bg-[#f3b5bc]",
                highlight && "bg-white/20"
              )}
              style={{ height, animationDelay: `${index * 0.12}s` }}
            />
          ))}
        </div>
        {detail ? (
          <p
            className={cn(
              "mt-5 border-t border-border/80 pt-3 text-sm text-muted-foreground",
              highlight && "border-white/10 text-white/70"
            )}
          >
            {detail}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
