DO $$
BEGIN
  ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPLICATION_DOCUMENT_UPLOADED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPLICATION_DOCUMENT_DELETED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TYPE "ApplicationDocumentType" AS ENUM (
  'RESUME',
  'COVER_LETTER',
  'OTHER'
);

CREATE TABLE "ApplicationDocument" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentType" "ApplicationDocumentType" NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApplicationDocument_storageKey_key" ON "ApplicationDocument"("storageKey");
CREATE INDEX "ApplicationDocument_applicationId_documentType_createdAt_idx" ON "ApplicationDocument"("applicationId", "documentType", "createdAt");
CREATE INDEX "ApplicationDocument_userId_createdAt_idx" ON "ApplicationDocument"("userId", "createdAt");

ALTER TABLE "ApplicationDocument"
  ADD CONSTRAINT "ApplicationDocument_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApplicationDocument"
  ADD CONSTRAINT "ApplicationDocument_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
