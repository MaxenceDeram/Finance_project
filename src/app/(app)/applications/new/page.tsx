import type { ContractType } from "@prisma/client";
import { ApplicationForm } from "@/features/applications/application-form";
import { contractTypeOptions } from "@/features/applications/constants";
import { JobOfferImportForm } from "@/features/applications/job-offer-import-form";

export default async function NewApplicationPage({
  searchParams
}: {
  searchParams: Promise<{
    imported?: string;
    companyName?: string;
    roleTitle?: string;
    location?: string;
    contractType?: string;
    listingUrl?: string;
  }>;
}) {
  const params = await searchParams;
  const contractType = contractTypeOptions.some(
    (option) => option.value === params.contractType
  )
    ? (params.contractType as ContractType)
    : "INTERNSHIP";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Nouvelle entree
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
          Ajouter une candidature
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          Creez une fiche propre pour suivre l'offre, le poste, le statut actuel et la
          prochaine etape.
        </p>
      </div>
      <JobOfferImportForm />
      <ApplicationForm
        mode="create"
        values={{
          companyName: params.companyName ?? "",
          roleTitle: params.roleTitle ?? "",
          location: params.location ?? "",
          contractType,
          listingUrl: params.listingUrl ?? "",
          status: "TO_APPLY"
        }}
      />
    </div>
  );
}
