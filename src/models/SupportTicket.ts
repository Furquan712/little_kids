import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const ticketMessageSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const supportTicketSchema = new Schema(
  {
    openedById: { type: Types.ObjectId, ref: "User", required: true },
    placementId: { type: Types.ObjectId, ref: "Placement" },
    type: { type: String, enum: ["ISSUE", "COMPLAINT", "REPLACEMENT"], required: true },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },
    resolution: { type: String },
    messages: { type: [ticketMessageSchema], default: [] },
  },
  { timestamps: true },
);

export type SupportTicketDocument = InferSchemaType<typeof supportTicketSchema>;

export const SupportTicket = models.SupportTicket || model("SupportTicket", supportTicketSchema);
