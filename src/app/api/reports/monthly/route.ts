import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMonthlyReport, buildReportCsv } from "@/features/payments/service";
import { reportFiltersSchema } from "@/features/payments/schemas";
import { monthKey } from "@/lib/billing";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportFiltersSchema.safeParse({ month: searchParams.get("month") || undefined });
  const month = parsed.success && parsed.data.month ? parsed.data.month : monthKey(new Date());

  const report = await getMonthlyReport(month);
  const csv = buildReportCsv(report);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${month}.csv"`,
    },
  });
}
