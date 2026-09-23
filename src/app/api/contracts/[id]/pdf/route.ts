import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Contract } from "@/models/Contract";
import { Placement } from "@/models/Placement";
import { getStorageService } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const contract = await Contract.findById(id);
  if (!contract) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const placement = await Placement.findById(contract.placementId);
  if (!placement) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const expectedUserId = contract.party === "FAMILY" ? placement.familyId : placement.nannyId;
  const isParty = expectedUserId.toString() === session.user.id;

  if (!isAdmin && !isParty) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const key = contract.signedPdfKey || contract.pdfKey;
  if (!key) {
    return NextResponse.json({ error: "NOT_AVAILABLE" }, { status: 404 });
  }

  const url = await getStorageService().getSignedDownloadUrl(key, 60);
  return NextResponse.redirect(url);
}
