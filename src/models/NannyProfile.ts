import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const availabilitySlotSchema = new Schema(
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

const correctionNoteSchema = new Schema(
  {
    field: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const nannyProfileSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    birthDate: { type: Date },
    languages: { type: [String], default: [] },
    yearsExperience: { type: Number, min: 0 },
    ageGroups: {
      type: [String],
      enum: ["INFANT", "TODDLER", "SCHOOL_AGE"],
      default: [],
    },
    skills: {
      type: [String],
      enum: ["FIRST_AID", "COOKING", "HOMEWORK_HELP", "SPECIAL_NEEDS", "OTHER"],
      default: [],
    },
    otherSkills: { type: String, default: "" },
    employmentType: { type: String, enum: ["FULL_TIME", "PART_TIME"] },
    liveIn: { type: String, enum: ["LIVE_IN", "LIVE_OUT"] },
    availability: { type: [availabilitySlotSchema], default: [] },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryUnit: { type: String, enum: ["MONTHLY", "HOURLY"] },
    bio: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_REVIEW",
        "APPROVED",
        "NEEDS_CORRECTION",
        "NOT_AVAILABLE",
        "IN_NEGOTIATION",
        "PLACED",
      ],
      default: "DRAFT",
    },
    verified: { type: Boolean, default: false },
    interviewed: { type: Boolean, default: false },
    correctionNotes: { type: [correctionNoteSchema], default: [] },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    province: { type: String },
    city: { type: String },
  },
  { timestamps: true },
);

nannyProfileSchema.index({ status: 1 });
nannyProfileSchema.index({ province: 1, city: 1 });
nannyProfileSchema.index({ ageGroups: 1 });
nannyProfileSchema.index({ employmentType: 1 });
nannyProfileSchema.index({ liveIn: 1 });

export type NannyProfileDocument = InferSchemaType<typeof nannyProfileSchema>;

export const NannyProfile = models.NannyProfile || model("NannyProfile", nannyProfileSchema);
