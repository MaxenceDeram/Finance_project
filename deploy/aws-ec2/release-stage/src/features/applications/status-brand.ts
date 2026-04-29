import type { ApplicationStatus } from "@prisma/client";
import type { WarenLogoTone } from "@/components/brand/waren-logo";

export function getBrandToneForApplicationStatus(
  status: ApplicationStatus
): WarenLogoTone {
  switch (status) {
    case "ACCEPTED":
    case "OFFER_RECEIVED":
      return "accepted";
    case "REJECTED":
      return "rejected";
    case "APPLIED":
    case "FOLLOW_UP_SENT":
    case "HR_INTERVIEW":
    case "TECHNICAL_INTERVIEW":
    case "CASE_STUDY":
      return "in-progress";
    default:
      return "default";
  }
}
