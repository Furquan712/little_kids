import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentForReceipt } from "@/features/payments/service";
import { renderReceiptPdf } from "@/lib/pdf/receiptTemplate";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const { id } = await params;
  const record = await getPaymentForReceipt(id);
  if (!record) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { payment, placement, family, nanny } = record;
  const isAdmin = session.user.role === "ADMIN";
  const isFamilyParty = session.user.role === "FAMILY" && placement.familyId.toString() === session.user.id;
  const isNannyParty = session.user.role === "NANNY" && placement.nannyId.toString() === session.user.id;

  if (!isAdmin && !isFamilyParty && !isNannyParty) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const buffer = await renderReceiptPdf({
    receiptNumber: payment._id.toString().slice(-8).toUpperCase(),
    direction: payment.direction as "IN_FROM_FAMILY" | "OUT_TO_NANNY",
    periodMonth: payment.periodMonth,
    amount: payment.amount,
    method: payment.method ?? null,
    reference: payment.reference ?? null,
    paidAt: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("pt-AO") : "—",
    familyName: family.fullName,
    nannyName: nanny.fullName,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${payment._id.toString()}.pdf"`,
    },
  });
}
