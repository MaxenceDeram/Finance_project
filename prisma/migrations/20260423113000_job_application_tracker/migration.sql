CREATE TYPE "ContractType" AS ENUM (
  'INTERNSHIP',
  'APPRENTICESHIP',
  'FULL_TIME',
  'PART_TIME',
  'FREELANCE',
  'TEMPORARY',
  'OTHER'
);

CREATE TYPE "ApplicationStatus" AS ENUM (
  'TO_APPLY',
  'APPLIED',
  'FOLLOW_UP_SENT',
  'HR_INTERVIEW',
  'TECHNICAL_INTERVIEW',
  'CASE_STUDY',
  'OFFER_RECEIVED',
  'REJECTED',
  'ACCEPTED'
);

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPLICATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPLICATION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPLICATION_DELETED';

CREATE TABLE "JobApplication" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "contractType" "ContractType" NOT NULL,
  "location" TEXT,
  "applicationDate" TIMESTAMP(3),
  "status" "ApplicationStatus" NOT NULL DEFAULT 'TO_APPLY',
  "listingUrl" TEXT,
  "hrContact" TEXT,
  "compensation" TEXT,
  "notes" TEXT,
  "followUpDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobApplication_userId_status_applicationDate_idx"
  ON "JobApplication"("userId", "status", "applicationDate");
CREATE INDEX "JobApplication_userId_followUpDate_idx"
  ON "JobApplication"("userId", "followUpDate");
CREATE INDEX "JobApplication_companyName_idx"
  ON "JobApplication"("companyName");

ALTER TABLE "JobApplication"
  ADD CONSTRAINT "JobApplication_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
