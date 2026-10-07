import { Schema } from "mongoose";
import { baseOptions, defineModel } from "./_shared";

/**
 * Dashboard user. Created/updated by the seeder from ADMIN_EMAIL +
 * ADMIN_PASSWORD (only the bcrypt hash is stored). The hash is excluded from
 * queries by default (`select: false`) and stripped from JSON output.
 */
const adminSchema = new Schema(
  {
    name: { type: String, trim: true, default: "Administrator" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
    lastLoginAt: { type: Date },
  },
  {
    ...baseOptions,
    toJSON: {
      ...baseOptions.toJSON,
      transform: (doc: unknown, ret: Record<string, unknown>) => {
        baseOptions.toJSON.transform(doc, ret);
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const Admin = defineModel("Admin", adminSchema);
