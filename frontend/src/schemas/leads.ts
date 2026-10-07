import { z } from "zod";

/*
 * Client-side form schemas. They MIRROR the server validators
 * (src/server/validators) so users get instant inline feedback; the server
 * re-validates everything anyway — the client is never trusted.
 */

const name = z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long.");
const email = z.string().trim().max(120).pipe(z.email("Please enter a valid email address."));
const phone = z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number.");
const requirement = z.string().trim().min(2, "Please choose what you need help with.");

/** Hidden anti-spam field: must stay empty (bots fill it). */
const website = z.string().max(0).optional();

export const contactSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().max(120).optional(),
  requirement,
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Message is too long (max 2000 characters)."),
  website,
});
export type ContactValues = z.infer<typeof contactSchema>;

export const CONSULTATION_SLOTS = ["09:00-11:00", "11:00-13:00", "14:00-16:00", "16:00-18:00"] as const;

export const consultationSchema = z.object({
  name,
  email,
  phone,
  preferredDate: z
    .string()
    .min(1, "Please pick a date.")
    .refine((v) => new Date(`${v}T23:59:59`) >= new Date(), "Please pick a date from today onwards."),
  preferredTime: z.enum(CONSULTATION_SLOTS, { error: "Please choose a time slot." }),
  requirement,
  notes: z.string().trim().max(1000, "Notes are too long.").optional(),
  website,
});
export type ConsultationValues = z.infer<typeof consultationSchema>;

export const leadMagnetSchema = z.object({
  name,
  company: z.string().trim().min(2, "Please enter your company name.").max(120),
  email,
  phone,
  website,
});
export type LeadMagnetValues = z.infer<typeof leadMagnetSchema>;

export const RESUME_MAX_MB = 5;
const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Job application (resume is a FileList from <input type="file">). */
export const applicationSchema = z.object({
  name,
  email,
  phone,
  message: z.string().trim().max(2000, "Message is too long.").optional(),
  resume: z
    .custom<FileList>((v) => typeof FileList !== "undefined" && v instanceof FileList && v.length === 1, "Please attach your resume.")
    .refine((files) => RESUME_TYPES.includes(files[0]?.type), "Please upload a PDF, DOC or DOCX file.")
    .refine((files) => files[0]?.size <= RESUME_MAX_MB * 1024 * 1024, `Resume must be ${RESUME_MAX_MB} MB or smaller.`),
  website,
});
export type ApplicationValues = z.infer<typeof applicationSchema>;
