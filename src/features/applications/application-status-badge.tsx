import type { ApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getApplicationStatusLabel } from "./constants";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant={getBadgeVariant(status)}>{getApplicationStatusLabel(status)}</Badge>
  );
}

function getBadgeVariant(status: ApplicationStatus) {
  switch (status) {
    case "TO_APPLY":
      return "secondary" as const;
    case "APPLIED":
      return "info" as const;
    case "FOLLOW_UP_SENT":
      return "default" as const;
    case "HR_INTERVIEW":
    case "TECHNICAL_INTERVIEW":
    case "CASE_STUDY":
      return "warning" as const;
    case "OFFER_RECEIVED":
    case "ACCEPTED":
      return "success" as const;
    case "REJECTED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}
