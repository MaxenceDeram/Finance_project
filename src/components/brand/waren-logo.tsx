import { cn } from "@/lib/utils";

export type WarenLogoTone = "default" | "accepted" | "in-progress" | "rejected";
export type WarenLogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const toneClasses: Record<
  WarenLogoTone,
  {
    glow: string;
    wordmark: string;
    shardA: string;
    shardB: string;
    shardC: string;
    shardD: string;
    shardE: string;
  }
> = {
  default: {
    glow: "drop-shadow-[0_0_18px_rgba(79,70,229,0.18)]",
    wordmark: "text-[#252766]",
    shardA: "fill-[#1e225f]",
    shardB: "fill-[#2d3487]",
    shardC: "fill-[#5c65f0]",
    shardD: "fill-[#2a327f]",
    shardE: "fill-[#1e2466]"
  },
  accepted: {
    glow: "drop-shadow-[0_0_18px_rgba(24,178,107,0.2)]",
    wordmark: "text-[#0f6c44]",
    shardA: "fill-[#0f6c44]",
    shardB: "fill-[#157a4d]",
    shardC: "fill-[#18b26b]",
    shardD: "fill-[#169e5f]",
    shardE: "fill-[#0f6c44]"
  },
  "in-progress": {
    glow: "drop-shadow-[0_0_18px_rgba(214,145,42,0.18)]",
    wordmark: "text-[#9a6215]",
    shardA: "fill-[#935d14]",
    shardB: "fill-[#b06d14]",
    shardC: "fill-[#d6912a]",
    shardD: "fill-[#c57e18]",
    shardE: "fill-[#935d14]"
  },
  rejected: {
    glow: "drop-shadow-[0_0_18px_rgba(227,93,106,0.2)]",
    wordmark: "text-[#b23b49]",
    shardA: "fill-[#a93d4a]",
    shardB: "fill-[#c14957]",
    shardC: "fill-[#e35d6a]",
    shardD: "fill-[#d35562]",
    shardE: "fill-[#a93d4a]"
  }
};

const lockupSizes: Record<
  WarenLogoSize,
  {
    gap: string;
    mark: string;
    wordmark: string;
  }
> = {
  xs: {
    gap: "gap-1.5",
    mark: "h-4 w-4",
    wordmark: "text-[1rem]"
  },
  sm: {
    gap: "gap-2",
    mark: "h-6 w-6",
    wordmark: "text-[1.25rem]"
  },
  md: {
    gap: "gap-2.5",
    mark: "h-9 w-9",
    wordmark: "text-[1.85rem]"
  },
  lg: {
    gap: "gap-3",
    mark: "h-[2.7rem] w-[2.7rem]",
    wordmark: "text-[2.25rem]"
  },
  xl: {
    gap: "gap-3.5",
    mark: "h-12 w-12",
    wordmark: "text-[2.75rem]"
  },
  hero: {
    gap: "gap-4",
    mark: "h-14 w-14",
    wordmark: "text-[3.35rem]"
  }
};

export function WarenLogo({
  tone = "default",
  size = "md",
  withWordmark = true,
  surface = "light",
  className,
  markClassName,
  wordmarkClassName
}: {
  tone?: WarenLogoTone;
  size?: WarenLogoSize;
  withWordmark?: boolean;
  surface?: "light" | "dark";
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  const palette = toneClasses[tone];
  const sizeClasses = lockupSizes[size];
  const defaultWordmarkClass = surface === "dark" ? "text-white" : palette.wordmark;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center leading-none",
        sizeClasses.gap,
        className
      )}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={cn(
          "brand-mark-float shrink-0 overflow-visible",
          palette.glow,
          sizeClasses.mark,
          markClassName
        )}
      >
        <polygon points="6,28 29,18 41,26 19,37" className={palette.shardA} />
        <polygon points="32,18 53,8 41,27 28,19" className={palette.shardB} />
        <polygon points="41,27 56,13 48,40 33,31" className={palette.shardC} />
        <polygon points="27,39 46,48 38,63 18,51" className={palette.shardD} />
        <polygon points="19,52 29,60 19,63" className={palette.shardE} />
      </svg>

      {withWordmark ? (
        <span
          className={cn(
            "shrink-0 font-semibold leading-none tracking-normal",
            sizeClasses.wordmark,
            defaultWordmarkClass,
            wordmarkClassName
          )}
        >
          Waren
        </span>
      ) : null}
    </span>
  );
}
