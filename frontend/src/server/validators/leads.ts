import { z } from "zod";
import { fields } from "./common";
import { answersSchema } from "../services/healthCheckup.service";
import { CONSULTATION_SLOTS } from "@/schemas/leads";

/** POST /api/contact */
export const contactSchema = z.object({
  name: fields.name,
  email: fields.email,
  phone: fields.phone,
  company: fields.company,
  requirement: fields.requirement,
  message: fields.message,
  sourcePage: fields.sourcePage,
});

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** POST /api/consultation */
export const consultationSchema = z.object({
  name: fields.name,
  email: fields.email,
  phone: fields.phone,
  preferredDate: z.coerce
    .date({ error: "Please pick a date." })
    .refine((d) => d >= startOfToday(), "Please pick a date from today onwards.")
    .refine((d) => d.getTime() - Date.now() < 90 * 24 * 3600 * 1000, "Please pick a date within the next 90 days."),
  preferredTime: z.enum(CONSULTATION_SLOTS, { error: "Please choose a time slot." }),
  requirement: fields.requirement,
  notes: z.string().trim().max(1000, "Notes are too long.").optional().default(""),
  sourcePage: fields.sourcePage,
});

/** POST /api/health-checkup — answers are validated against the questionnaire config. */
export const healthCheckupSchema = z.object({
  answers: answersSchema,
  contact: z.object({
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    company: fields.company,
  }),
  consent: z.literal(true, { error: "Please agree so we can send your results." }),
  sourcePage: fields.sourcePage,
});

/** POST /api/lead-magnet */
export const leadMagnetSchema = z.object({
  name: fields.name,
  company: z.string().trim().min(2, "Please enter your company name.").max(120),
  email: fields.email,
  phone: fields.phone,
  sourcePage: fields.sourcePage,
});

/** POST /api/applications (multipart: these text fields + a `resume` file). */
export const applicationSchema = z.object({
  jobSlug: z.string().trim().min(1, "Please choose a position.").max(80),
  name: fields.name,
  email: fields.email,
  phone: fields.phone,
  message: z.string().trim().max(2000, "Message is too long.").optional().default(""),
});

export type ContactInput = z.output<typeof contactSchema>;
export type ConsultationInput = z.output<typeof consultationSchema>;
export type HealthCheckupInput = z.output<typeof healthCheckupSchema>;
export type LeadMagnetInput = z.output<typeof leadMagnetSchema>;
export type ApplicationInput = z.output<typeof applicationSchema>;
