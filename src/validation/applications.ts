import { ApplicationStatus, ContractType } from "@prisma/client";
import { z } from "zod";
import { idSchema } from "./common";

const optionalTrimmedString = z
  .string()
  .trim()
  .max(200)
  .optional()
  .or(z.literal(""));

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

const optionalDate = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

export const applicationInputSchema = z.object({
  companyName: z.string().trim().min(1, "Entreprise requise.").max(120),
  roleTitle: z.string().trim().min(1, "Poste requis.").max(160),
  contractType: z.nativeEnum(ContractType),
  location: optionalTrimmedString,
  applicationDate: optionalDate,
  status: z.nativeEnum(ApplicationStatus),
  listingUrl: optionalUrl,
  hrContact: optionalTrimmedString,
  compensation: optionalTrimmedString,
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  followUpDate: optionalDate
});

export const createApplicationSchema = applicationInputSchema;

export const updateApplicationSchema = applicationInputSchema.extend({
  applicationId: idSchema
});

export const deleteApplicationSchema = z.object({
  applicationId: idSchema
});
