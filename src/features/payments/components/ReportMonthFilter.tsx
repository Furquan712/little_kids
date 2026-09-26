"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ReportMonthFilter({ month }: { month: string }) {
  const t = useTranslations("payments.reports");
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>{t("monthLabel")}</Label>
        <Input
          type="month"
          defaultValue={month}
          onChange={(e) => router.push(`/admin/relatorios?month=${e.target.value}`)}
          className="w-48"
        />
      </div>
      <Button asChild variant="outline">
        <a href={`/api/reports/monthly?month=${month}`}>{t("exportCsv")}</a>
      </Button>
    </div>
  );
}
