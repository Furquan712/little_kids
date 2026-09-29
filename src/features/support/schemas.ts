import { z } from "zod";

export const TICKET_TYPES = ["ISSUE", "COMPLAINT", "REPLACEMENT"] as const;
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

export const createTicketSchema = z.object({
  type: z.enum(TICKET_TYPES),
  placementId: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(1, "REQUIRED").max(2000),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const replyMessageSchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().trim().min(1, "REQUIRED").max(2000),
});
export type ReplyMessageInput = z.infer<typeof replyMessageSchema>;

export const resolveTicketSchema = z.object({
  ticketId: z.string().min(1),
  resolution: z.string().trim().min(1, "REQUIRED").max(2000),
});
export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>;

export const ticketFiltersSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  type: z.enum(TICKET_TYPES).optional(),
});
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>;
