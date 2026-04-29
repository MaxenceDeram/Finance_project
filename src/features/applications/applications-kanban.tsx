"use client";

import type { ApplicationStatus } from "@prisma/client";
import { ExternalLink, Mail, Paperclip, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/errors";
import { ApplicationStatusBadge } from "./application-status-badge";
import { CompanyAvatar } from "./company-avatar";
import { applicationStatusOptions } from "./constants";
import { updateJobApplicationStatusAction } from "./actions";

export type KanbanApplication = {
  id: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  location?: string | null;
  listingUrl?: string | null;
  followUpDate?: string | null;
};

export function ApplicationsKanban({
  applications
}: {
  applications: KanbanApplication[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggedApplicationId, setDraggedApplicationId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const applicationsByStatus = useMemo(() => {
    const grouped = new Map<ApplicationStatus, KanbanApplication[]>();

    for (const option of applicationStatusOptions) {
      grouped.set(option.value, []);
    }

    for (const application of applications) {
      grouped.get(application.status)?.push(application);
    }

    return grouped;
  }, [applications]);

  function moveApplication(applicationId: string, status: ApplicationStatus) {
    const application = applications.find((item) => item.id === applicationId);

    if (!application || application.status === status) {
      return;
    }

    const formData = new FormData();
    formData.set("applicationId", applicationId);
    formData.set("status", status);
    setMessage(null);

    startTransition(async () => {
      const result = await updateJobApplicationStatusAction(initialActionState, formData);

      if (!result.ok) {
        setMessage(result.message ?? "Impossible de changer le statut.");
        return;
      }

      setMessage("Statut mis a jour.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p
          className="rounded-2xl border border-border bg-[#fbfcff] px-4 py-3 text-sm text-muted-foreground"
          data-motion-row
        >
          {message}
        </p>
      ) : null}
      <div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-3 2xl:grid-cols-4">
        {applicationStatusOptions.map((option) => {
          const items = applicationsByStatus.get(option.value) ?? [];

          return (
            <section
              key={option.value}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const applicationId =
                  event.dataTransfer.getData("text/plain") || draggedApplicationId;

                if (applicationId) {
                  moveApplication(applicationId, option.value);
                }
              }}
              className="min-h-[220px] min-w-[280px] rounded-[24px] border border-border/80 bg-[#f7f9fd] p-3"
              data-motion-card
            >
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <ApplicationStatusBadge status={option.value} />
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.length > 0 ? (
                  items.map((application) => (
                    <article
                      key={application.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggedApplicationId(application.id);
                        event.dataTransfer.setData("text/plain", application.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggedApplicationId(null)}
                      className="surface-hover-lift rounded-[20px] border border-border/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      data-motion-row
                    >
                      <div className="flex items-start gap-3">
                        <CompanyAvatar
                          companyName={application.companyName}
                          listingUrl={application.listingUrl}
                          className="size-10 rounded-xl text-xs"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {application.companyName}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {application.roleTitle}
                          </p>
                          {application.location ? (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {application.location}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <Button asChild variant="outline" size="icon">
                          <Link
                            href={`/applications/${application.id}/edit`}
                            aria-label={`Modifier ${application.companyName}`}
                          >
                            <PencilLine aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="icon">
                          <Link
                            href={`/applications/${application.id}/edit#documents`}
                            aria-label={`Documents ${application.companyName}`}
                          >
                            <Paperclip aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="icon">
                          <Link
                            href={`/applications/${application.id}/edit#follow-up`}
                            aria-label={`Relancer ${application.companyName}`}
                          >
                            <Mail aria-hidden="true" />
                          </Link>
                        </Button>
                        {application.listingUrl ? (
                          <Button asChild variant="outline" size="icon">
                            <a
                              href={application.listingUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Ouvrir l'offre ${application.companyName}`}
                            >
                              <ExternalLink aria-hidden="true" />
                            </a>
                          </Button>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-[18px] border border-dashed border-border bg-white/65 px-4 py-8 text-sm text-muted-foreground">
                    Glissez une candidature ici.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Mise a jour du pipeline...</p>
      ) : null}
    </div>
  );
}
