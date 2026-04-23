import { cn } from "@/lib/utils";

function hashToTone(value: string) {
  const tones = [
    "from-[#e8edff] to-[#dce6ff] text-[#4f46e5]",
    "from-[#e9f7ff] to-[#d9ecff] text-[#2563eb]",
    "from-[#f4ecff] to-[#eadfff] text-[#7c3aed]",
    "from-[#eefbf3] to-[#def5e8] text-[#15803d]"
  ];

  const hash = [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
}

export function CompanyAvatar({
  companyName,
  className
}: {
  companyName: string;
  className?: string;
}) {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        hashToTone(companyName),
        className
      )}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
}
