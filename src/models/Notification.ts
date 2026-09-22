import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String },
    readAt: { type: Date },
    channelsSent: {
      type: [String],
      enum: ["IN_APP", "EMAIL", "SMS"],
      default: [],
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, readAt: 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const Notification = models.Notification || model("Notification", notificationSchema);
