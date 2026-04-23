import { ApplicationDocumentType, ApplicationStatus, ContractType } from "@prisma/client";

export const applicationDateRangeOptions = [
  { value: "ALL", label: "Toutes les dates" },
  { value: "LAST_7_DAYS", label: "7 derniers jours" },
  { value: "LAST_30_DAYS", label: "30 derniers jours" },
  { value: "LAST_90_DAYS", label: "90 derniers jours" },
  { value: "THIS_YEAR", label: "Cette annee" }
] as const;

export type ApplicationDateRange = (typeof applicationDateRangeOptions)[number]["value"];

export const applicationStatusOptions: Array<{
  value: ApplicationStatus;
  label: string;
}> = [
  { value: ApplicationStatus.TO_APPLY, label: "À postuler" },
  { value: ApplicationStatus.APPLIED, label: "Candidature envoyée" },
  { value: ApplicationStatus.FOLLOW_UP_SENT, label: "Relance envoyée" },
  { value: ApplicationStatus.HR_INTERVIEW, label: "Entretien RH" },
  { value: ApplicationStatus.TECHNICAL_INTERVIEW, label: "Entretien technique" },
  { value: ApplicationStatus.CASE_STUDY, label: "Étude de cas" },
  { value: ApplicationStatus.OFFER_RECEIVED, label: "Offre reçue" },
  { value: ApplicationStatus.REJECTED, label: "Refusée" },
  { value: ApplicationStatus.ACCEPTED, label: "Acceptée" }
];

export const contractTypeOptions: Array<{ value: ContractType; label: string }> = [
  { value: ContractType.INTERNSHIP, label: "Stage" },
  { value: ContractType.APPRENTICESHIP, label: "Alternance" },
  { value: ContractType.FULL_TIME, label: "CDI / Temps plein" },
  { value: ContractType.PART_TIME, label: "Temps partiel" },
  { value: ContractType.FREELANCE, label: "Freelance" },
  { value: ContractType.TEMPORARY, label: "CDD / Temporaire" },
  { value: ContractType.OTHER, label: "Autre" }
];

export const interviewStatuses = new Set<ApplicationStatus>([
  ApplicationStatus.HR_INTERVIEW,
  ApplicationStatus.TECHNICAL_INTERVIEW,
  ApplicationStatus.CASE_STUDY
]);

export const responseStatuses = new Set<ApplicationStatus>([
  ApplicationStatus.FOLLOW_UP_SENT,
  ApplicationStatus.HR_INTERVIEW,
  ApplicationStatus.TECHNICAL_INTERVIEW,
  ApplicationStatus.CASE_STUDY,
  ApplicationStatus.OFFER_RECEIVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.ACCEPTED
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
