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
      enum: ["DRAFT", "ACTIVE", "ENDED", "TERMINATED", "REPLACED"],
      // A placement is created the moment an admin builds a contract, before
      // either party has signed anything — defaulting to ACTIVE here would
      // let billing/overdue logic treat an unsigned contract as a live
      // obligation. checkAndActivatePlacement() flips this to ACTIVE once
      // both contracts are actually SIGNED.
      default: "DRAFT",
    },
  },
  { timestamps: true },
);

export type PlacementDocument = InferSchemaType<typeof placementSchema>;

export const Placement = models.Placement || model("Placement", placementSchema);
