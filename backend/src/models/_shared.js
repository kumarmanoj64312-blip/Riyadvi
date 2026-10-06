/**
 * Options shared by all schemas:
 *  - createdAt / updatedAt maintained automatically
 *  - JSON output exposes `id` instead of `_id` and hides `__v`
 */
export const baseOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  },
};

/** Lead pipeline status used by every lead type (editable in the admin). */
export const LEAD_STATUSES = ["new", "contacted", "closed"];
