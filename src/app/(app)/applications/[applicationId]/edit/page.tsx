import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApplicationDocumentsManager } from "@/features/applications/application-documents-manager";
import { ApplicationForm } from "@/features/applications/application-form";
import { getJobApplicationForUser } from "@/features/applications/service";
import { requireUser } from "@/server/security/sessions";

export default async function EditApplicationPage({
  params,
  searchParams
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireUser();
  const { applicationId } = await params;
  const query = await searchParams;
  const application = await getJobApplicationForUser(applicationId, user.id).catch(
    () => null
  );

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Edition
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            {application.companyName}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Mettez a jour le statut, la relance prevue ou les notes de preparation.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/applications">
            <ArrowLeft aria-hidden="true" />
            Retour a la liste
          </Link>
        </Button>
      </div>

      {query.created ? (
        <Alert>
          La candidature a bien ete creee. Vous pouvez maintenant la completer.
        </Alert>
      ) : null}

      <ApplicationForm
        mode="edit"
        values={{
          id: application.id,
          companyName: application.companyName,
          roleTitle: application.roleTitle,
          contractType: application.contractType,
          location: application.location,
          applicationDate: application.applicationDate?.toISOString().slice(0, 10) ?? "",
          status: application.status,
          listingUrl: application.listingUrl,
          hrContact: application.hrContact,
          compensation: application.compensation,
          notes: application.notes,
          followUpDate: application.followUpDate?.toISOString().slice(0, 10) ?? ""
        }}
      />

      <ApplicationDocumentsManager
        applicationId={application.id}
        documents={application.documents.map((document) => ({
          id: document.id,
          documentType: document.documentType,
          originalFilename: document.originalFilename,
          sizeBytes: document.sizeBytes,
          createdAt: document.createdAt.toISOString()
        }))}
      />
    </div>
  );
}
