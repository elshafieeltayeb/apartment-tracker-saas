import { z } from "zod";

const applicationStatusEnum = z.enum([
  "interested",
  "applied",
  "viewing",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
]);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
  name: z.string().max(120).optional(),
});

export const applicationCreateSchema = z.object({
  listingUrl: z.string().url(),
  title: z.string().min(1).max(500),
  sourcePlatform: z.string().min(1).max(64).optional(),
  coldRent: z.number().optional().nullable(),
  utilities: z.number().optional().nullable(),
  rooms: z.number().optional().nullable(),
  locationLabel: z.string().max(500).optional().nullable(),
  appliedAt: z.string().datetime().optional().nullable(),
  channel: z.string().max(120).optional().nullable(),
  status: applicationStatusEnum.optional(),
  notes: z.string().max(10000).optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
});

export const applicationPatchSchema = applicationCreateSchema.partial();

export const templateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(64),
  body: z.string().min(1).max(20000),
});

export const settingsPatchSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  locale: z.enum(["de", "en"]).optional(),
  timezone: z.string().max(80).optional(),
});
