import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const paymentSchema = new Schema(
  {
    placementId: { type: Types.ObjectId, ref: "Placement", required: true },
    direction: { type: String, enum: ["IN_FROM_FAMILY", "OUT_TO_NANNY"], required: true },
    periodMonth: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String },
    reference: { type: String },
    paidAt: { type: Date },
    recordedById: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;

export const Payment = models.Payment || model("Payment", paymentSchema);
