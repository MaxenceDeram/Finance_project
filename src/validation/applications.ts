import { z } from "zod";
import { emailSchema, idSchema } from "./common";

const contractTypeSchema = z.enum([
  "INTERNSHIP",
  "APPRENTICESHIP",
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
  "TEMPORARY",
  "OTHER"
]);

const applicationStatusSchema = z.enum([
  "TO_APPLY",
  "APPLIED",
  "FOLLOW_UP_SENT",
  "HR_INTERVIEW",
  "TECHNICAL_INTERVIEW",
  "CASE_STUDY",
  "OFFER_RECEIVED",
  "REJECTED",
  "ACCEPTED"
]);

const optionalTrimmedString = z.string().trim().max(200).optional().or(z.literal(""));

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}, z.string().url("Lien invalide.").max(500).optional());

const requiredUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}, z.string().url("Lien invalide.").max(500));

const optionalDate = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

const optionalEmail = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }

  return value;
}, emailSchema.optional());

export const applicationInputSchema = z.object({
  companyName: z.string().trim().min(1, "Entreprise requise.").max(120),
  roleTitle: z.string().trim().min(1, "Poste requis.").max(160),
  contractType: contractTypeSchema,
  location: optionalTrimmedString,
  applicationDate: optionalDate,
  status: applicationStatusSchema,
  listingUrl: optionalUrl,
  hrContact: optionalTrimmedString,
  contactEmail: optionalEmail,
  compensation: optionalTrimmedString,
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  followUpDate: optionalDate
});

export const createApplicationSchema = applicationInputSchema;

export const updateApplicationSchema = applicationInputSchema.extend({
  applicationId: idSchema
});

export const updateApplicationStatusSchema = z.object({
  applicationId: idSchema,
  status: applicationStatusSchema
});

export const deleteApplicationSchema = z.object({
  applicationId: idSchema
});

export const importJobOfferSchema = z.object({
  listingUrl: requiredUrl
});
