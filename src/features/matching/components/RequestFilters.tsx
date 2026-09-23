"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STATUSES = ["NEW", "MATCHING", "INTERVIEWING", "PROPOSED", "APPROVED", "CONTRACTED", "CLOSED"];

export function RequestFilters({ initialStatus }: { initialStatus?: string }) {
  const t = useTranslations("admin.requests");
  const tStatus = useTranslations("familyDashboard.requestStatus");
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus ?? "");

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{t("statusLabel")}</Label>
      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          const params = new URLSearchParams();
          if (value) params.set("status", value);
          router.push(`/admin/pedidos?${params.toString()}`);
        }}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {tStatus(s as never)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
