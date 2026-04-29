import type {
  ApplicationDocumentType,
  ApplicationStatus,
  ContractType
} from "@prisma/client";

export const applicationDateRangeOptions = [
  { value: "ALL", label: "Toutes les dates" },
  { value: "LAST_7_DAYS", label: "7 derniers jours" },
  { value: "LAST_30_DAYS", label: "30 derniers jours" },
  { value: "LAST_90_DAYS", label: "90 derniers jours" },
  { value: "THIS_YEAR", label: "Cette annee" }
] as const;

export type ApplicationDateRange = (typeof applicationDateRangeOptions)[number]["value"];

export const applicationStatusOptions = [
  { value: "TO_APPLY", label: "À postuler" },
  { value: "APPLIED", label: "Candidature envoyée" },
  { value: "FOLLOW_UP_SENT", label: "Relance envoyée" },
  { value: "HR_INTERVIEW", label: "Entretien RH" },
  { value: "TECHNICAL_INTERVIEW", label: "Entretien technique" },
  { value: "CASE_STUDY", label: "Étude de cas" },
  { value: "OFFER_RECEIVED", label: "Offre reçue" },
  { value: "REJECTED", label: "Refusée" },
  { value: "ACCEPTED", label: "Acceptée" }
] as const satisfies ReadonlyArray<{
  value: ApplicationStatus;
  label: string;
}>;

export const contractTypeOptions = [
  { value: "INTERNSHIP", label: "Stage" },
  { value: "APPRENTICESHIP", label: "Alternance" },
  { value: "FULL_TIME", label: "CDI / Temps plein" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "TEMPORARY", label: "CDD / Temporaire" },
  { value: "OTHER", label: "Autre" }
] as const satisfies ReadonlyArray<{ value: ContractType; label: string }>;

export const interviewStatuses = new Set<ApplicationStatus>([
  "HR_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "CASE_STUDY"
]);

export const responseStatuses = new Set<ApplicationStatus>([
  "FOLLOW_UP_SENT",
  "HR_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "CASE_STUDY",
  "OFFER_RECEIVED",
  "REJECTED",
  "ACCEPTED"
]);

export const applicationStatusLabels = Object.fromEntries(
  applicationStatusOptions.map((option) => [option.value, option.label])
) as Record<ApplicationStatus, string>;

export const contractTypeLabels = Object.fromEntries(
  contractTypeOptions.map((option) => [option.value, option.label])
) as Record<ContractType, string>;

export const applicationStatusValues = applicationStatusOptions.map(
  (option) => option.value
);
export const applicationDateRangeValues = applicationDateRangeOptions.map(
  (option) => option.value
);

export function isApplicationStatus(
  value: string | undefined
): value is ApplicationStatus {
  return Boolean(value && applicationStatusValues.includes(value as ApplicationStatus));
}

export function isApplicationDateRange(
  value: string | undefined
): value is ApplicationDateRange {
  return Boolean(
    value && applicationDateRangeValues.includes(value as ApplicationDateRange)
  );
}

export function getApplicationStatusLabel(status: ApplicationStatus) {
  return applicationStatusLabels[status];
}

export function getContractTypeLabel(contractType: ContractType) {
  return contractTypeLabels[contractType];
}

export const applicationDocumentTypeLabels: Record<ApplicationDocumentType, string> = {
  RESUME: "CV",
  COVER_LETTER: "Lettre de motivation",
  OTHER: "Document complementaire"
};

export function getApplicationDocumentTypeLabel(documentType: ApplicationDocumentType) {
  return applicationDocumentTypeLabels[documentType];
}
