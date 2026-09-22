import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const requestCandidateSchema = new Schema(
  {
    requestId: { type: Types.ObjectId, ref: "NannyRequest", required: true },
    nannyId: { type: Types.ObjectId, ref: "User", required: true },
    contactStatus: {
      type: String,
      enum: ["CONTACTED", "INTERESTED", "NOT_INTERESTED"],
      default: "CONTACTED",
    },
    availabilityConfirmed: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
  },
  { timestamps: true },
);

requestCandidateSchema.index({ requestId: 1, nannyId: 1 }, { unique: true });

export type RequestCandidateDocument = InferSchemaType<typeof requestCandidateSchema>;

export const RequestCandidate =
  models.RequestCandidate || model("RequestCandidate", requestCandidateSchema);
