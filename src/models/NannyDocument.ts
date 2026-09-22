import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const nannyDocumentSchema = new Schema(
  {
    nannyUserId: { type: Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["PHOTO", "ID", "REFERENCE", "CERTIFICATE", "MEDICAL"],
      required: true,
    },
    s3Key: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    visibility: {
      type: String,
      enum: ["ADMIN_ONLY", "FAMILY_BADGE", "PUBLIC"],
      required: true,
    },
    reviewStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    reviewNote: { type: String },
  },
  { timestamps: true },
);

nannyDocumentSchema.index({ nannyUserId: 1, type: 1 });

export type NannyDocumentDocument = InferSchemaType<typeof nannyDocumentSchema>;

export const NannyDocument = models.NannyDocument || model("NannyDocument", nannyDocumentSchema);

export function visibilityForDocumentType(
  type: "PHOTO" | "ID" | "REFERENCE" | "CERTIFICATE" | "MEDICAL",
): "ADMIN_ONLY" | "FAMILY_BADGE" | "PUBLIC" {
  if (type === "ID" || type === "MEDICAL") return "ADMIN_ONLY";
  if (type === "REFERENCE" || type === "CERTIFICATE") return "FAMILY_BADGE";
  return "PUBLIC";
}
