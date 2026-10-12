import { Schema } from "mongoose";
import { baseOptions, defineModel } from "./_shared";

/**
 * Newsletter workflow (editable in the admin):
 *  new          → signed up on the site, not yet exported to the mailing tool
 *  added        → added to the mailing list
 *  unsubscribed → asked to stop
 */
export const NEWSLETTER_STATUSES = ["new", "added", "unsubscribed"];

/** One row per email address: the unique index makes duplicates impossible, even under races. */
const newsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, unique: true },
    status: { type: String, enum: NEWSLETTER_STATUSES, default: "new", index: true },
    sourcePage: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  baseOptions,
);

newsletterSubscriberSchema.index({ createdAt: -1 });

export const NewsletterSubscriber = defineModel("NewsletterSubscriber", newsletterSubscriberSchema);
