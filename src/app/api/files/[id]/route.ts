import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { NannyDocument } from "@/models/NannyDocument";
import { NannyProfile } from "@/models/NannyProfile";
import { getStorageService } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const doc = await NannyDocument.findById(id);
  if (!doc) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isOwner = doc.nannyUserId.toString() === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  let isPublicToFamily = false;
  if (!isOwner && !isAdmin && session.user.role === "FAMILY" && doc.visibility === "PUBLIC") {
    const profile = await NannyProfile.findOne({ userId: doc.nannyUserId });
    isPublicToFamily = profile?.status === "APPROVED";
  }

  if (!isOwner && !isAdmin && !isPublicToFamily) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = await getStorageService().getSignedDownloadUrl(doc.fileKey, 60);
  return NextResponse.redirect(url);
}
