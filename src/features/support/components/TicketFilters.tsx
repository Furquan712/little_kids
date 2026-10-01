"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TICKET_STATUSES, TICKET_TYPES } from "../schemas";

export function TicketFilters({ initialStatus, initialType }: { initialStatus?: string; initialType?: string }) {
  const t = useTranslations("support");
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus ?? "");
  const [type, setType] = useState(initialType ?? "");

  function push(nextStatus: string, nextType: string) {
    const params = new URLSearchParams();
    if (nextStatus) params.set("status", nextStatus);
    if (nextType) params.set("type", nextType);
    router.push(`/admin/suporte?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>{t("admin.filterStatus")}</Label>
        <Select
          value={status || "all"}
          onValueChange={(value) => {
            const next = value === "all" ? "" : value;
            setStatus(next);
            push(next, type);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allStatuses")}</SelectItem>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("admin.filterType")}</Label>
        <Select
          value={type || "all"}
          onValueChange={(value) => {
            const next = value === "all" ? "" : value;
            setType(next);
            push(status, next);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.allTypes")}</SelectItem>
            {TICKET_TYPES.map((ticketType) => (
              <SelectItem key={ticketType} value={ticketType}>
                {t(`types.${ticketType}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
