import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "REQUIRED"),
  email: z.string().trim().toLowerCase().email("INVALID_EMAIL"),
  message: z.string().trim().min(5, "REQUIRED"),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
