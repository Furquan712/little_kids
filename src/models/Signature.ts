import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const signatureSchema = new Schema(
  {
    contractId: { type: Types.ObjectId, ref: "Contract", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    typedName: { type: String },
    imageKey: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    signedAt: { type: Date },
    method: { type: String, enum: ["ONLINE", "IN_PERSON"] },
  },
  { timestamps: true },
);

export type SignatureDocument = InferSchemaType<typeof signatureSchema>;

export const Signature = models.Signature || model("Signature", signatureSchema);
