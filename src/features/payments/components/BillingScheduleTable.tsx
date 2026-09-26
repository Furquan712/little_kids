import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { statusBadgeVariant } from "@/lib/badge-status";
import type { BillingLine } from "../types";

export function BillingScheduleTable({
  lines,
  showReceipts = false,
  hideOverdueLabel = false,
}: {
  lines: BillingLine[];
  showReceipts?: boolean;
  hideOverdueLabel?: boolean;
}) {
  const t = useTranslations("payments.schedule");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("period")}</TableHead>
          <TableHead>{t("dueDate")}</TableHead>
          <TableHead>{t("expected")}</TableHead>
          <TableHead>{t("paid")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          {showReceipts && <TableHead>{t("receipt")}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => {
          const displayStatus = hideOverdueLabel && line.status === "OVERDUE" ? "DUE" : line.status;
          return (
            <TableRow key={line.periodMonth}>
              <TableCell>{line.periodMonth}</TableCell>
              <TableCell>{new Date(line.dueDate).toLocaleDateString("pt-AO")}</TableCell>
              <TableCell>{line.expectedAmount.toLocaleString("pt-AO")} AOA</TableCell>
              <TableCell>{line.paidAmount.toLocaleString("pt-AO")} AOA</TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(displayStatus)}>{t(`status${displayStatus}` as never)}</Badge>
              </TableCell>
              {showReceipts && (
                <TableCell>
                  {line.payments.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {line.payments.map((p) => (
                        <a
                          key={p.id}
                          href={`/api/payments/${p.id}/receipt`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-plat-primary-strong underline"
                        >
                          {t("downloadReceipt")}
                        </a>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
        {lines.length === 0 && (
          <TableRow>
            <TableCell colSpan={showReceipts ? 6 : 5} className="text-center text-plat-ink-muted">
              {t("noLines")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
