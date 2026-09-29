import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/Notification";
import type { NotificationListItem } from "./types";

export async function listForUser(userId: string): Promise<NotificationListItem[]> {
  await connectToDatabase();
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);

  return notifications.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link ?? null,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt ? n.createdAt.toISOString() : "",
  }));
}

export async function unreadCount(userId: string): Promise<number> {
  await connectToDatabase();
  return Notification.countDocuments({ userId, readAt: null });
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  await connectToDatabase();
  await Notification.updateOne({ _id: notificationId, userId }, { readAt: new Date() });
}

export async function markAllRead(userId: string): Promise<void> {
  await connectToDatabase();
  await Notification.updateMany({ userId, readAt: null }, { readAt: new Date() });
}
