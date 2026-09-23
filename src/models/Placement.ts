import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const placementSchema = new Schema(
  {
    requestId: { type: Types.ObjectId, ref: "NannyRequest", required: true },
    familyId: { type: Types.ObjectId, ref: "User", required: true },
    nannyId: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "ENDED", "TERMINATED", "REPLACED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

export type PlacementDocument = InferSchemaType<typeof placementSchema>;

export const Placement = models.Placement || model("Placement", placementSchema);
