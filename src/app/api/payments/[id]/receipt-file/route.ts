import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { Placement } from "@/models/Placement";
import { getStorageService } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const payment = await Payment.findById(id);
  if (!payment || !payment.receiptFileKey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const placement = await Placement.findById(payment.placementId);
  if (!placement) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isFamilyParty = session.user.role === "FAMILY" && placement.familyId.toString() === session.user.id;
  const isNannyParty = session.user.role === "NANNY" && placement.nannyId.toString() === session.user.id;

  if (!isAdmin && !isFamilyParty && !isNannyParty) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const url = await getStorageService().getSignedDownloadUrl(payment.receiptFileKey, 60);
  return NextResponse.redirect(url);
}
