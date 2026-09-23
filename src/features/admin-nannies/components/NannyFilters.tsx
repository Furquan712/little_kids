"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ANGOLA_PROVINCES } from "@/lib/angola-locations";

const STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "NEEDS_CORRECTION",
  "NOT_AVAILABLE",
  "IN_NEGOTIATION",
  "PLACED",
];

export function NannyFilters({ initial }: { initial: { status?: string; province?: string; verified?: string } }) {
  const t = useTranslations("admin.nannies");
  const router = useRouter();
  const [status, setStatus] = useState(initial.status ?? "");
  const [province, setProvince] = useState(initial.province ?? "");
  const [verified, setVerified] = useState(initial.verified ?? "");

  function apply(next: { status?: string; province?: string; verified?: string }) {
    const params = new URLSearchParams();
    const merged = { status, province, verified, ...next };
    if (merged.status) params.set("status", merged.status);
    if (merged.province) params.set("province", merged.province);
    if (merged.verified) params.set("verified", merged.verified);
    router.push(`/admin/babas?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>{t("statusLabel")}</Label>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            apply({ status: v });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("provinceLabel")}</Label>
        <Select
          value={province}
          onValueChange={(v) => {
            setProvince(v);
            apply({ province: v });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {ANGOLA_PROVINCES.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("verifiedLabel")}</Label>
        <Select
          value={verified}
          onValueChange={(v) => {
            setVerified(v);
            apply({ verified: v });
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sim</SelectItem>
            <SelectItem value="false">Não</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
