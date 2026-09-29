"use server";

import { auth } from "@/lib/auth";
import { type Result, ok, err } from "@/lib/result";
import { listForUser, markRead, markAllRead } from "./service";
import type { NotificationListItem } from "./types";

export async function listNotificationsAction(): Promise<Result<NotificationListItem[]>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  const items = await listForUser(session.user.id);
  return ok(items);
}

export async function markNotificationReadAction(notificationId: string): Promise<Result<null>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  await markRead(session.user.id, notificationId);
  return ok(null);
}

export async function markAllNotificationsReadAction(): Promise<Result<null>> {
  const session = await auth();
  if (!session?.user) return err("auth.errors.unknown");

  await markAllRead(session.user.id);
  return ok(null);
}
