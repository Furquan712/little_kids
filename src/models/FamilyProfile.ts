import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const familyProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    needDescription: { type: String, default: "" },
  },
  { timestamps: true },
);

export type FamilyProfileDocument = InferSchemaType<typeof familyProfileSchema>;

export const FamilyProfile = models.FamilyProfile || model("FamilyProfile", familyProfileSchema);
