import { connectToDatabase } from "@/lib/db";
import { SupportTicket } from "@/models/SupportTicket";
import { Placement } from "@/models/Placement";
import { NannyRequest } from "@/models/NannyRequest";
import { User } from "@/models/User";
import type { CreateTicketInput, TicketFiltersInput } from "./schemas";
import type { TicketDetail, TicketListItem, TicketMessage, PlacementOption } from "./types";

type TicketLike = {
  _id: { toString(): string };
  openedById: { toString(): string };
  placementId?: { toString(): string } | null;
  assignedToId?: { toString(): string } | null;
  type: string;
  status: string;
  resolution?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

async function namesFor(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const users = await User.find({ _id: { $in: userIds } });
  return new Map(users.map((u) => [u._id.toString(), u.fullName]));
}

async function toListItems(tickets: TicketLike[]): Promise<TicketListItem[]> {
  const ids = new Set<string>();
  for (const t of tickets) {
    ids.add(t.openedById.toString());
    if (t.assignedToId) ids.add(t.assignedToId.toString());
  }
  const names = await namesFor(Array.from(ids));

  return tickets.map((t) => ({
    id: t._id.toString(),
    type: t.type,
    status: t.status,
    openedByName: names.get(t.openedById.toString()) ?? "—",
    placementId: t.placementId ? t.placementId.toString() : null,
    assignedToName: t.assignedToId ? (names.get(t.assignedToId.toString()) ?? "—") : null,
    createdAt: t.createdAt ? t.createdAt.toISOString() : "",
    updatedAt: t.updatedAt ? t.updatedAt.toISOString() : "",
  }));
}

export async function createTicket(openedById: string, input: CreateTicketInput) {
  await connectToDatabase();
  return SupportTicket.create({
    openedById,
    placementId: input.placementId || undefined,
    type: input.type,
    messages: [{ authorId: openedById, body: input.message, createdAt: new Date() }],
  });
}

export async function listTicketsForUser(userId: string): Promise<TicketListItem[]> {
  await connectToDatabase();
  const tickets = await SupportTicket.find({ openedById: userId }).sort({ createdAt: -1 });
  return toListItems(tickets);
}

export async function listAllTickets(filters: TicketFiltersInput): Promise<TicketListItem[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
  return toListItems(tickets);
}

export async function getTicketDetail(
  ticketId: string,
  requester: { id: string; role: string },
): Promise<TicketDetail | null> {
  await connectToDatabase();
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) return null;
  if (requester.role !== "ADMIN" && ticket.openedById.toString() !== requester.id) return null;

  const ids = new Set<string>([ticket.openedById.toString()]);
  if (ticket.assignedToId) ids.add(ticket.assignedToId.toString());
  for (const m of ticket.messages) ids.add(m.authorId.toString());
  const names = await namesFor(Array.from(ids));

  const messages: TicketMessage[] = ticket.messages.map(
    (m: { authorId: { toString(): string }; body: string; createdAt?: Date | null }) => ({
      authorId: m.authorId.toString(),
      authorName: names.get(m.authorId.toString()) ?? "—",
      body: m.body,
      createdAt: m.createdAt ? m.createdAt.toISOString() : "",
    }),
  );

  return {
    id: ticket._id.toString(),
    type: ticket.type,
    status: ticket.status,
    openedById: ticket.openedById.toString(),
    openedByName: names.get(ticket.openedById.toString()) ?? "—",
    placementId: ticket.placementId ? ticket.placementId.toString() : null,
    assignedToName: ticket.assignedToId ? (names.get(ticket.assignedToId.toString()) ?? "—") : null,
    resolution: ticket.resolution ?? null,
    createdAt: ticket.createdAt ? ticket.createdAt.toISOString() : "",
    updatedAt: ticket.updatedAt ? ticket.updatedAt.toISOString() : "",
    messages,
  };
}

export async function addMessage(
  ticketId: string,
  authorId: string,
  body: string,
  requester: { id: string; role: string },
) {
  await connectToDatabase();
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) return { ok: false as const };
  if (requester.role !== "ADMIN" && ticket.openedById.toString() !== requester.id) return { ok: false as const };

  ticket.messages.push({ authorId, body, createdAt: new Date() });
  if (requester.role === "ADMIN" && ticket.status === "OPEN") ticket.status = "IN_PROGRESS";
  await ticket.save();
  return { ok: true as const, ticket };
}

export async function assignTicket(ticketId: string, adminId: string) {
  await connectToDatabase();
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) return null;
  ticket.assignedToId = adminId;
  if (ticket.status === "OPEN") ticket.status = "IN_PROGRESS";
  await ticket.save();
  return ticket;
}

export async function updateStatus(ticketId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") {
  await connectToDatabase();
  return SupportTicket.findByIdAndUpdate(ticketId, { status }, { new: true });
}

export async function resolveTicket(ticketId: string, resolution: string) {
  await connectToDatabase();
  return SupportTicket.findByIdAndUpdate(ticketId, { status: "RESOLVED", resolution }, { new: true });
}

/**
 * Resolving a REPLACEMENT ticket doesn't just close it — it re-opens the
 * family's original need as a fresh request (copying the old request's
 * requirements verbatim) and marks the old placement REPLACED, so the
 * admin can re-run matching without the family re-typing their request.
 */
export async function resolveReplacementTicket(ticketId: string, resolution: string) {
  await connectToDatabase();
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket || ticket.type !== "REPLACEMENT" || !ticket.placementId) {
    return { ok: false as const, error: "INVALID_TICKET" as const };
  }

  const placement = await Placement.findById(ticket.placementId);
  if (!placement) return { ok: false as const, error: "PLACEMENT_NOT_FOUND" as const };

  const oldRequest = await NannyRequest.findById(placement.requestId);
  if (!oldRequest) return { ok: false as const, error: "REQUEST_NOT_FOUND" as const };

  const newRequest = await NannyRequest.create({
    familyId: oldRequest.familyId,
    childrenAges: oldRequest.childrenAges,
    needs: oldRequest.needs,
    schedule: oldRequest.schedule,
    liveIn: oldRequest.liveIn,
    startDate: oldRequest.startDate,
    budgetMin: oldRequest.budgetMin,
    budgetMax: oldRequest.budgetMax,
    specialRequirements: oldRequest.specialRequirements,
    status: "NEW",
  });

  placement.status = "REPLACED";
  placement.endDate = new Date();
  await placement.save();

  ticket.status = "RESOLVED";
  ticket.resolution = resolution;
  await ticket.save();

  return {
    ok: true as const,
    newRequestId: newRequest._id.toString(),
    familyId: oldRequest.familyId.toString(),
    openedById: ticket.openedById.toString(),
  };
}

export async function listPlacementOptionsForUser(
  userId: string,
  role: "FAMILY" | "NANNY",
): Promise<PlacementOption[]> {
  await connectToDatabase();
  const placements = await Placement.find(role === "FAMILY" ? { familyId: userId } : { nannyId: userId }).sort({
    createdAt: -1,
  });

  const otherIds = placements.map((p) => (role === "FAMILY" ? p.nannyId.toString() : p.familyId.toString()));
  const names = await namesFor(otherIds);

  return placements.map((p) => ({
    id: p._id.toString(),
    label: names.get((role === "FAMILY" ? p.nannyId : p.familyId).toString()) ?? "—",
    status: p.status,
  }));
}
