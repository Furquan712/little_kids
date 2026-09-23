import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const interviewSchema = new Schema(
  {
    candidateId: { type: Types.ObjectId, ref: "RequestCandidate", required: true },
    scheduledAt: { type: Date },
    mode: { type: String, enum: ["IN_PERSON", "PHONE", "VIDEO"] },
    status: {
      type: String,
      enum: ["SCHEDULED", "DONE", "NO_SHOW", "CANCELLED"],
      default: "SCHEDULED",
    },
    outcome: { type: String },
    notes: { type: String },
    score: { type: Number },
  },
  { timestamps: true },
);

export type InterviewDocument = InferSchemaType<typeof interviewSchema>;

export const Interview = models.Interview || model("Interview", interviewSchema);
