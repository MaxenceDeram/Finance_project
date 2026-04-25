import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WarenLogo } from "@/components/brand/waren-logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/features/applications/company-avatar";
import { ApplicationDocumentsManager } from "@/features/applications/application-documents-manager";
import { ApplicationForm } from "@/features/applications/application-form";
import { ApplicationStatusBadge } from "@/features/applications/application-status-badge";
import { getBrandToneForApplicationStatus } from "@/features/applications/status-brand";
import { getJobApplicationForUser } from "@/features/applications/service";
import { ApplicationFollowUpComposer } from "@/features/emails/application-follow-up-composer";
import { getFollowUpTokens, listEmailTemplatesForUser } from "@/features/emails/service";
import { getPreferredUserName } from "@/features/users/service";
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

  const templates = await listEmailTemplatesForUser(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="relative">
            <CompanyAvatar
              companyName={application.companyName}
              listingUrl={application.listingUrl}
              className="size-16 rounded-[22px] border-white bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            />
            <div className="absolute -bottom-2 -right-2 rounded-2xl border border-border bg-white px-2.5 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
              <WarenLogo
                tone={getBrandToneForApplicationStatus(application.status)}
                withWordmark={false}
                markClassName="h-5 w-5"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Edition
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
              {application.companyName}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ApplicationStatusBadge status={application.status} />
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Mettez a jour le statut, la relance prevue ou les notes de preparation.
              </p>
            </div>
          </div>
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
          contactEmail: application.contactEmail,
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

      <ApplicationFollowUpComposer
        applicationId={application.id}
        defaultToEmail={application.contactEmail}
        templates={templates.map((template) => ({
          id: template.id,
          name: template.name,
          subjectTemplate: template.subjectTemplate,
          bodyTemplate: template.bodyTemplate,
          isDefault: template.isDefault
        }))}
        templateTokens={getFollowUpTokens()}
        templateContext={{
          companyName: application.companyName,
          roleTitle: application.roleTitle,
          contactName: application.hrContact,
          contactEmail: application.contactEmail,
          applicationDate: application.applicationDate?.toISOString() ?? null,
          userName: getPreferredUserName(user.displayName, user.email),
          userEmail: user.email
        }}
        history={application.emailLogs.map((log) => ({
          id: log.id,
          status: log.status,
          provider: log.provider,
          toEmail: log.toEmail,
          subject: log.subject,
          templateName: log.template?.name ?? null,
          sentAt: log.sentAt?.toISOString() ?? null,
          createdAt: log.createdAt.toISOString(),
          errorMessage: log.errorMessage ?? null
        }))}
      />
    </div>
  );
}
