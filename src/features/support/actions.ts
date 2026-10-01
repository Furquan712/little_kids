"use server";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { auditLog } from "@/lib/audit";
import { notify, notifyAdmins } from "@/lib/notify";
import { type Result, ok, err } from "@/lib/result";
import {
  createTicketSchema,
  replyMessageSchema,
  resolveTicketSchema,
  ticketFiltersSchema,
  type CreateTicketInput,
  type ReplyMessageInput,
  type ResolveTicketInput,
  type TicketFiltersInput,
} from "./schemas";
import {
  createTicket,
  listTicketsForUser,
  listAllTickets,
  getTicketDetail,
  addMessage,
  assignTicket,
  resolveTicket,
  resolveReplacementTicket,
  listPlacementOptionsForUser,
} from "./service";
import type { TicketDetail, TicketListItem, PlacementOption } from "./types";

export async function createTicketAction(input: CreateTicketInput): Promise<Result<{ ticketId: string }>> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "FAMILY" && session.user.role !== "NANNY")) {
    return err("auth.errors.unknown");
  }

  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const ticket = await createTicket(session.user.id, parsed.data);
  await notifyAdmins("ADMIN_NEW_TICKET", { type: parsed.data.type });

  return ok({ ticketId: ticket._id.toString() });
}

export async function listMyTicketsAction(): Promise<Result<TicketListItem[]>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const items = await listTicketsForUser(session.user.id);
  return ok(items);
}

export async function listAllTicketsAction(filters: TicketFiltersInput): Promise<Result<TicketListItem[]>> {
  const authResult = await requireRole("ADMIN");
  if (!authResult.ok) return err("auth.errors.unknown");

  const parsed = ticketFiltersSchema.safeParse(filters);
  if (!parsed.success) return err("auth.errors.unknown");

  const items = await listAllTickets(parsed.data);
  return ok(items);
}

export async function getTicketDetailAction(ticketId: string): Promise<Result<TicketDetail>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const detail = await getTicketDetail(ticketId, { id: session.user.id, role: session.user.role });
  if (!detail) return err("auth.errors.unknown");
  return ok(detail);
}

export async function replyToTicketAction(input: ReplyMessageInput): Promise<Result<null>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const parsed = replyMessageSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await addMessage(parsed.data.ticketId, session.user.id, parsed.data.message, {
    id: session.user.id,
    role: session.user.role,
  });
  if (!result.ok) return err("auth.errors.unknown");

  if (session.user.role === "ADMIN") {
    await notify(result.ticket.openedById.toString(), "TICKET_REPLY", { ticketId: parsed.data.ticketId });
  }

  return ok(null);
}

export async function assignTicketAction(ticketId: string): Promise<Result<null>> {
  const authResult = await requireRole("ADMIN");
  if (!authResult.ok) return err("auth.errors.unknown");

  const ticket = await assignTicket(ticketId, authResult.user.id);
  if (!ticket) return err("auth.errors.unknown");

  await auditLog(authResult.user.id, "ASSIGN_TICKET", "SupportTicket", ticketId, null, {
    assignedToId: authResult.user.id,
  });
  return ok(null);
}

export async function resolveTicketAction(input: ResolveTicketInput): Promise<Result<null>> {
  const authResult = await requireRole("ADMIN");
  if (!authResult.ok) return err("auth.errors.unknown");

  const parsed = resolveTicketSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const ticket = await resolveTicket(parsed.data.ticketId, parsed.data.resolution);
  if (!ticket) return err("auth.errors.unknown");

  await auditLog(authResult.user.id, "RESOLVE_TICKET", "SupportTicket", parsed.data.ticketId, null, {
    resolution: parsed.data.resolution,
  });
  await notify(ticket.openedById.toString(), "TICKET_RESOLVED", { ticketId: parsed.data.ticketId });

  return ok(null);
}

export async function resolveReplacementTicketAction(
  input: ResolveTicketInput,
): Promise<Result<{ newRequestId: string }>> {
  const authResult = await requireRole("ADMIN");
  if (!authResult.ok) return err("auth.errors.unknown");

  const parsed = resolveTicketSchema.safeParse(input);
  if (!parsed.success) return err("auth.errors.unknown");

  const result = await resolveReplacementTicket(parsed.data.ticketId, parsed.data.resolution);
  if (!result.ok) return err("auth.errors.unknown");

  await auditLog(authResult.user.id, "RESOLVE_REPLACEMENT_TICKET", "SupportTicket", parsed.data.ticketId, null, {
    newRequestId: result.newRequestId,
  });
  await notify(result.openedById, "TICKET_RESOLVED", { ticketId: parsed.data.ticketId });
  await notifyAdmins("ADMIN_NEW_REQUEST", {});

  return ok({ newRequestId: result.newRequestId });
}

export async function listMyPlacementOptionsAction(): Promise<Result<PlacementOption[]>> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "FAMILY" && session.user.role !== "NANNY")) {
    return err("auth.errors.unknown");
  }

  const items = await listPlacementOptionsForUser(session.user.id, session.user.role);
  return ok(items);
}
