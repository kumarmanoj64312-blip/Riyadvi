import { z } from "zod";

/**
 * Reusable field rules shared by every lead form. Each rule trims input and
 * caps its length, so nothing unbounded or padded ever reaches the database.
 * (React escapes output and emails are HTML-escaped, so text is stored as-is.)
 */
export const fields = {
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Email is too long.")
    .pipe(z.email("Please enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number."),
  company: z.string().trim().max(120, "Company name is too long.").optional().default(""),
  /** A service slug or a free choice like "other" — kept short. */
  requirement: z.string().trim().min(2, "Please choose what you need help with.").max(60),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Message is too long (max 2000 characters)."),
  /** Page the form was submitted from — useful for attribution in the admin. */
  sourcePage: z.string().trim().max(200).optional().default(""),
};
