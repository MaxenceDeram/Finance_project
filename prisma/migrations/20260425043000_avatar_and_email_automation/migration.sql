-- Add avatar support, reusable email templates, and outbound email logs.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailProvider') THEN
    CREATE TYPE "EmailProvider" AS ENUM ('CONSOLE', 'SMTP', 'SES');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailLogStatus') THEN
    CREATE TYPE "EmailLogStatus" AS ENUM ('SENT', 'FAILED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailCategory') THEN
    CREATE TYPE "EmailCategory" AS ENUM ('EMAIL_CONFIRMATION', 'DAILY_SUMMARY', 'APPLICATION_FOLLOW_UP');
  END IF;
END $$;

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PROFILE_AVATAR_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PROFILE_AVATAR_REMOVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_EMAIL_SENT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_TEMPLATE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_TEMPLATE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_TEMPLATE_DELETED';

ALTER TABLE "User"
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "avatarStorageKey" TEXT,
  ADD COLUMN "avatarMimeType" TEXT,
  ADD COLUMN "avatarUpdatedAt" TIMESTAMP(3);

ALTER TABLE "JobApplication"
  ADD COLUMN "contactEmail" TEXT;

CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subjectTemplate" TEXT NOT NULL,
  "bodyTemplate" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT,
  "templateId" TEXT,
  "category" "EmailCategory" NOT NULL,
  "provider" "EmailProvider" NOT NULL,
  "status" "EmailLogStatus" NOT NULL,
  "toEmail" TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "htmlBody" TEXT NOT NULL,
  "textBody" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailTemplate_userId_createdAt_idx" ON "EmailTemplate"("userId", "createdAt");
CREATE INDEX "EmailLog_userId_createdAt_idx" ON "EmailLog"("userId", "createdAt");
CREATE INDEX "EmailLog_applicationId_createdAt_idx" ON "EmailLog"("applicationId", "createdAt");
CREATE INDEX "EmailLog_category_createdAt_idx" ON "EmailLog"("category", "createdAt");
CREATE INDEX "EmailLog_status_createdAt_idx" ON "EmailLog"("status", "createdAt");

ALTER TABLE "EmailTemplate"
  ADD CONSTRAINT "EmailTemplate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailLog"
  ADD CONSTRAINT "EmailLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailLog"
  ADD CONSTRAINT "EmailLog_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailLog"
  ADD CONSTRAINT "EmailLog_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
