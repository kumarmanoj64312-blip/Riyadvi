import mongoose, { type Schema } from "mongoose";

/**
 * Options shared by all schemas:
 *  - createdAt / updatedAt maintained automatically
 *  - JSON output exposes `id` instead of `_id` and hides `__v`
 */
export const baseOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false as const,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  },
};

/** Lead pipeline status used by every lead type (editable in the admin). */
export const LEAD_STATUSES = ["new", "contacted", "closed"];

/**
 * Registers a model once. `next dev` re-evaluates modules on every edit, and
 * mongoose throws "Cannot overwrite model once compiled" on a second
 * `mongoose.model(name, schema)` — so the stale one is removed first, which
 * also means schema edits take effect without a server restart.
 */
export function defineModel<S extends Schema>(name: string, schema: S) {
  if (mongoose.models[name]) mongoose.deleteModel(name);
  return mongoose.model(name, schema);
}
