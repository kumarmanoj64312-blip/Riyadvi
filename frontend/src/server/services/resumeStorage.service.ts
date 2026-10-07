import mongoose from "mongoose";
import { Readable } from "node:stream";

/**
 * Resume files live in MongoDB GridFS (bucket "resumes"):
 *  - serverless functions have no persistent disk, so files can't be stored locally
 *  - no extra cloud account or credentials needed
 *  - files are only reachable through the authenticated admin API — there is
 *    no public URL to guess
 * Swapping to S3/Cloudinary/Vercel Blob later only changes this file.
 */
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "resumes" });

export type ResumeFile = { originalname: string; mimetype: string; buffer: Buffer; size?: number };

/** Stores the uploaded buffer; returns the GridFS file id. */
export function saveResume(file: ResumeFile, metadata: Record<string, string>): Promise<mongoose.Types.ObjectId> {
  return new Promise((resolve, reject) => {
    // Never trust the client's filename for storage — keep it only as metadata.
    const safeName = file.originalname.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
    const upload = bucket().openUploadStream(safeName, { metadata: { ...metadata, contentType: file.mimetype } });
    Readable.from(file.buffer)
      .pipe(upload)
      .on("error", reject)
      .on("finish", () => resolve(upload.id));
  });
}

/** Readable stream for the admin download endpoint. */
export function openResume(fileId: unknown) {
  return bucket().openDownloadStream(new mongoose.Types.ObjectId(String(fileId)));
}

export async function deleteResume(fileId: unknown) {
  await bucket().delete(new mongoose.Types.ObjectId(String(fileId)));
}
