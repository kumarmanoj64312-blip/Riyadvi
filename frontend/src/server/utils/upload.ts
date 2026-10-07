import type { NextRequest } from "next/server";
import { ApiError } from "./errors";

export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, "pdf" | "doc" | "docx"> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/**
 * The first bytes of a file reveal its real type ("magic numbers"). The
 * browser-supplied MIME type and extension are trivially faked, so we check
 * the content too:
 *   PDF  → "%PDF"            25 50 44 46
 *   DOC  → OLE2 container    D0 CF 11 E0
 *   DOCX → ZIP container     50 4B 03 04
 */
const MAGIC = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  doc: [0xd0, 0xcf, 0x11, 0xe0],
  docx: [0x50, 0x4b, 0x03, 0x04],
};

const bad = (message: string, fieldMessage = message) => ApiError.badRequest(message, [{ field: "resume", message: fieldMessage }]);

/**
 * Parses a multipart job application (replaces multer). The Web `Request`
 * API reads multipart natively via `formData()`; the file stays in memory —
 * never written to disk — and is then streamed into GridFS by the service.
 *
 * Returns the text fields (validated later with Zod) and the checked file:
 * max 5 MB, PDF/DOC/DOCX by MIME + extension + magic bytes.
 */
export async function parseResumeUpload(req: NextRequest) {
  // Reject obviously oversized bodies before buffering them (5 MB file + small text fields).
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > RESUME_MAX_BYTES + 64 * 1024) throw bad("Resume must be 5 MB or smaller.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw ApiError.badRequest("Invalid upload.");
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") fields[key] = value;

  const file = form.get("resume");
  if (!(file instanceof File) || file.size === 0) throw bad("Please attach your resume.");
  if (file.size > RESUME_MAX_BYTES) throw bad("Resume must be 5 MB or smaller.");

  const ext = ALLOWED[file.type];
  if (!ext || !file.name.toLowerCase().endsWith(`.${ext}`)) throw bad("Please upload a PDF, DOC or DOCX file.");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!MAGIC[ext].every((byte, i) => buffer[i] === byte)) {
    throw bad("That file doesn't look like a valid PDF or Word document.", "File content doesn't match its type.");
  }

  return { fields, file: { originalname: file.name, mimetype: file.type, size: file.size, buffer } };
}
