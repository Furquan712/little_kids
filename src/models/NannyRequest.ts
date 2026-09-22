import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const scheduleSlotSchema = new Schema(
  {
    day: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      required: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false },
);

const nannyRequestSchema = new Schema(
  {
    familyId: { type: Types.ObjectId, ref: "User", required: true },
    targetNannyId: { type: Types.ObjectId, ref: "User" },
    childrenAges: { type: [Number], default: [] },
    needs: { type: String, default: "" },
    schedule: { type: [scheduleSlotSchema], default: [] },
    liveIn: { type: String, enum: ["LIVE_IN", "LIVE_OUT"] },
    startDate: { type: Date },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    specialRequirements: { type: String, default: "" },
    status: {
      type: String,
      enum: ["NEW", "MATCHING", "INTERVIEWING", "PROPOSED", "APPROVED", "CONTRACTED", "CLOSED"],
      default: "NEW",
    },
  },
  { timestamps: true },
);

nannyRequestSchema.index({ familyId: 1 });
nannyRequestSchema.index({ status: 1 });

export type NannyRequestDocument = InferSchemaType<typeof nannyRequestSchema>;

export const NannyRequest = models.NannyRequest || model("NannyRequest", nannyRequestSchema);
