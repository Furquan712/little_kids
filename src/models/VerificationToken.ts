import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const verificationTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["EMAIL_VERIFY", "PHONE_OTP", "PASSWORD_RESET"],
      required: true,
    },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ userId: 1, type: 1 });

export type VerificationTokenDocument = InferSchemaType<typeof verificationTokenSchema>;

export const VerificationToken =
  models.VerificationToken || model("VerificationToken", verificationTokenSchema);
