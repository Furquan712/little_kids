import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const contractSchema = new Schema(
  {
    placementId: { type: Types.ObjectId, ref: "Placement", required: true },
    party: { type: String, enum: ["FAMILY", "NANNY"], required: true },
    version: { type: Number, default: 1 },
    terms: { type: Schema.Types.Mixed },
    nannySalary: { type: Number },
    familyTotal: { type: Number },
    commissionType: { type: String, enum: ["PERCENTAGE", "FIXED"] },
    commissionValue: { type: Number },
    commissionAmount: { type: Number },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "SIGNED", "ACTIVE", "ENDED", "TERMINATED"],
      default: "DRAFT",
    },
    pdfKey: { type: String },
    signedPdfKey: { type: String },
    docHash: { type: String },
  },
  { timestamps: true },
);

export type ContractDocument = InferSchemaType<typeof contractSchema>;

export const Contract = models.Contract || model("Contract", contractSchema);
