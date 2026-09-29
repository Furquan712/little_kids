export type TicketMessage = {
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type TicketListItem = {
  id: string;
  type: string;
  status: string;
  openedByName: string;
  placementId: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetail = TicketListItem & {
  openedById: string;
  resolution: string | null;
  messages: TicketMessage[];
};

export type PlacementOption = {
  id: string;
  label: string;
  status: string;
};
