"use client";

import { FileText, FileUp, Paperclip, Trash2 } from "lucide-react";
import type { ApplicationDocumentType } from "@prisma/client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { initialActionState } from "@/lib/errors";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  uploadApplicationDocumentAction,
  deleteApplicationDocumentAction
} from "./document-actions";
import { getApplicationDocumentTypeLabel } from "./constants";

type DocumentItem = {
  id: string;
  documentType: ApplicationDocumentType;
  originalFilename: string;
  sizeBytes: number;
  createdAt: string;
};

export function ApplicationDocumentsManager({
  applicationId,
  documents
}: {
  applicationId: string;
  documents: DocumentItem[];
}) {
  const resume = documents.find((document) => document.documentType === "RESUME") ?? null;
  const coverLetter =
    documents.find((document) => document.documentType === "COVER_LETTER") ?? null;
  const others = useMemo(
    () => documents.filter((document) => document.documentType === "OTHER"),
    [documents]
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents associes a cette offre</CardTitle>
          <CardDescription>
            Ajoutez le CV et la lettre de motivation que vous avez vraiment envoyes pour
            cette candidature.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <DocumentUploadCard
            applicationId={applicationId}
            documentType="RESUME"
            title="CV pour cette offre"
            description="PDF, DOC ou DOCX. Un nouvel upload remplace l'ancien CV."
            document={resume}
          />
          <DocumentUploadCard
            applicationId={applicationId}
            documentType="COVER_LETTER"
            title="Lettre de motivation"
            description="PDF, DOC ou DOCX. Un nouvel upload remplace la lettre actuelle."
            document={coverLetter}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pieces jointes complementaires</CardTitle>
          <CardDescription>
            Ajoutez d'autres documents utiles: prise de notes, brief, test maison ou
            versions supplementaires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <DocumentUploadCard
            applicationId={applicationId}
            documentType="OTHER"
            title="Ajouter un document"
            description="Vous pouvez empiler plusieurs documents complementaires."
          />

          {others.length > 0 ? (
            <div className="grid gap-3">
              {others.map((document) => (
                <DocumentRow
                  key={document.id}
                  applicationId={applicationId}
                  document={document}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun document complementaire pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentUploadCard({
  applicationId,
  documentType,
  title,
  description,
  document
}: {
  applicationId: string;
  documentType: ApplicationDocumentType;
  title: string;
  description: string;
  document?: DocumentItem | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(
    uploadApplicationDocumentAction,
    initialActionState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <div className="rounded-[24px] border border-border/80 bg-[#fbfcff] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-2 text-muted-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <FileText className="size-4" aria-hidden="true" />
        </div>
      </div>

      {document ? (
        <DocumentRow applicationId={applicationId} document={document} compact />
      ) : null}

      <form ref={formRef} action={action} className="mt-4 grid gap-3">
        <input type="hidden" name="applicationId" value={applicationId} />
        <input type="hidden" name="documentType" value={documentType} />
        <div className="grid gap-2">
          <Label htmlFor={`${documentType}-file`}>
            {document ? "Remplacer le document" : "Choisir un fichier"}
          </Label>
          <input
            id={`${documentType}-file`}
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="block h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef2ff] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#312e81]"
          />
        </div>
        {state.message ? <Alert>{state.message}</Alert> : null}
        <Button type="submit">
          <FileUp aria-hidden="true" />
          {document ? "Remplacer" : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}

function DocumentRow({
  applicationId,
  document,
  compact = false
}: {
  applicationId: string;
  document: DocumentItem;
  compact?: boolean;
}) {
  const createdAtLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium"
  }).format(new Date(document.createdAt));

  return (
    <div
      className={`mt-4 flex items-center justify-between gap-4 rounded-[20px] border border-border/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        compact ? "" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Paperclip className="size-4 text-[color:var(--positive)]" aria-hidden="true" />
          <p className="truncate text-sm font-semibold">{document.originalFilename}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {getApplicationDocumentTypeLabel(document.documentType)} •{" "}
          {formatBytes(document.sizeBytes)} • {createdAtLabel}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/api/applications/documents/${document.id}`} target="_blank">
            Ouvrir
          </Link>
        </Button>
        <DeleteDocumentButton applicationId={applicationId} documentId={document.id} />
      </div>
    </div>
  );
}

function DeleteDocumentButton({
  applicationId,
  documentId
}: {
  applicationId: string;
  documentId: string;
}) {
  const router = useRouter();
  const [state, action] = useActionState(
    deleteApplicationDocumentAction,
    initialActionState
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form
      action={action}
      className="flex items-center gap-2"
      onSubmit={(event) => {
        if (!window.confirm("Supprimer ce document ?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="documentId" value={documentId} />
      <SubmitButton type="submit" variant="ghost" size="sm">
        <Trash2 aria-hidden="true" />
        Supprimer
      </SubmitButton>
      {state.message && !state.ok ? (
        <span className="text-xs text-[color:var(--negative)]">{state.message}</span>
      ) : null}
    </form>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} o`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
