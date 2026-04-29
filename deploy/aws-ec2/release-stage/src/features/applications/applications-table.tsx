import type { JobApplication } from "@prisma/client";
import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";
import { formatDateOnly } from "@/lib/dates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "./application-status-badge";
import { CompanyAvatar } from "./company-avatar";
import { DeleteApplicationButton } from "./delete-application-button";
import { getContractTypeLabel } from "./constants";

export function ApplicationsTable({ applications }: { applications: JobApplication[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Entreprise</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Lieu</TableHead>
          <TableHead>Candidature</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Relance</TableHead>
          <TableHead>Recruteur</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell className="py-5">
              <div className="flex items-center gap-3">
                <CompanyAvatar
                  companyName={application.companyName}
                  className="size-10 rounded-xl text-xs"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {application.companyName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getContractTypeLabel(application.contractType)}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="min-w-[180px]">
                <p className="font-medium text-foreground">{application.roleTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {application.compensation || "Remuneration non precisee"}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {application.location || "Flexible / non precise"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {application.applicationDate
                ? formatDateOnly(application.applicationDate)
                : "—"}
            </TableCell>
            <TableCell>
              <ApplicationStatusBadge status={application.status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {application.followUpDate ? formatDateOnly(application.followUpDate) : "—"}
            </TableCell>
            <TableCell>
              <div className="min-w-[150px]">
                <p className="truncate text-sm font-medium text-foreground">
                  {application.hrContact || "Aucun contact"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {application.listingUrl ? "Offre reliee" : "Lien indisponible"}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
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
                ) : null}
                <Button asChild variant="outline" size="icon">
                  <Link
                    href={`/applications/${application.id}/edit`}
                    aria-label={`Modifier ${application.companyName}`}
                  >
                    <PencilLine aria-hidden="true" />
                  </Link>
                </Button>
                <DeleteApplicationButton
                  applicationId={application.id}
                  companyName={application.companyName}
                  compact
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
