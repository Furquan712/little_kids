import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unreadCount } from "@/features/notifications/service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const count = await unreadCount(session.user.id);
  return NextResponse.json({ count });
}
