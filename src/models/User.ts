import { Schema, model, models, type InferSchemaType } from "mongoose";
import { PROVINCE_NAMES } from "@/lib/angola-locations";

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["NANNY", "FAMILY", "ADMIN"],
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    whatsapp: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    province: { type: String, required: true, enum: PROVINCE_NAMES },
    city: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    emailVerifiedAt: { type: Date },
    phoneVerifiedAt: { type: Date },
    consentAt: { type: Date, required: true },
  },
  { timestamps: true },
);

userSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error("At least one of email or phone is required");
  }
});

userSchema.index({ role: 1, status: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = models.User || model("User", userSchema);
