import path from "node:path";
import {
  ApplicationDocumentType,
  AuditAction
} from "@prisma/client";
import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/prisma";
import { writeAuditLog } from "@/server/security/audit";
import {
  deleteApplicationDocumentFile,
  readApplicationDocumentFile,
  storeApplicationDocumentFile
} from "@/server/storage/application-documents";
import {
  deleteApplicationDocumentSchema,
  uploadApplicationDocumentSchema
} from "@/validation/application-documents";

const MAX_DOCUMENT_SIZE_BYTES = 8 * 1024 * 1024;
const allowedDocumentTypes = new Map([
  [".pdf", "application/pdf"],
  [".doc", "application/msword"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
]);

export async function uploadApplicationDocument(input: {
  userId: string;
  values: unknown;
  file: File;
  ipHash?: string | null;
}) {
  const parsed = uploadApplicationDocumentSchema.parse(input.values);
  const application = await getOwnedApplication(parsed.applicationId, input.userId);
  const fileData = await validateAndExtractFile(input.file);

  const stored = await storeApplicationDocumentFile({
    userId: input.userId,
    applicationId: application.id,
    extension: fileData.extension,
    bytes: fileData.bytes
  });

  let replacedStorageKey: string | null = null;

  try {
    const document = await prisma.$transaction(async (tx) => {
      if (
        parsed.documentType === ApplicationDocumentType.RESUME ||
        parsed.documentType === ApplicationDocumentType.COVER_LETTER
      ) {
        const replacedDocument = await tx.applicationDocument.findFirst({
          where: {
            applicationId: application.id,
            userId: input.userId,
            documentType: parsed.documentType
          }
        });

        if (replacedDocument) {
          replacedStorageKey = replacedDocument.storageKey;
          await tx.applicationDocument.delete({
            where: { id: replacedDocument.id }
          });
        }
      }

      return tx.applicationDocument.create({
        data: {
          applicationId: application.id,
          userId: input.userId,
          documentType: parsed.documentType,
          originalFilename: fileData.originalFilename,
          storageKey: stored.storageKey,
          mimeType: fileData.mimeType,
          sizeBytes: fileData.sizeBytes
        }
      });
      });

    if (replacedStorageKey) {
      await deleteApplicationDocumentFile(replacedStorageKey).catch((error) => {
        console.error("application_document_replace_cleanup_failed", error);
      });
    }

    await writeAuditLog({
      userId: input.userId,
      action: AuditAction.APPLICATION_DOCUMENT_UPLOADED,
      metadata: {
        applicationId: application.id,
        documentId: document.id,
        documentType: document.documentType
      },
      ipHash: input.ipHash
    });

    return document;
  } catch (error) {
    await deleteApplicationDocumentFile(stored.storageKey).catch(() => {});
    throw error;
  }
}

export async function deleteApplicationDocument(input: {
  userId: string;
  values: unknown;
  ipHash?: string | null;
}) {
  const parsed = deleteApplicationDocumentSchema.parse(input.values);
  const document = await prisma.applicationDocument.findFirst({
    where: {
      id: parsed.documentId,
      userId: input.userId
    }
  });

  if (!document) {
    throw new AppError("NOT_FOUND", "Document introuvable.", 404);
  }

  await prisma.applicationDocument.delete({
    where: { id: document.id }
  });

  await deleteApplicationDocumentFile(document.storageKey).catch((error) => {
    console.error("application_document_delete_cleanup_failed", error);
  });

  await writeAuditLog({
    userId: input.userId,
    action: AuditAction.APPLICATION_DOCUMENT_DELETED,
    metadata: {
      applicationId: document.applicationId,
      documentId: document.id,
      documentType: document.documentType
    },
    ipHash: input.ipHash
  });
}

export async function getApplicationDocumentForUser(documentId: string, userId: string) {
  const document = await prisma.applicationDocument.findFirst({
    where: {
      id: documentId,
      userId
    }
  });

  if (!document) {
    throw new AppError("NOT_FOUND", "Document introuvable.", 404);
  }

  return document;
}

export async function readApplicationDocumentForUser(documentId: string, userId: string) {
  const document = await getApplicationDocumentForUser(documentId, userId);
  const content = await readApplicationDocumentFile(document.storageKey).catch(() => null);

  if (!content) {
    throw new AppError("NOT_FOUND", "Fichier introuvable.", 404);
  }

  return { document, content };
}

async function getOwnedApplication(applicationId: string, userId: string) {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });

  if (!application) {
    throw new AppError("NOT_FOUND", "Candidature introuvable.", 404);
  }

  return application;
}

async function validateAndExtractFile(file: File) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    throw new AppError("BAD_REQUEST", "Aucun fichier valide n'a ete envoye.", 400);
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new AppError("BAD_REQUEST", "Le fichier depasse 8 Mo.", 400);
  }

  const extension = path.extname(file.name).toLowerCase();
  const fallbackMimeType = allowedDocumentTypes.get(extension);

  if (!fallbackMimeType) {
    throw new AppError("BAD_REQUEST", "Formats autorises: PDF, DOC, DOCX.", 400);
  }

  if (file.type && file.type !== fallbackMimeType) {
    const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const docMime = "application/msword";
    const typeIsCompatible =
      (file.type === "application/octet-stream" && fallbackMimeType === docxMime) ||
      (file.type === docMime && fallbackMimeType === docxMime);

    if (!typeIsCompatible) {
      throw new AppError("BAD_REQUEST", "Type de fichier invalide.", 400);
    }
  }

  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    extension,
    mimeType: file.type || fallbackMimeType,
    originalFilename: sanitizeFilename(file.name),
    sizeBytes: file.size
  };
}

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .slice(0, 180) || "document";
}
