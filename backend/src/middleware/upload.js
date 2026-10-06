import multer from "multer";
import { ApiError } from "../utils/http.js";

export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED = {
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

/**
 * Resume upload: kept in memory (never written to the server's disk — on
 * Render that disk is wiped on every deploy), max 1 file, max 5 MB,
 * PDF/DOC/DOCX only. The service then streams it into MongoDB GridFS.
 */
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: RESUME_MAX_BYTES, files: 1, fields: 20 },
  fileFilter: (_req, file, cb) => {
    const ext = ALLOWED[file.mimetype];
    const nameOk = ext && file.originalname.toLowerCase().endsWith(`.${ext}`);
    if (!nameOk) return cb(ApiError.badRequest("Please upload a PDF, DOC or DOCX file.", [{ field: "resume", message: "Please upload a PDF, DOC or DOCX file." }]));
    cb(null, true);
  },
});

/** multer + content sniffing, with multer errors mapped to our response shape. */
export function resumeUpload(req, res, next) {
  uploader.single("resume")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Resume must be 5 MB or smaller." : "Invalid upload.";
      return next(ApiError.badRequest(message, [{ field: "resume", message }]));
    }
    if (err) return next(err);

    if (!req.file) {
      return next(ApiError.badRequest("Please attach your resume.", [{ field: "resume", message: "Please attach your resume." }]));
    }
    const expected = MAGIC[ALLOWED[req.file.mimetype]];
    const matches = expected.every((byte, i) => req.file.buffer[i] === byte);
    if (!matches) {
      return next(ApiError.badRequest("That file doesn't look like a valid PDF or Word document.", [{ field: "resume", message: "File content doesn't match its type." }]));
    }
    next();
  });
}
